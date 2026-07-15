import { useCallback, useRef } from 'react';
import { CALENDAR_DEFAULTS } from '../constants';
import { parseDateTime, formatDateTime, snapToGrid } from '../utils/timeUtils';

interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize-left' | 'resize-right';
  taskId: string;
  startX: number;
  startY: number;
  originalStartTime: string;
  originalEndTime: string;
}

/**
 * 任务格子拖拽 hook
 */
export function useTaskDrag(
  onTaskUpdate: (id: string, updates: { startTime?: string; endTime?: string }) => void,
  pixelsPerHour: number,
  pixelsPerDay: number
) {
  const dragState = useRef<DragState | null>(null);

  const startDrag = useCallback((
    e: React.PointerEvent,
    taskId: string,
    dragType: 'move' | 'resize-left' | 'resize-right',
    startTime: string,
    endTime: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dragState.current = {
      isDragging: true,
      dragType,
      taskId,
      startX: e.clientX,
      startY: e.clientY,
      originalStartTime: startTime,
      originalEndTime: endTime,
    };

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
  }, []);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current?.isDragging) return;

    const { dragType, startX, startY, originalStartTime, originalEndTime, taskId } = dragState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const hoursDelta = dx / pixelsPerHour;
    const daysDelta = Math.round(dy / pixelsPerDay);

    const origStart = parseDateTime(originalStartTime);
    const origEnd = parseDateTime(originalEndTime);

    let newStart: Date;
    let newEnd: Date;

    switch (dragType) {
      case 'move': {
        // 先对小时进行吸附计算
        newStart = snapToGrid(new Date(origStart.getTime() + hoursDelta * 3600000), CALENDAR_DEFAULTS.snapMinutes);
        newEnd = snapToGrid(new Date(origEnd.getTime() + hoursDelta * 3600000), CALENDAR_DEFAULTS.snapMinutes);
        // 再用 setDate 精确移动天数（避免毫秒计算导致的日期偏移）
        if (daysDelta !== 0) {
          newStart.setDate(newStart.getDate() + daysDelta);
          newEnd.setDate(newEnd.getDate() + daysDelta);
        }
        break;
      }
      case 'resize-left': {
        // resize 只影响横轴（小时）
        const msOffset = hoursDelta * 3600000;
        newStart = snapToGrid(new Date(origStart.getTime() + msOffset), CALENDAR_DEFAULTS.snapMinutes);
        newEnd = origEnd;
        if (newStart >= newEnd) return;
        break;
      }
      case 'resize-right': {
        // resize 只影响横轴（小时）
        const msOffset = hoursDelta * 3600000;
        newStart = origStart;
        newEnd = snapToGrid(new Date(origEnd.getTime() + msOffset), CALENDAR_DEFAULTS.snapMinutes);
        if (newEnd <= newStart) return;
        break;
      }
      default:
        return;
    }

    onTaskUpdate(taskId, {
      startTime: formatDateTime(newStart),
      endTime: formatDateTime(newEnd),
    });
  }, [pixelsPerHour, pixelsPerDay, onTaskUpdate]);

  const endDrag = useCallback(() => {
    dragState.current = null;
  }, []);

  return { startDrag, onDragMove, endDrag, dragState };
}
