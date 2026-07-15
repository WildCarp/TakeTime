// 时间工具函数

/**
 * 格式化日期为 yyyy/MM/dd HH:mm
 */
export function formatDateTime(date: Date): string {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const H = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${M}/${d} ${H}:${m}`;
}

/**
 * 格式化日期为 MM/dd（周X）
 */
export function formatDateLabel(date: Date): string {
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const w = weekDays[date.getDay()];
  return `${M}/${d}(${w})`;
}

/**
 * 解析 yyyy/MM/dd HH:mm 格式的时间字符串为 Date
 */
export function parseDateTime(str: string): Date {
  // 支持 yyyy/MM/dd HH:mm 格式
  const [datePart, timePart] = str.split(' ');
  const [y, M, d] = datePart.split('/').map(Number);
  const [H, m] = timePart.split(':').map(Number);
  return new Date(y, M - 1, d, H, m);
}

/**
 * 计算时长（小时）
 */
export function calcDuration(startTime: string, endTime: string): number {
  const start = parseDateTime(startTime);
  const end = parseDateTime(endTime);
  return (end.getTime() - start.getTime()) / 3600000;
}

/**
 * 获取今天的日期（零点）
 */
export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * 获取某天的日期字符串 yyyy/MM/dd
 */
export function getDateString(date: Date): string {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${M}/${d}`;
}

/**
 * 将时间吸附到最近的 N 分钟（只吸附一天内的时分，保持日期不变）
 */
export function snapToGrid(date: Date, snapMinutes: number): Date {
  const result = new Date(date);
  const totalMinutes = result.getHours() * 60 + result.getMinutes();
  const snappedMinutes = Math.round(totalMinutes / snapMinutes) * snapMinutes;
  result.setHours(Math.floor(snappedMinutes / 60), snappedMinutes % 60, 0, 0);
  return result;
}

/**
 * 添加天数
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 获取日期在某天的小时偏移（含分钟小数）
 */
export function getHourOffset(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}
