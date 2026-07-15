import { Task } from '../types';
import { parseDateTime } from './timeUtils';

/**
 * 检测任务时间是否与已有任务冲突
 * 规则：startTime < existingEndTime && endTime > existingStartTime 即为冲突
 * 边界相接允许（即 A 的结束时间 === B 的开始时间不算冲突）
 */
export function checkOverlap(
  newStart: string,
  newEnd: string,
  existingTasks: Task[],
  excludeTaskId?: string
): Task | null {
  const start = parseDateTime(newStart).getTime();
  const end = parseDateTime(newEnd).getTime();

  for (const task of existingTasks) {
    if (excludeTaskId && task.id === excludeTaskId) continue;

    const existStart = parseDateTime(task.startTime).getTime();
    const existEnd = parseDateTime(task.endTime).getTime();

    // 冲突条件：新任务开始 < 已有任务结束 && 新任务结束 > 已有任务开始
    if (start < existEnd && end > existStart) {
      return task;
    }
  }

  return null;
}
