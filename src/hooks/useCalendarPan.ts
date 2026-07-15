import { useCallback, useRef, useEffect } from 'react';

/**
 * 右键拖拽平移 hook - 平滑版本
 */
export function useCalendarPan(
  onPan: (daysDelta: number, hoursDelta: number) => void,
  containerRef: React.RefObject<HTMLElement | null>,
  pixelsPerHour: number,
  pixelsPerDay: number
) {
  const isPanning = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    // 右键按下
    if (e.button === 2) {
      e.preventDefault();
      isPanning.current = true;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isPanning.current) return;

    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;

    // 每帧直接计算增量，不设阈值，实现平滑拖拽
    const hoursDelta = -dx / pixelsPerHour;
    const daysDelta = -dy / pixelsPerDay;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      onPan(daysDelta, hoursDelta);
      lastX.current = e.clientX;
      lastY.current = e.clientY;
    }
  }, [onPan, pixelsPerHour, pixelsPerDay]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (e.button === 2) {
      isPanning.current = false;
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('contextmenu', handleContextMenu);
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);

    return () => {
      el.removeEventListener('contextmenu', handleContextMenu);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
    };
  }, [containerRef, handleContextMenu, handlePointerDown, handlePointerMove, handlePointerUp]);
}
