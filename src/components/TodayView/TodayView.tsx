import { useState, useMemo, useCallback, useRef } from 'react';
import { useData } from '../../stores/dataStore';
import { parseDateTime, getDateString } from '../../utils/timeUtils';
import { TASK_BLOCK_COLORS, TASK_BLOCK_COLORS_DARK } from '../../constants';
import './TodayView.css';

interface TodayViewProps {
  theme: 'light' | 'dark';
  onExitFloating: () => void;
}

export default function TodayView({ theme, onExitFloating }: TodayViewProps) {
  const { data, getTagGroup, toggleTaskComplete } = useData();
  const colors = theme === 'dark' ? TASK_BLOCK_COLORS_DARK : TASK_BLOCK_COLORS;

  const todayStr = getDateString(new Date());
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // 缩放和平移状态：默认以【现在】为中心显示5小时
  const [timeStart, setTimeStart] = useState(() => {
    const center = currentHour;
    const start = Math.max(0, center - 2.5);
    const end = Math.min(24, start + 5);
    return end === 24 ? 24 - 5 : start;
  });
  const [timeEnd, setTimeEnd] = useState(() => {
    const center = currentHour;
    const start = Math.max(0, center - 2.5);
    const end = Math.min(24, start + 5);
    return end === 24 ? 24 : Math.min(24, start + 5);
  });
  const timeRange = timeEnd - timeStart;

  // 拖拽平移状态
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startTimeStart: 0, startTimeEnd: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    // 鼠标在时间轴中的比例位置
    const ratio = (e.clientX - rect.left) / rect.width;
    const currentRange = timeEnd - timeStart;
    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87; // 缩小/放大
    const newRange = Math.max(2, Math.min(24, currentRange * zoomFactor));

    // 以鼠标位置为中心缩放
    const pivot = timeStart + ratio * currentRange;
    let newStart = pivot - ratio * newRange;
    let newEnd = pivot + (1 - ratio) * newRange;

    // 边界限制
    if (newStart < 0) { newEnd -= newStart; newStart = 0; }
    if (newEnd > 24) { newStart -= (newEnd - 24); newEnd = 24; }
    newStart = Math.max(0, newStart);
    newEnd = Math.min(24, newEnd);

    setTimeStart(newStart);
    setTimeEnd(newEnd);
  }, [timeStart, timeEnd]);

  // 拖拽平移开始
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // 只响应时间轴区域的拖拽，不影响任务条
    if ((e.target as HTMLElement).closest('.today-view-task')) return;
    setDragging(true);
    dragRef.current = { startX: e.clientX, startTimeStart: timeStart, startTimeEnd: timeEnd };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [timeStart, timeEnd]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = e.clientX - dragRef.current.startX;
    const hoursPerPixel = (dragRef.current.startTimeEnd - dragRef.current.startTimeStart) / rect.width;
    const deltaHours = -dx * hoursPerPixel;

    let newStart = dragRef.current.startTimeStart + deltaHours;
    let newEnd = dragRef.current.startTimeEnd + deltaHours;

    // 边界限制
    if (newStart < 0) { newEnd -= newStart; newStart = 0; }
    if (newEnd > 24) { newStart -= (newEnd - 24); newEnd = 24; }

    setTimeStart(Math.max(0, newStart));
    setTimeEnd(Math.min(24, newEnd));
  }, [dragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // 获取今天的任务（包括周期性任务）
  const todayTasks = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDay();

    return data.tasks
      .filter((task) => {
        if (task.completed) return false;
        if (task.isRecurring) {
          return task.weekdays?.includes(todayDay);
        }
        const taskDateStr = task.startTime.split(' ')[0];
        return taskDateStr === todayStr;
      })
      .map((task) => {
        const start = parseDateTime(task.startTime);
        const end = parseDateTime(task.endTime);
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        const group = getTagGroup(task.tagGroupId);
        const colorKey = group?.color || 'teal';
        const color = colors[colorKey] || colors['teal'];
        return {
          ...task,
          startHour,
          endHour,
          bgColor: color.bg,
          textColor: color.text,
          emoji: group?.emoji || '📋',
        };
      })
      .sort((a, b) => a.startHour - b.startHour);
  }, [data.tasks, todayStr, colors, getTagGroup]);

  // 计算时间刻度标签（根据缩放级别调整密度）
  const tickStep = timeRange <= 4 ? 0.5 : timeRange <= 8 ? 1 : timeRange <= 16 ? 2 : 3;
  const tickStart = Math.ceil(timeStart / tickStep) * tickStep;
  const ticks: number[] = [];
  for (let h = tickStart; h <= timeEnd; h += tickStep) {
    ticks.push(h);
  }

  return (
    <div className="today-view" data-tauri-drag-region>
      {/* 顶部信息栏 */}
      <div className="today-view-header" data-tauri-drag-region>
        <span className="today-view-title" data-tauri-drag-region>
          今日日程
        </span>
        <span className="today-view-date" data-tauri-drag-region>
          {todayStr.slice(5).replace('/', '月') + '日'}
        </span>
        <button className="today-view-exit" onClick={onExitFloating} data-tooltip="退出悬浮">
          ✕
        </button>
      </div>

      {/* 时间轴（支持缩放和平移） */}
      <div
        className={`today-view-timeline ${dragging ? 'dragging' : ''}`}
        ref={timelineRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* 时间刻度 */}
        {ticks.map((hour) => (
          <div
            key={hour}
            className="today-view-tick"
            style={{ left: `${((hour - timeStart) / timeRange) * 100}%` }}
          >
            <span className="today-view-tick-label">
              {Number.isInteger(hour) ? hour : `${Math.floor(hour)}:30`}
            </span>
          </div>
        ))}

        {/* 任务条 */}
        {todayTasks.map((task) => {
          const left = ((task.startHour - timeStart) / timeRange) * 100;
          const width = ((task.endHour - task.startHour) / timeRange) * 100;
          // 只渲染可见范围内的任务
          if (left + width < 0 || left > 100) return null;
          return (
            <div
              key={task.id}
              className="today-view-task"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: task.bgColor,
                color: task.textColor,
              }}
              title={`${task.emoji} ${task.name} (${Math.floor(task.startHour)}:${String(Math.round((task.startHour % 1) * 60)).padStart(2, '0')}-${Math.floor(task.endHour)}:${String(Math.round((task.endHour % 1) * 60)).padStart(2, '0')})`}
            >
              <div
                className="today-view-checkbox"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id); }}
              >
                ✓
              </div>
              <span className="today-view-task-name">{task.emoji} {task.name}</span>
            </div>
          );
        })}

        {/* 当前时间指示线 */}
        {currentHour >= timeStart && currentHour <= timeEnd && (
          <div
            className="today-view-now"
            style={{ left: `${((currentHour - timeStart) / timeRange) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
