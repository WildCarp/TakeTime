import { useState, useRef, useCallback, useEffect } from 'react';
import './FloatingBall.css';

interface FloatingBallProps {
  onAddTask: () => void;
  onLocateToday: () => void;
  onToggleTheme: () => void;
  onToggleFloating?: () => void;
  isTauriEnv?: boolean;
  theme: 'light' | 'dark';
}

export default function FloatingBall({
  onAddTask,
  onLocateToday,
  onToggleTheme,
  onToggleFloating,
  isTauriEnv,
  theme,
}: FloatingBallProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 88, y: window.innerHeight - 88 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMoved = useRef(false);

  // 判断主球在上半侧还是下半侧
  const isTopHalf = position.y < window.innerHeight / 2;
  // 判断主球在左半侧还是右半侧
  const isLeftHalf = position.x < window.innerWidth / 2;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
    const newX = Math.max(0, Math.min(window.innerWidth - 56, dragStart.current.posX + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, dragStart.current.posY + dy));
    setPosition({ x: newX, y: newY });
  }, [dragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // 窗口 resize 时确保不超出边界
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 56),
        y: Math.min(prev.y, window.innerHeight - 56),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`floating-ball ${isTopHalf ? 'expand-down' : 'expand-up'} ${isLeftHalf ? 'tooltip-right' : ''} ${isTauriEnv ? 'has-float' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      {/* 子球：新建任务（最近主球） */}
      <div
        className="floating-ball-child add"
        onClick={onAddTask}
        data-tooltip="新建任务"
      >
        <span className="floating-ball-child-icon">＋</span>
      </div>

      {/* 子球：定位到现在（中间） */}
      <div
        className="floating-ball-child locate"
        onClick={onLocateToday}
        data-tooltip="定位到现在"
      >
        <span className="floating-ball-child-icon">⊙</span>
      </div>

      {/* 子球：切换主题 */}
      <div
        className="floating-ball-child theme"
        onClick={onToggleTheme}
        data-tooltip="切换主题"
      >
        <span className="floating-ball-child-icon">{theme === 'light' ? '☽' : '☀'}</span>
      </div>

      {/* 子球：悬浮模式（仅 Tauri 环境） */}
      {isTauriEnv && (
        <div
          className="floating-ball-child float-mode"
          onClick={onToggleFloating}
          data-tooltip="悬浮模式"
        >
          <span className="floating-ball-child-icon">⬡</span>
        </div>
      )}

      {/* 主球 */}
      <div
        className="floating-ball-main"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <span className="floating-ball-icon">✦</span>
      </div>
    </div>
  );
}
