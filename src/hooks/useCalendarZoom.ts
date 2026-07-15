import { useState, useCallback } from 'react';
import { CALENDAR_DEFAULTS } from '../constants';
import { getToday } from '../utils/timeUtils';

export interface CalendarViewState {
  startHour: number;
  endHour: number;
  visibleDays: number;
  startDate: Date;
  // 浮点数天偏移，用于平滑滚动（0~1之间的小数部分）
  dayOffset: number;
}

export function useCalendarZoom() {
  const [viewState, setViewState] = useState<CalendarViewState>({
    startHour: CALENDAR_DEFAULTS.startHour,
    endHour: CALENDAR_DEFAULTS.endHour,
    visibleDays: CALENDAR_DEFAULTS.visibleDays,
    startDate: getToday(),
    dayOffset: 0,
  });

  // 缩放时间轴（横轴）- 使用更平滑的缩放因子
  const zoomTimeAxis = useCallback((delta: number, mouseRatio: number) => {
    setViewState((prev) => {
      const currentRange = prev.endHour - prev.startHour;
      // 更平滑的缩放：使用较小的因子
      const zoomFactor = delta > 0 ? 1.08 : 0.93;
      let newRange = currentRange * zoomFactor;

      // 限制范围
      newRange = Math.max(CALENDAR_DEFAULTS.minHours, Math.min(CALENDAR_DEFAULTS.maxHours, newRange));

      const rangeDiff = newRange - currentRange;
      let newStart = prev.startHour - rangeDiff * mouseRatio;
      let newEnd = newStart + newRange;

      // 边界限制
      if (newStart < 0) { newStart = 0; newEnd = newRange; }
      if (newEnd > 24) { newEnd = 24; newStart = 24 - newRange; }

      return { ...prev, startHour: newStart, endHour: newEnd };
    });
  }, []);

  // 缩放日期轴（竖轴）- 使用浮点数天数实现平滑缩放
  const zoomDateAxis = useCallback((delta: number) => {
    setViewState((prev) => {
      const zoomFactor = delta > 0 ? 1.1 : 0.91;
      let newDays = prev.visibleDays * zoomFactor;
      newDays = Math.max(CALENDAR_DEFAULTS.minDays, Math.min(CALENDAR_DEFAULTS.maxDays, newDays));
      return { ...prev, visibleDays: newDays };
    });
  }, []);

  // 定位到现在（将当前时间平移至区域中心）
  const goToToday = useCallback(() => {
    setViewState((prev) => {
      const now = new Date();
      const nowHour = now.getHours() + now.getMinutes() / 60;
      const timeRange = prev.endHour - prev.startHour;

      // 将当前时间居中于横轴
      let newStartHour = nowHour - timeRange / 2;
      let newEndHour = nowHour + timeRange / 2;
      if (newStartHour < 0) { newStartHour = 0; newEndHour = timeRange; }
      if (newEndHour > 24) { newEndHour = 24; newStartHour = 24 - timeRange; }

      // 将今天居中于竖轴
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const halfDays = Math.floor(prev.visibleDays / 2);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - halfDays);

      return {
        ...prev,
        startHour: newStartHour,
        endHour: newEndHour,
        startDate,
        dayOffset: 0,
      };
    });
  }, []);

  // 平移视图 - 支持浮点数天偏移实现平滑拖拽
  const panView = useCallback((daysDelta: number, hoursDelta: number) => {
    setViewState((prev) => {
      let newStartHour = prev.startHour + hoursDelta;
      let newEndHour = prev.endHour + hoursDelta;
      const range = prev.endHour - prev.startHour;

      if (newStartHour < 0) { newStartHour = 0; newEndHour = range; }
      if (newEndHour > 24) { newEndHour = 24; newStartHour = 24 - range; }

      // 浮点数天偏移
      let newDayOffset = prev.dayOffset + daysDelta;
      const newStartDate = new Date(prev.startDate);

      // 当偏移超过 1 天时，调整日期
      while (newDayOffset >= 1) {
        newStartDate.setDate(newStartDate.getDate() + 1);
        newDayOffset -= 1;
      }
      while (newDayOffset <= -1) {
        newStartDate.setDate(newStartDate.getDate() - 1);
        newDayOffset += 1;
      }

      return {
        ...prev,
        startDate: newStartDate,
        dayOffset: newDayOffset,
        startHour: newStartHour,
        endHour: newEndHour,
      };
    });
  }, []);

  return { viewState, zoomTimeAxis, zoomDateAxis, goToToday, panView, setViewState };
}
