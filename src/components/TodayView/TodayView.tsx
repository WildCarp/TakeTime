import { useMemo } from 'react';
import { useData } from '../../stores/dataStore';
import { parseDateTime, getDateString } from '../../utils/timeUtils';
import { TASK_BLOCK_COLORS, TASK_BLOCK_COLORS_DARK } from '../../constants';
import './TodayView.css';

interface TodayViewProps {
  theme: 'light' | 'dark';
  onExitFloating: () => void;
}

export default function TodayView({ theme, onExitFloating }: TodayViewProps) {
  const { data, getTagGroup } = useData();
  const colors = theme === 'dark' ? TASK_BLOCK_COLORS_DARK : TASK_BLOCK_COLORS;

  const todayStr = getDateString(new Date());
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

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
        const startHour = task.isRecurring
          ? start.getHours() + start.getMinutes() / 60
          : start.getHours() + start.getMinutes() / 60;
        const endHour = task.isRecurring
          ? end.getHours() + end.getMinutes() / 60
          : end.getHours() + end.getMinutes() / 60;
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

  // 时间轴范围：显示 6:00 - 24:00（或根据任务自适应）
  const timeStart = 6;
  const timeEnd = 24;
  const timeRange = timeEnd - timeStart;

  return (
    <div className="today-view" data-tauri-drag-region>
      {/* 顶部信息栏 */}
      <div className="today-view-header" data-tauri-drag-region>
        <span className="today-view-title" data-tauri-drag-region>
          📅 今日日程
        </span>
        <span className="today-view-date" data-tauri-drag-region>
          {todayStr.slice(5).replace('/', '月') + '日'}
        </span>
        <button className="today-view-exit" onClick={onExitFloating} data-tooltip="退出悬浮">
          ✕
        </button>
      </div>

      {/* 时间轴 */}
      <div className="today-view-timeline">
        {/* 时间刻度 */}
        {Array.from({ length: timeRange + 1 }, (_, i) => i + timeStart).map((hour) => (
          <div
            key={hour}
            className="today-view-tick"
            style={{ left: `${((hour - timeStart) / timeRange) * 100}%` }}
          >
            <span className="today-view-tick-label">{hour}</span>
          </div>
        ))}

        {/* 任务条 */}
        {todayTasks.map((task) => {
          const left = Math.max(0, ((task.startHour - timeStart) / timeRange) * 100);
          const width = Math.min(100 - left, ((task.endHour - task.startHour) / timeRange) * 100);
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
