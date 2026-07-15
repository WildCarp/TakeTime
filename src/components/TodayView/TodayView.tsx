import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useData } from '../../stores/dataStore';
import { parseDateTime, getDateString } from '../../utils/timeUtils';
import { TASK_BLOCK_COLORS, TASK_BLOCK_COLORS_DARK } from '../../constants';
import { playCompleteSound } from '../../utils/completeSound';
import './TodayView.css';

interface TodayViewProps {
  theme: 'light' | 'dark';
  onExitFloating: () => void;
}

export default function TodayView({ theme, onExitFloating }: TodayViewProps) {
  const { data, getTagGroup, toggleTaskComplete, updateTask } = useData();
  const colors = theme === 'dark' ? TASK_BLOCK_COLORS_DARK : TASK_BLOCK_COLORS;

  const todayStr = getDateString(new Date());

  // 【现在】指示线：每10秒更新
  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);
  const currentHour = nowTime.getHours() + nowTime.getMinutes() / 60;

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

  // 右键拖拽平移状态
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startTimeStart: 0, startTimeEnd: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  // 左键拖拽拉伸任务状态
  const [taskDrag, setTaskDrag] = useState<{
    taskId: string;
    type: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    origStartHour: number;
    origEndHour: number;
  } | null>(null);

  // 完成动画状态
  const [animatingTaskIds, setAnimatingTaskIds] = useState<Set<string>>(new Set());

  // 窗口聚焦状态（控制退出按钮显示）
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // 处理勾选完成（带音效）
  const handleCheckboxClick = useCallback((taskId: string, completed: boolean) => {
    if (!completed) {
      // 触发完成动画和音效
      playCompleteSound();
      setAnimatingTaskIds((prev) => new Set(prev).add(taskId));
      setTimeout(() => {
        setAnimatingTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 800);
    }
    toggleTaskComplete(taskId);
  }, [toggleTaskComplete]);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const ratio = (e.clientX - rect.left) / rect.width;
    const currentRange = timeEnd - timeStart;
    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;
    const newRange = Math.max(2, Math.min(24, currentRange * zoomFactor));

    const pivot = timeStart + ratio * currentRange;
    let newStart = pivot - ratio * newRange;
    let newEnd = pivot + (1 - ratio) * newRange;

    if (newStart < 0) { newEnd -= newStart; newStart = 0; }
    if (newEnd > 24) { newStart -= (newEnd - 24); newEnd = 24; }
    newStart = Math.max(0, newStart);
    newEnd = Math.min(24, newEnd);

    setTimeStart(newStart);
    setTimeEnd(newEnd);
  }, [timeStart, timeEnd]);

  // 右键拖拽平移
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // 只响应右键（button === 2）进行平移
    if (e.button !== 2) return;
    e.preventDefault();
    setDragging(true);
    dragRef.current = { startX: e.clientX, startTimeStart: timeStart, startTimeEnd: timeEnd };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [timeStart, timeEnd]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // 右键平移
    if (dragging) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = e.clientX - dragRef.current.startX;
      const hoursPerPixel = (dragRef.current.startTimeEnd - dragRef.current.startTimeStart) / rect.width;
      const deltaHours = -dx * hoursPerPixel;
      let newStart = dragRef.current.startTimeStart + deltaHours;
      let newEnd = dragRef.current.startTimeEnd + deltaHours;
      if (newStart < 0) { newEnd -= newStart; newStart = 0; }
      if (newEnd > 24) { newStart -= (newEnd - 24); newEnd = 24; }
      setTimeStart(Math.max(0, newStart));
      setTimeEnd(Math.min(24, newEnd));
      return;
    }
    // 左键拖拽任务
    if (taskDrag) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = e.clientX - taskDrag.startX;
      const hoursPerPixel = timeRange / rect.width;
      const deltaHours = dx * hoursPerPixel;

      const task = data.tasks.find((t) => t.id === taskDrag.taskId);
      if (!task) return;

      let newStartHour = taskDrag.origStartHour;
      let newEndHour = taskDrag.origEndHour;

      if (taskDrag.type === 'move') {
        const duration = taskDrag.origEndHour - taskDrag.origStartHour;
        newStartHour = Math.max(0, Math.min(24 - duration, taskDrag.origStartHour + deltaHours));
        newEndHour = newStartHour + duration;
      } else if (taskDrag.type === 'resize-left') {
        newStartHour = Math.max(0, Math.min(taskDrag.origEndHour - 0.25, taskDrag.origStartHour + deltaHours));
      } else if (taskDrag.type === 'resize-right') {
        newEndHour = Math.max(taskDrag.origStartHour + 0.25, Math.min(24, taskDrag.origEndHour + deltaHours));
      }

      // 吸附到 15 分钟
      newStartHour = Math.round(newStartHour * 4) / 4;
      newEndHour = Math.round(newEndHour * 4) / 4;

      // 构建新的时间字符串
      const datePart = task.startTime.split(' ')[0];
      const newStartTime = `${datePart} ${String(Math.floor(newStartHour)).padStart(2, '0')}:${String(Math.round((newStartHour % 1) * 60)).padStart(2, '0')}`;
      const newEndTime = `${datePart} ${String(Math.floor(newEndHour)).padStart(2, '0')}:${String(Math.round((newEndHour % 1) * 60)).padStart(2, '0')}`;

      updateTask(task.id, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }
  }, [dragging, taskDrag, timeRange, data.tasks, updateTask]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragging) {
      setDragging(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    if (taskDrag) {
      setTaskDrag(null);
    }
  }, [dragging, taskDrag]);

  // 禁止右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // 任务条左键拖拽开始
  const handleTaskPointerDown = useCallback((e: React.PointerEvent, taskId: string, startHour: number, endHour: number) => {
    if (e.button !== 0) return; // 只响应左键
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const taskWidth = rect.width;

    // 判断拖拽类型：左边缘 resize-left，右边缘 resize-right，中间 move
    let type: 'move' | 'resize-left' | 'resize-right' = 'move';
    if (relX < 8) type = 'resize-left';
    else if (relX > taskWidth - 8) type = 'resize-right';

    setTaskDrag({ taskId, type, startX: e.clientX, origStartHour: startHour, origEndHour: endHour });
    (timelineRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
  }, []);

  // 获取今天的任务（包括已完成的，用于动画）
  const todayTasks = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDay();

    return data.tasks
      .filter((task) => {
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

  // 计算时间刻度标签
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
        <button
          className={`today-view-exit ${focused ? 'visible' : ''}`}
          onClick={onExitFloating}
        >
          ✕
        </button>
      </div>

      {/* 时间轴 */}
      <div
        className={`today-view-timeline ${dragging ? 'dragging' : ''} ${taskDrag ? 'task-dragging' : ''}`}
        ref={timelineRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
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
          if (left + width < 0 || left > 100) return null;
          const isAnimating = animatingTaskIds.has(task.id);
          return (
            <div
              key={task.id}
              className={`today-view-task ${task.completed ? 'completed' : ''} ${isAnimating ? 'complete-anim' : ''}`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: task.bgColor,
                color: task.textColor,
              }}

              onPointerDown={(e) => handleTaskPointerDown(e, task.id, task.startHour, task.endHour)}
            >
              <span className={`today-view-task-name ${task.completed ? 'strikethrough' : ''}`}>
                {task.emoji} {task.name}
              </span>
              <div
                className={`today-view-checkbox ${task.completed ? 'checked' : ''}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); handleCheckboxClick(task.id, task.completed); }}
              >
                {task.completed && '✓'}
              </div>
              {/* 完成动画浮层 */}
              {isAnimating && (
                <span className="today-view-check-float">✓</span>
              )}
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
