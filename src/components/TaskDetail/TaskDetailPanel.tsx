import { useState, useEffect } from 'react';
import { useData } from '../../stores/dataStore';
import { Task } from '../../types';
import { checkOverlap } from '../../utils/overlapCheck';
import { showToast } from '../Toast/Toast';
import CustomSelect from '../Modals/CustomSelect';
import CustomDateTime from '../Modals/CustomDateTime';
import '../Modals/Modals.css';
import './TaskDetailPanel.css';

interface TaskDetailPanelProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailPanel({ open, task, onClose }: TaskDetailPanelProps) {
  const { data, updateTask, deleteTask, toggleTaskComplete } = useData();

  const [name, setName] = useState('');
  const [tagGroupId, setTagGroupId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [error, setError] = useState('');

  const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

  useEffect(() => {
    if (task) {
      setName(task.name);
      setTagGroupId(task.tagGroupId);
      setStartTime(toInputFormat(task.startTime));
      setEndTime(toInputFormat(task.endTime));
      setWeekdays(task.weekdays || []);
      setError('');
    }
  }, [task]);

  // yyyy/MM/dd HH:mm → yyyy-MM-ddTHH:mm
  function toInputFormat(str: string): string {
    return str.replace(/\//g, '-').replace(' ', 'T');
  }

  // yyyy-MM-ddTHH:mm → yyyy/MM/dd HH:mm
  function fromInputFormat(str: string): string {
    return str.replace(/-/g, '/').replace('T', ' ');
  }

  const handleSave = () => {
    if (!task) return;
    if (!name.trim()) {
      setError('请填写任务名称');
      return;
    }

    const start = fromInputFormat(startTime);
    const end = fromInputFormat(endTime);

    if (new Date(startTime) >= new Date(endTime)) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    // 冲突检测（排除自身）
    const conflict = checkOverlap(start, end, data.tasks, task.id);
    if (conflict) {
      setError(`时间与任务「${conflict.name}」冲突，请调整`);
      return;
    }

    updateTask(task.id, {
      name: name.trim(),
      tagGroupId,
      startTime: start,
      endTime: end,
      ...(task.isRecurring ? { weekdays } : {}),
    });

    setError('');
    showToast('任务修改成功');
  };

  const handleDelete = () => {
    if (task && confirm('确定删除此任务？')) {
      deleteTask(task.id);
      onClose();
      showToast('任务已删除', 'info');
    }
  };

  const handleToggleComplete = () => {
    if (task) {
      toggleTaskComplete(task.id);
      const isNowComplete = !currentTask.completed;
      showToast(isNowComplete ? '任务已完成 🎉' : '任务已恢复', 'success');
    }
  };

  if (!task) return null;

  // 从数据源获取最新的任务状态（确保标记完成后按钮及时更新）
  const currentTask = data.tasks.find((t) => t.id === task.id) || task;

  // 构建标签组选项
  const tagGroupOptions = data.tagGroups.map((g) => ({
    value: g.id,
    label: `${g.emoji} ${g.name}`,
  }));

  return (
    <>
      <div className={`drawer-overlay ${!open ? 'hidden' : ''}`} onClick={onClose} />
      <div className={`drawer-panel ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">任务详情</h2>
<button className="drawer-close" onClick={onClose} data-tooltip="关闭">▶</button>
        </div>

        <div className="drawer-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-item">
            <label className="form-label">任务名称</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-item">
            <label className="form-label">标签组</label>
            <CustomSelect
              options={tagGroupOptions}
              value={tagGroupId}
              onChange={setTagGroupId}
              placeholder="选择标签组"
            />
          </div>

          <div className="form-item">
            <label className="form-label">开始时间</label>
            <CustomDateTime
              value={startTime}
              onChange={setStartTime}
              placeholder="选择开始时间"
              timeOnly={task.isRecurring}
            />
          </div>

          <div className="form-item">
            <label className="form-label">结束时间</label>
            <CustomDateTime
              value={endTime}
              onChange={setEndTime}
              placeholder="选择结束时间"
              timeOnly={task.isRecurring}
            />
          </div>

          <div className="form-item">
            <label className="form-label">状态</label>
            <span className={`task-status ${currentTask.completed ? 'completed' : ''}`}>
              {currentTask.completed ? '✅ 已完成' : '⏳ 进行中'}
            </span>
          </div>

          {/* 周期性任务：编辑每周几 */}
          {task.isRecurring && (
            <div className="form-item">
              <label className="form-label">每周重复</label>
              <div className="weekday-picker">
                {WEEKDAY_LABELS.map((label, index) => (
                  <div
                    key={index}
                    className={`weekday-option ${weekdays.includes(index) ? 'selected' : ''}`}
                    onClick={() => {
                      setWeekdays((prev) =>
                        prev.includes(index)
                          ? prev.filter((d) => d !== index)
                          : [...prev, index]
                      );
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            保存修改
          </button>
          <button
            className="btn btn-default"
            onClick={handleToggleComplete}
          >
            {currentTask.completed ? '标记未完成' : '标记完成'}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            删除任务
          </button>
        </div>
      </div>
    </>
  );
}
