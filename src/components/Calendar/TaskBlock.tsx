import { useCallback, useRef, useState } from 'react';
import { Task } from '../../types';
import './TaskBlock.css';

interface TaskBlockProps {
  task: Task;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  emoji: string;
  segmentType: 'full' | 'first' | 'middle' | 'last';
  onTaskClick: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onDragStart: (
    e: React.PointerEvent,
    taskId: string,
    dragType: 'move' | 'resize-left' | 'resize-right',
    startTime: string,
    endTime: string
  ) => void;
  showCompleteAnim?: boolean;
}

export default function TaskBlock({
  task,
  x,
  y,
  width,
  height,
  bgColor,
  textColor,
  emoji,
  segmentType,
  onTaskClick,
  onToggleComplete,
  onDragStart,
  showCompleteAnim: externalAnim,
}: TaskBlockProps) {
  // 追踪是否发生了拖拽（用于区分点击和拖拽）
  const hasDragged = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const [showCompleteAnimLocal, setShowCompleteAnimLocal] = useState(false);

  // 合并外部和内部动画状态
  const showCompleteAnim = showCompleteAnimLocal || externalAnim;

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!task.completed) {
      // 触发完成动画
      setShowCompleteAnimLocal(true);
      setTimeout(() => setShowCompleteAnimLocal(false), 800);
    }
    onToggleComplete(task.id);
  }, [task.id, task.completed, onToggleComplete]);

  const handleMainPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return; // 只响应左键
    hasDragged.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    onDragStart(e, task.id, 'move', task.startTime, task.endTime);
  }, [task, onDragStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    // 计算移动距离，小于 5px 视为简单点击
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 5) {
      onTaskClick(task);
    }
  }, [task, onTaskClick]);

  const handleLeftResize = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    hasDragged.current = true;
    onDragStart(e, task.id, 'resize-left', task.startTime, task.endTime);
  }, [task, onDragStart]);

  const handleRightResize = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    hasDragged.current = true;
    onDragStart(e, task.id, 'resize-right', task.startTime, task.endTime);
  }, [task, onDragStart]);

  // 格式化时间（只显示 HH:mm）
  const startTimeStr = task.startTime.split(' ')[1] || '';
  const endTimeStr = task.endTime.split(' ')[1] || '';
  const showTimes = width > 140; // 空间足够时显示时间

  // 跨天任务：非首段不显示开始时间，非尾段不显示结束时间
  const showStartTime = showTimes && (segmentType === 'full' || segmentType === 'first');
  const showEndTime = showTimes && (segmentType === 'full' || segmentType === 'last');

  return (
    <div
      className={`task-block ${task.completed ? 'completed' : ''} ${showCompleteAnim ? 'complete-anim' : ''}`}
      style={{
        left: x,
        top: y + 2,
        width: Math.max(width, 40),
        height: Math.max(height, 24),
        backgroundColor: bgColor,
        color: textColor,
      }}
      onPointerDown={handleMainPointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* 左侧拖拽手柄 */}
      <div
        className="resize-handle left"
        onPointerDown={handleLeftResize}
      />

      {/* 左侧时间 */}
      {showStartTime && (
        <span className="task-block-time left-time">{startTimeStr}</span>
      )}

      {/* 内容 - 跨天任务只在首段显示名称，emoji也只在首段显示 */}
      <div className="task-block-content">
        {(segmentType === 'full' || segmentType === 'first') && (
          <span className="task-block-emoji">{emoji}</span>
        )}
        {(segmentType === 'full' || segmentType === 'first') && (
          <span className={`task-block-name ${task.completed ? 'strikethrough' : ''}`}>{task.name}</span>
        )}
      </div>

      {/* 右侧时间 */}
      {showEndTime && (
        <span className="task-block-time right-time">{endTimeStr}</span>
      )}

      {/* 右上角勾选框 - 跨天任务只在尾段显示 */}
      {(segmentType === 'full' || segmentType === 'last') && (
        <div
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleCheckboxClick}
        >
          {task.completed && '✓'}
          {/* 完成动画 - 绿色勾从勾选框上浮消失 */}
          {showCompleteAnim && (
            <span className="complete-check-float">✓</span>
          )}
        </div>
      )}

      {/* 右侧拖拽手柄 */}
      <div
        className="resize-handle right"
        onPointerDown={handleRightResize}
      />
    </div>
  );
}
