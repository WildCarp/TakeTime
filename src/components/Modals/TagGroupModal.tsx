import { useState, useEffect } from 'react';
import { useData } from '../../stores/dataStore';
import { PRESET_COLORS, PRESET_COLORS_DARK, PRESET_EMOJIS, EMOJI_LABELS, DEFAULT_TAG_GROUP_ID } from '../../constants';
import { showToast } from '../Toast/Toast';
import { showConfirm } from '../Toast/ConfirmDialog';
import { TagGroup } from '../../types';
import './Modals.css';

interface TagGroupModalProps {
  open: boolean;
  editingGroup?: TagGroup | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export default function TagGroupModal({ open, editingGroup, onClose, theme }: TagGroupModalProps) {
  const { data, addTagGroup, updateTagGroup, deleteTagGroup } = useData();

  const [name, setName] = useState('');
  const [color, setColor] = useState('sky');
  const [emoji, setEmoji] = useState('💼');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editingGroup) {
        setName(editingGroup.name);
        setColor(editingGroup.color);
        setEmoji(editingGroup.emoji);
      } else {
        setName('');
        setColor('sky');
        setEmoji('💼');
      }
      setError('');
    }
  }, [open, editingGroup]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('请填写标签组名称');
      return;
    }

    // 检查名称重复
    const duplicate = data.tagGroups.find(
      (g) => g.name === name.trim() && g.id !== editingGroup?.id
    );
    if (duplicate) {
      setError('标签组名称已存在');
      return;
    }

    if (editingGroup) {
      updateTagGroup(editingGroup.id, { name: name.trim(), color, emoji });
    } else {
      addTagGroup({ name: name.trim(), color, emoji });
    }

    onClose();
    showToast(editingGroup ? '标签组已修改' : '标签组创建成功');
  };

  const handleDelete = async () => {
    if (editingGroup && editingGroup.id !== DEFAULT_TAG_GROUP_ID) {
      const confirmed = await showConfirm('删除标签组后，其下任务将迁移到「默认」标签组。确定删除？');
      if (confirmed) {
        deleteTagGroup(editingGroup.id);
        onClose();
        showToast('标签组已删除', 'info');
      }
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingGroup ? '修改标签组' : '新建标签组'}
          </h2>
<button className="modal-close" onClick={onClose} data-tooltip="关闭">✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-item">
            <label className="form-label">名称</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入标签组名称"
              autoFocus
            />
          </div>

          <div className="form-item">
            <label className="form-label">颜色</label>
            <div className="color-picker">
              {PRESET_COLORS.map((c) => (
                <div
                  key={c.key}
                  className={`color-option ${color === c.key ? 'selected' : ''}`}
                  style={{ backgroundColor: theme === 'dark' ? (PRESET_COLORS_DARK[c.key] || c.value) : c.value }}
                  onClick={() => setColor(c.key)}
                  data-tooltip={c.label}
                />
              ))}
            </div>
          </div>

          <div className="form-item">
            <label className="form-label">Emoji</label>
            <div className="emoji-picker">
              {PRESET_EMOJIS.map((e) => (
                <div
                  key={e}
                  className={`emoji-option ${emoji === e ? 'selected' : ''}`}
                  onClick={() => setEmoji(e)}
                  data-tooltip={EMOJI_LABELS[e] || ''}
                >
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {editingGroup && editingGroup.id !== DEFAULT_TAG_GROUP_ID && (
            <button className="btn btn-danger" onClick={handleDelete}>
              删除
            </button>
          )}
          <div className="modal-footer-right">
            <button className="btn btn-default" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingGroup ? '保存' : '创建'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
