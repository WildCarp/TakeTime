import { useState, useEffect } from 'react';
import { useData } from '../../stores/dataStore';
import { checkOverlap } from '../../utils/overlapCheck';
import { DEFAULT_TAG_GROUP_ID } from '../../constants';
import { showToast } from '../Toast/Toast';
import CustomSelect from './CustomSelect';
import CustomDateTime from './CustomDateTime';
import './Modals.css';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export default function TaskModal({ open, onClose }: TaskModalProps) {
  const { data, addTask } = useData();

  const [name, setName] = useState('');
  const [tagGroupId, setTagGroupId] = useState(DEFAULT_TAG_GROUP_ID);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([]);

  // 初始化默认时间
  useEffect(() => {
    if (open) {
      const now = new Date();
      // 对齐到15分钟
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      const end = new Date(now.getTime() + 3600000); // +1小时
      setStartTime(toInputFormat(now));
      setEndTime(toInputFormat(end));
      setName('');
      setTagGroupId(DEFAULT_TAG_GROUP_ID);
      setError('');
      setIsRecurring(false);
      setWeekdays([]);
    }
  }, [open]);

  // 转换为 input datetime-local 格式
  function toInputFormat(date: Date): string {
    const y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const H = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${M}-${d}T${H}:${m}`;
  }

  // 从 input 格式转换为应用格式
  function fromInputFormat(str: string): string {
    // 2026-07-13T10:00 → 2026/07/13 10:00
    return str.replace(/-/g, '/').replace('T', ' ');
  }

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('请填写任务名称');
      return;
    }

    if (isRecurring) {
      // 周期性任务只需要时间，不需要具体日期
      if (weekdays.length === 0) {
        setError('请至少选择一天');
        return;
      }
      if (!startTime || !endTime) {
        setError('请选择时间');
        return;
      }
      // 验证时间顺序（只比较时分）
      const startParts = startTime.split('T')[1];
      const endParts = endTime.split('T')[1];
      if (startParts >= endParts) {
        setError('结束时间必须晚于开始时间');
        return;
      }

      const start = fromInputFormat(startTime);
      const end = fromInputFormat(endTime);

      addTask({
        name: name.trim(),
        tagGroupId,
        startTime: start,
        endTime: end,
        completed: false,
        isRecurring: true,
        weekdays,
      });
    } else {
      if (!startTime || !endTime) {
        setError('请选择时间');
        return;
      }

      const start = fromInputFormat(startTime);
      const end = fromInputFormat(endTime);

      // 验证时间顺序
      if (new Date(startTime) >= new Date(endTime)) {
        setError('结束时间必须晚于开始时间');
        return;
      }

      // 冲突检测
      const conflict = checkOverlap(start, end, data.tasks);
      if (conflict) {
        setError(`时间与任务「${conflict.name}」冲突，请调整`);
        return;
      }

      addTask({
        name: name.trim(),
        tagGroupId,
        startTime: start,
        endTime: end,
        completed: false,
      });
    }

    onClose();
    showToast('任务创建成功');
  };

  if (!open) return null;

  // 构建标签组选项
  const tagGroupOptions = data.tagGroups.map((g) => ({
    value: g.id,
    label: `${g.emoji} ${g.name}`,
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">新建任务</h2>
<button className="modal-close" onClick={onClose} data-tooltip="关闭">✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-item">
            <label className="form-label">任务名称</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入任务名称"
              autoFocus
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

          {/* 周期性任务开关 */}
          <div className="form-item">
            <div className="form-switch-row">
              <span className="form-label">周期性任务</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* 周期性任务：选择每周几 */}
          {isRecurring && (
            <div className="form-item">
              <label className="form-label">每周重复</label>
              <div className="weekday-picker">
                {WEEKDAY_LABELS.map((label, index) => (
                  <div
                    key={index}
                    className={`weekday-option ${weekdays.includes(index) ? 'selected' : ''}`}
                    onClick={() => toggleWeekday(index)}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-item">
            <label className="form-label">{isRecurring ? '开始时间' : '开始时间'}</label>
            <CustomDateTime
              value={startTime}
              onChange={setStartTime}
              placeholder="选择开始时间"
              timeOnly={isRecurring}
            />
          </div>

          <div className="form-item">
            <label className="form-label">{isRecurring ? '结束时间' : '结束时间'}</label>
            <CustomDateTime
              value={endTime}
              onChange={setEndTime}
              placeholder="选择结束时间"
              timeOnly={isRecurring}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit}>创建</button>
        </div>
      </div>
    </div>
  );
}
