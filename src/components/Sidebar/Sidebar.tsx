import { useState, useRef } from 'react';
import { useData } from '../../stores/dataStore';
import { Task } from '../../types';
import { DEFAULT_TAG_GROUP_ID, PRESET_COLORS, PRESET_COLORS_DARK, TASK_BLOCK_COLORS, TASK_BLOCK_COLORS_DARK } from '../../constants';
import './Sidebar.css';

interface SidebarProps {
  visible: boolean;
  onToggle: () => void;
  onEditTagGroup: (id: string) => void;
  onAddTagGroup: () => void;
  onTaskClick: (task: Task) => void;
  theme: 'light' | 'dark';
}

export default function Sidebar({
  visible,
  onToggle,
  onEditTagGroup,
  onAddTagGroup,
  onTaskClick,
  theme,
}: SidebarProps) {
  const { data, deleteTask, toggleTaskComplete, importData, reorderTagGroups } = useData();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 拖拽排序状态
  const [dragGroupId, setDragGroupId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | null>(null);

  const incompleteTasks = data.tasks.filter((t) => !t.completed);
  const completedTasks = data.tasks.filter((t) => t.completed);

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // 导出数据
  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taketime-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (imported.tagGroups && imported.tasks) {
          importData(imported);
          alert('导入成功！');
        } else {
          alert('文件格式错误');
        }
      } catch {
        alert('文件解析失败');
      }
    };
    reader.readAsText(file);
    // 重置 input 以允许重复选择同一文件
    e.target.value = '';
  };

  // 标签组拖拽排序
  const handleDragStart = (groupId: string) => {
    setDragGroupId(groupId);
  };

  const handleDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (groupId === dragGroupId) return;
    // 根据鼠标在元素中的位置判定插入上方还是下方
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'top' : 'bottom';
    setDragOverGroupId(groupId);
    setDragOverPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverGroupId(null);
    setDragOverPosition(null);
  };

  const handleDrop = (targetGroupId: string) => {
    if (!dragGroupId || dragGroupId === targetGroupId) {
      setDragGroupId(null);
      setDragOverGroupId(null);
      setDragOverPosition(null);
      return;
    }
    const ids = data.tagGroups.map((g) => g.id);
    const fromIdx = ids.indexOf(dragGroupId);
    let toIdx = ids.indexOf(targetGroupId);
    if (fromIdx === -1 || toIdx === -1) return;
    ids.splice(fromIdx, 1);
    // 如果放在下半部分，插入到目标之后
    if (dragOverPosition === 'bottom') {
      toIdx = ids.indexOf(targetGroupId) + 1;
    } else {
      toIdx = ids.indexOf(targetGroupId);
    }
    ids.splice(toIdx, 0, dragGroupId);
    reorderTagGroups(ids);
    setDragGroupId(null);
    setDragOverGroupId(null);
    setDragOverPosition(null);
  };

  const handleDragEnd = () => {
    setDragGroupId(null);
    setDragOverGroupId(null);
    setDragOverPosition(null);
  };

  // 格式化任务时间显示
  const formatTaskTime = (task: Task): string => {
    if (task.isRecurring && task.weekdays && task.weekdays.length > 0) {
      const days = task.weekdays.slice().sort();
      const timePart = task.startTime.split(' ')[1] || '';
      // 判断特殊模式
      let dayStr: string;
      if (days.length === 7) dayStr = '每天';
      else if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) dayStr = '工作日';
      else if (days.length === 2 && days.includes(0) && days.includes(6)) dayStr = '周末';
      else {
        const labels = ['日', '一', '二', '三', '四', '五', '六'];
        dayStr = days.map((d) => labels[d]).join('');
      }
      return `${dayStr} ${timePart}`;
    }
    // 普通任务：显示月/日 + 时间
    const parts = task.startTime.split(' ');
    const datePart = parts[0] || '';
    const timePart = parts[1] || '';
    const dateSegments = datePart.split('/');
    const monthDay = dateSegments.length >= 3
      ? `${parseInt(dateSegments[1])}/${parseInt(dateSegments[2])}`
      : datePart;
    return `${monthDay} ${timePart}`;
  };

  return (
    <>
      {/* 展开按钮（始终显示） */}
      {!visible && (
        <div className="sidebar-toggle collapsed" onClick={onToggle} data-tooltip="展开侧边栏">
          <span>☰</span>
        </div>
      )}

      {/* 侧边栏面板 */}
      <div className={`sidebar ${!visible ? 'hidden' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle-btn" onClick={onToggle}>
            ◀
          </button>
        </div>

      {/* 标签组区域 */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <h3 className="sidebar-title">标签组</h3>
          <button className="sidebar-add-btn" onClick={onAddTagGroup} data-tooltip="新建标签组">
            +
          </button>
        </div>

        {data.tagGroups.map((group) => {
          const groupTasks = incompleteTasks.filter(
            (t) => t.tagGroupId === group.id
          );
          const colorInfo = PRESET_COLORS.find((c) => c.key === group.color);
          const badgeColor = theme === 'dark'
            ? (PRESET_COLORS_DARK[group.color] || colorInfo?.value || '#4DABF7')
            : (colorInfo?.value || '#4DABF7');
          const badgeTextColor = theme === 'dark'
            ? (TASK_BLOCK_COLORS_DARK[group.color]?.text || '#fff')
            : (TASK_BLOCK_COLORS[group.color]?.text || '#fff');
          const isExpanded = expandedGroups.has(group.id);

          return (
            <div
              key={group.id}
              className={`tag-group-item ${dragOverGroupId === group.id && dragOverPosition === 'top' ? 'drag-over-top' : ''} ${dragOverGroupId === group.id && dragOverPosition === 'bottom' ? 'drag-over-bottom' : ''} ${dragGroupId === group.id ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(group.id)}
              onDragOver={(e) => handleDragOver(e, group.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(group.id)}
              onDragEnd={handleDragEnd}
            >
              <div className="tag-group-header">
                <span
                  className="tag-group-badge"
                  style={{ backgroundColor: badgeColor, color: badgeTextColor }}
                >
                  {/* 展开/收起三角形 - 在颜色条上 */}
                  <button
                    className={`tag-group-expand-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleGroupExpand(group.id)}
                  >
                    ▶
                  </button>
                  <span className="tag-group-badge-content">
                    {group.emoji} {group.name}
                  </span>
                  {group.id !== DEFAULT_TAG_GROUP_ID && (
                    <button
                      className="tag-group-edit-btn"
                      onClick={() => onEditTagGroup(group.id)}
                    >
                      修改
                    </button>
                  )}
                </span>
              </div>

              {isExpanded && (
                <div className="tag-group-tasks">
                  {groupTasks.length > 0 ? (
                    groupTasks.map((task) => (
                      <div
                        key={task.id}
                        className="sidebar-task-item"
                        onClick={() => onTaskClick(task)}
                      >
                        <span className="sidebar-task-name">{task.name}</span>
                        <span className="sidebar-task-time">
                          {formatTaskTime(task)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="sidebar-empty">无任务</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 分隔线 */}
      <div className="sidebar-divider" />

      {/* 已完成区域 */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">已完成</h3>
        {completedTasks.length === 0 ? (
          <p className="sidebar-empty">暂无已完成任务</p>
        ) : (
          completedTasks.map((task) => (
            <div
              key={task.id}
              className="sidebar-task-item completed"
              onClick={() => onTaskClick(task)}
            >
              <span className="sidebar-task-name">{task.name}</span>
              <div className="sidebar-task-actions">
                <button
                  className="sidebar-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskComplete(task.id);
                  }}
                >
                  恢复
                </button>
                <button
                  className="sidebar-action-btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分隔线 */}
      <div className="sidebar-divider" />

      {/* 导入导出 */}
      <div className="sidebar-section sidebar-io-section">
        <div className="sidebar-io-buttons">
          <button className="sidebar-io-btn" onClick={handleExport}>
            导出数据
          </button>
          <button className="sidebar-io-btn" onClick={handleImport}>
            导入数据
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
    </>
  );
}
