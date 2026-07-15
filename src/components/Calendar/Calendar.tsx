import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { useData } from '../../stores/dataStore';
import { useCalendarPan } from '../../hooks/useCalendarPan';
import { useTaskDrag } from '../../hooks/useTaskDrag';
import { CalendarViewState } from '../../hooks/useCalendarZoom';
import { Task } from '../../types';
import { parseDateTime, formatDateLabel, addDays, getDateString, getHourOffset } from '../../utils/timeUtils';
import { checkOverlap } from '../../utils/overlapCheck';
import { playCompleteSound } from '../../utils/completeSound';
import { showToast } from '../Toast/Toast';
import { TASK_BLOCK_COLORS, TASK_BLOCK_COLORS_DARK } from '../../constants';
import TaskBlock from './TaskBlock';
import './Calendar.css';

interface CalendarProps {
  onTaskClick: (task: Task) => void;
  viewState: CalendarViewState;
  zoomTimeAxis: (delta: number, mouseRatio: number) => void;
  zoomDateAxis: (delta: number) => void;
  panView: (daysDelta: number, hoursDelta: number) => void;
  theme: 'light' | 'dark';
}

export default function Calendar({ onTaskClick, viewState, zoomTimeAxis, zoomDateAxis, panView, theme }: CalendarProps) {
  const { data, updateTask, toggleTaskComplete, getTagGroup } = useData();
  const containerRef = useRef<HTMLDivElement>(null);

  // 完成动画状态：记录正在播放动画的任务 ID
  const [animatingTaskIds, setAnimatingTaskIds] = useState<Set<string>>(new Set());

  // "现在"指示线：当前时间
  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 10000); // 每10秒更新
    return () => clearInterval(timer);
  }, []);

  // 包装 toggleTaskComplete，触发所有段的动画
  const handleToggleComplete = useCallback((taskId: string) => {
    const task = data.tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      setAnimatingTaskIds((prev) => new Set(prev).add(taskId));
      setTimeout(() => {
        setAnimatingTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 800);
      // 播放完成提示音
      playCompleteSound();
      showToast('任务已完成', 'success');
    } else if (task && task.completed) {
      showToast('任务已恢复', 'success');
    }
    toggleTaskComplete(taskId);
  }, [data.tasks, toggleTaskComplete]);

  // 动态获取容器尺寸
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });

  // 监听详情面板触发的完成动画事件
  useEffect(() => {
    const handler = (e: Event) => {
      const { taskId } = (e as CustomEvent).detail;
      setAnimatingTaskIds((prev) => new Set(prev).add(taskId));
      setTimeout(() => {
        setAnimatingTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 800);
    };
    window.addEventListener('task-complete-anim', handler);
    return () => window.removeEventListener('task-complete-anim', handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    // 初始化
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => observer.disconnect();
  }, []);

  // 计算像素比例
  const AXIS_LABEL_WIDTH = 80; // 竖轴标签宽度
  const AXIS_LABEL_HEIGHT = 36; // 横轴标签高度

  const timeRange = viewState.endHour - viewState.startHour;
  const pixelsPerHour = useMemo(() => (containerSize.width - AXIS_LABEL_WIDTH) / timeRange, [containerSize.width, timeRange]);
  const pixelsPerDay = useMemo(() => (containerSize.height - AXIS_LABEL_HEIGHT) / viewState.visibleDays, [containerSize.height, viewState.visibleDays]);

  // 右键拖拽平移
  useCalendarPan(panView, containerRef, pixelsPerHour, pixelsPerDay);

  // 任务拖拽更新（含冲突检测）
  const handleTaskDragUpdate = useCallback((id: string, updates: { startTime?: string; endTime?: string }) => {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return;

    const newStart = updates.startTime || task.startTime;
    const newEnd = updates.endTime || task.endTime;

    // 冲突检测
    const conflict = checkOverlap(newStart, newEnd, data.tasks, id);
    if (conflict) return; // 冲突时不更新

    updateTask(id, updates);
  }, [data.tasks, updateTask]);

  const { startDrag, onDragMove, endDrag } = useTaskDrag(handleTaskDragUpdate, pixelsPerHour, pixelsPerDay);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left - AXIS_LABEL_WIDTH;
    const mouseRatioX = mouseX / (rect.width - AXIS_LABEL_WIDTH);

    // 在横轴区域
    if (e.clientY - rect.top < AXIS_LABEL_HEIGHT) {
      zoomTimeAxis(e.deltaY, mouseRatioX);
    }
    // 在竖轴区域
    else if (e.clientX - rect.left < AXIS_LABEL_WIDTH) {
      zoomDateAxis(e.deltaY);
    }
    // 在日程区域
    else {
      zoomTimeAxis(e.deltaY, mouseRatioX);
      zoomDateAxis(e.deltaY);
    }
  }, [zoomTimeAxis, zoomDateAxis]);

  // 生成时间轴标签
  const timeLabels = useMemo(() => {
    const labels: { hour: number; x: number }[] = [];

    // 根据缩放级别决定标签密度（只由 timeRange 决定，不受平移影响）
    const step = timeRange <= 6 ? 1 : timeRange <= 12 ? 2 : 3;

    // 向外扩展一个 step 确保平移时边缘不会出现标签跳动
    const startHourInt = Math.floor(viewState.startHour / step) * step;
    const endHourInt = Math.ceil(viewState.endHour / step) * step;

    for (let h = startHourInt; h <= endHourInt; h += step) {
      const x = (h - viewState.startHour) * pixelsPerHour;
      if (x >= -50 && x <= containerSize.width) {
        labels.push({ hour: h, x });
      }
    }
    return labels;
  }, [viewState.startHour, viewState.endHour, pixelsPerHour, timeRange, containerSize.width]);

  // 生成时间轴小刻度线（根据缩放级别决定密度）
  const timeTicks = useMemo(() => {
    const ticks: { x: number; isMajor: boolean }[] = [];
    // 根据缩放级别决定刻度间距：最大每小时一个，最小每15分钟一个
    let tickMinutes: number;
    if (timeRange <= 6) {
      tickMinutes = 15; // 每15分钟
    } else if (timeRange <= 12) {
      tickMinutes = 30; // 每30分钟
    } else {
      tickMinutes = 60; // 每小时
    }

    const tickHours = tickMinutes / 60;
    const startTick = Math.floor(viewState.startHour / tickHours) * tickHours;
    const endTick = Math.ceil(viewState.endHour / tickHours) * tickHours;

    for (let t = startTick; t <= endTick; t += tickHours) {
      const x = (t - viewState.startHour) * pixelsPerHour;
      if (x >= -10 && x <= containerSize.width) {
        const isMajor = Math.abs(t % 1) < 0.001; // 整点为主刻度
        ticks.push({ x, isMajor });
      }
    }
    return ticks;
  }, [viewState.startHour, viewState.endHour, pixelsPerHour, timeRange, containerSize.width]);

  // 生成日期轴标签（支持浮点数偏移平滑滚动）
  const dateLabels = useMemo(() => {
    const labels: { date: Date; y: number; label: string; isToday: boolean }[] = [];
    const today = new Date();
    const todayStr = getDateString(today);
    const dayOffsetPx = -(viewState.dayOffset || 0) * pixelsPerDay;

    // 多渲染一行以确保偏移时不会出现空白
    const totalDays = Math.ceil(viewState.visibleDays) + 2;
    for (let i = -1; i < totalDays; i++) {
      const date = addDays(viewState.startDate, i);
      const y = i * pixelsPerDay + dayOffsetPx;
      labels.push({
        date,
        y,
        label: formatDateLabel(date),
        isToday: getDateString(date) === todayStr,
      });
    }
    return labels;
  }, [viewState.startDate, viewState.visibleDays, viewState.dayOffset, pixelsPerDay]);

  // 计算任务格子位置（支持跨天任务和周期性任务）
  const taskPositions = useMemo(() => {
    const dayOffsetPx = -(viewState.dayOffset || 0) * pixelsPerDay;
    const positions: {
      task: Task;
      x: number;
      y: number;
      width: number;
      height: number;
      isVisible: boolean;
      bgColor: string;
      textColor: string;
      emoji: string;
      segmentType: 'full' | 'first' | 'middle' | 'last';
    }[] = [];

    const totalDays = Math.ceil(viewState.visibleDays) + 3;

    data.tasks.forEach((task) => {
      const tagGroup = getTagGroup(task.tagGroupId);
      const colorKey = tagGroup?.color || 'sky';
      const colorMap = theme === 'dark' ? TASK_BLOCK_COLORS_DARK : TASK_BLOCK_COLORS;
      const colors = colorMap[colorKey] || colorMap.sky;
      const emoji = tagGroup?.emoji || '💼';

      const startHour = getHourOffset(parseDateTime(task.startTime));
      const endHour = getHourOffset(parseDateTime(task.endTime));
      const durationHours = endHour - startHour > 0 ? endHour - startHour : (endHour + 24 - startHour);

      // 周期性任务：在每个可见日中检查是否匹配 weekday
      if (task.isRecurring && task.weekdays && task.weekdays.length > 0) {
        for (let i = -1; i < totalDays; i++) {
          const date = addDays(viewState.startDate, i);
          const dayOfWeek = date.getDay();
          if (!task.weekdays.includes(dayOfWeek)) continue;

          // 检查当天是否有非周期任务与此周期任务时间冲突（非周期任务优先）
          const dateStr = getDateString(date);
          const recurStart = startHour;
          const recurEnd = endHour;
          const hasConflict = data.tasks.some((t) => {
            if (t.id === task.id || t.isRecurring) return false;
            const tStart = parseDateTime(t.startTime);
            const tEnd = parseDateTime(t.endTime);
            if (getDateString(tStart) !== dateStr) return false;
            const tStartH = getHourOffset(tStart);
            const tEndH = getHourOffset(tEnd);
            return tStartH < recurEnd && tEndH > recurStart;
          });
          if (hasConflict) continue;

          const startHourOffset = startHour - viewState.startHour;
          const endHourOffset = endHour - viewState.startHour;

          const isVisible =
            i >= -1 && i < viewState.visibleDays + 1 &&
            endHourOffset > 0 &&
            startHourOffset < timeRange;

          const x = startHourOffset * pixelsPerHour;
          const y = i * pixelsPerDay + dayOffsetPx;
          const width = durationHours * pixelsPerHour;
          const height = pixelsPerDay - 4;

          positions.push({
            task,
            x, y, width, height, isVisible,
            bgColor: colors.bg,
            textColor: colors.text,
            emoji,
            segmentType: 'full',
          });
        }
      } else {
        // 普通任务：支持跨天显示
        const start = parseDateTime(task.startTime);
        const end = parseDateTime(task.endTime);
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const spanDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);

        if (spanDays === 0) {
          // 单天任务
          const startDayOffset = (startDate.getTime() - viewState.startDate.getTime()) / 86400000;
          const startHourOffset = getHourOffset(start) - viewState.startHour;
          const endHourOffset = getHourOffset(end) - viewState.startHour;
          const taskDuration = (end.getTime() - start.getTime()) / 3600000;

          const isVisible =
            startDayOffset >= -2 &&
            startDayOffset < viewState.visibleDays + 2 &&
            endHourOffset > 0 &&
            startHourOffset < timeRange;

          const x = startHourOffset * pixelsPerHour;
          const y = startDayOffset * pixelsPerDay + dayOffsetPx;
          const width = taskDuration * pixelsPerHour;
          const height = pixelsPerDay - 4;

          positions.push({
            task,
            x, y, width, height, isVisible,
            bgColor: colors.bg,
            textColor: colors.text,
            emoji,
            segmentType: 'full',
          });
        } else {
          // 跨天任务：在每一天都显示一个格子
          for (let d = 0; d <= spanDays; d++) {
            const dayDate = addDays(startDate, d);
            const dayOffset = (dayDate.getTime() - viewState.startDate.getTime()) / 86400000;

            // 计算当天的时间范围
            let dayStartHour: number;
            let dayEndHour: number;
            if (d === 0) {
              dayStartHour = getHourOffset(start);
              dayEndHour = 24;
            } else if (d === spanDays) {
              dayStartHour = 0;
              dayEndHour = getHourOffset(end);
            } else {
              dayStartHour = 0;
              dayEndHour = 24;
            }

            if (dayEndHour <= dayStartHour) continue;

            const startHourOffset = dayStartHour - viewState.startHour;
            const endHourOffset = dayEndHour - viewState.startHour;
            const segDuration = dayEndHour - dayStartHour;

            const isVisible =
              dayOffset >= -2 &&
              dayOffset < viewState.visibleDays + 2 &&
              endHourOffset > 0 &&
              startHourOffset < timeRange;

            const x = startHourOffset * pixelsPerHour;
            const y = dayOffset * pixelsPerDay + dayOffsetPx;
            const width = segDuration * pixelsPerHour;
            const height = pixelsPerDay - 4;

            positions.push({
              task,
              x, y, width, height, isVisible,
              bgColor: colors.bg,
              textColor: colors.text,
              emoji,
              segmentType: d === 0 ? 'first' : d === spanDays ? 'last' : 'middle',
            });
          }
        }
      }
    });

    return positions;
  }, [data.tasks, viewState, pixelsPerHour, pixelsPerDay, timeRange, getTagGroup, theme]);

  return (
    <div
      className="calendar-container"
      ref={containerRef}
      onWheel={handleWheel}
      onPointerMove={onDragMove}
      onPointerUp={endDrag}
    >
      {/* 横轴时间标签 */}
      <div className="time-axis">
        {timeLabels.map(({ hour, x }) => {
          // 边缘标签调整位置避免被裁剪
          const gridWidth = containerSize.width - AXIS_LABEL_WIDTH;
          let labelStyle: React.CSSProperties = { left: x };
          if (x < 20) {
            // 左边缘：不左移
            labelStyle = { left: x, transform: 'translateX(0)' };
          } else if (x > gridWidth - 20) {
            // 右边缘：完全左移
            labelStyle = { left: x, transform: 'translateX(-100%)' };
          }
          return (
            <div
              key={hour}
              className="time-label"
              style={labelStyle}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          );
        })}
        {/* 小刻度线 */}
        {timeTicks.map(({ x, isMajor }, i) => (
          <div
            key={`tick-${i}`}
            className={`time-tick ${isMajor ? 'major' : 'minor'}`}
            style={{ left: x }}
          />
        ))}
      </div>

      {/* 竖轴日期标签 */}
      <div className="date-axis">
        {dateLabels.map(({ y, label, isToday }) => (
          <div
            key={label}
            className={`date-label ${isToday ? 'today' : ''}`}
            style={{ top: y, height: pixelsPerDay }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 网格线 */}
      <div className="grid-area">
        {/* 刻度竖线（更细更淡，包括小刻度和中刻度） */}
        {timeTicks.map(({ x }, i) => (
          <div
            key={`tick-vline-${i}`}
            className="grid-line vertical tick-line"
            style={{ left: x }}
          />
        ))}
        {/* 竖线（时间标签对应的整点线） */}
        {timeLabels.map(({ hour, x }) => (
          <div
            key={`vline-${hour}`}
            className={`grid-line vertical ${hour % 1 === 0 ? 'hour-line' : ''}`}
            style={{ left: x }}
          />
        ))}
        {/* 横线（日期） */}
        {dateLabels.map(({ date, label, y, isToday }) => (
          <React.Fragment key={`row-${label}`}>
            {/* 当天行背景色区分 */}
            {isToday && (
              <div
                className="today-row-bg"
                style={{ top: y, height: pixelsPerDay }}
              />
            )}
            <div
              className={`grid-line horizontal${date.getDay() === 1 ? ' week-boundary' : ''}`}
              style={{ top: y }}
            />
          </React.Fragment>
        ))}

        {/* 任务格子 */}
        {taskPositions
          .filter((tp) => tp.isVisible)
          .map((tp, index) => (
            <TaskBlock
              key={`${tp.task.id}-${index}`}
              task={tp.task}
              x={tp.x}
              y={tp.y}
              width={tp.width}
              height={tp.height}
              bgColor={tp.bgColor}
              textColor={tp.textColor}
              emoji={tp.emoji}
              segmentType={tp.segmentType}
              onTaskClick={onTaskClick}
              onToggleComplete={handleToggleComplete}
              onDragStart={startDrag}
              showCompleteAnim={animatingTaskIds.has(tp.task.id)}
            />
          ))}

        {/* 完成动画浮层 - 在任务格之上独立渲染，不受任务格透明度影响 */}
        {taskPositions
          .filter((tp) => tp.isVisible && animatingTaskIds.has(tp.task.id))
          .map((tp, index) => (
            <div
              key={`anim-${tp.task.id}-${index}`}
              className="complete-check-overlay"
              style={{
                left: tp.x + Math.max(tp.width, 40) / 2,
                top: tp.y + 2 + Math.max(tp.height, 24) / 2,
              }}
            >
              <span className="complete-check-float">✓</span>
            </div>
          ))}

        {/* "现在"时间指示线 */}
        {(() => {
          const nowHour = nowTime.getHours() + nowTime.getMinutes() / 60;
          const nowX = (nowHour - viewState.startHour) * pixelsPerHour;
          const dayOffsetPx = -(viewState.dayOffset || 0) * pixelsPerDay;
          const todayDayOffset = (new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate()).getTime() - viewState.startDate.getTime()) / 86400000;
          const todayY = todayDayOffset * pixelsPerDay + dayOffsetPx;
          const isVisible = nowX >= 0 && nowX <= containerSize.width - AXIS_LABEL_WIDTH &&
            todayY >= -pixelsPerDay && todayY < containerSize.height;

          if (!isVisible) return null;

          const timeStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;
          const bubbleHeight = 33; // 气泡高度
          const triangleHeight = 5; // 三角高度
          // 气泡在任务格上方（todayY 是任务行顶部位置）
          const bubbleTop = todayY - bubbleHeight - triangleHeight;

          return (
            <div className="now-indicator" style={{ left: nowX }}>
              <div className="now-indicator-bubble" style={{ top: bubbleTop }}>
                <span className="now-indicator-label">现在</span>
                <span className="now-indicator-time">{timeStr}</span>
              </div>
              <div
                className="now-indicator-line"
                style={{ top: todayY, height: pixelsPerDay }}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}


