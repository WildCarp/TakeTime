import { useState, useCallback, useEffect } from 'react';
import './ConfirmDialog.css';

interface ConfirmState {
  open: boolean;
  message: string;
  onConfirm: (() => void) | null;
}

let globalShowConfirm: ((message: string) => Promise<boolean>) | null = null;

// 全局调用方法
export function showConfirm(message: string): Promise<boolean> {
  if (globalShowConfirm) {
    return globalShowConfirm(message);
  }
  return Promise.resolve(false);
}

export default function ConfirmDialog() {
  const [state, setState] = useState<ConfirmState>({ open: false, message: '', onConfirm: null });
  const [resolveRef, setResolveRef] = useState<{ resolve: (v: boolean) => void } | null>(null);

  const handleShow = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, message, onConfirm: null });
      setResolveRef({ resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef?.resolve(true);
    setState({ open: false, message: '', onConfirm: null });
    setResolveRef(null);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    resolveRef?.resolve(false);
    setState({ open: false, message: '', onConfirm: null });
    setResolveRef(null);
  }, [resolveRef]);

  useEffect(() => {
    globalShowConfirm = handleShow;
    return () => { globalShowConfirm = null; };
  }, [handleShow]);

  if (!state.open) return null;

  return (
    <div className="confirm-overlay" onClick={handleCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{state.message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={handleCancel}>取消</button>
          <button className="confirm-btn ok" onClick={handleConfirm}>确定</button>
        </div>
      </div>
    </div>
  );
}
