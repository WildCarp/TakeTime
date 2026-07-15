import { useCallback } from 'react';
import { isTauri } from '../../utils/tauriWindow';
import './Titlebar.css';

export default function Titlebar() {
  // 仅在 Tauri 环境下显示
  if (!isTauri()) return null;

  const handleMinimize = useCallback(async () => {
    const { appWindow } = await import('@tauri-apps/api/window');
    await appWindow.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    const { appWindow } = await import('@tauri-apps/api/window');
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  }, []);

  const handleClose = useCallback(async () => {
    const { appWindow } = await import('@tauri-apps/api/window');
    await appWindow.close();
  }, []);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-title" data-tauri-drag-region>
        <span className="titlebar-icon" data-tauri-drag-region>✦</span>
        <span className="titlebar-text" data-tauri-drag-region>TakeTime</span>
      </div>
      <div className="titlebar-controls">
        <button className="titlebar-btn minimize" onClick={handleMinimize} data-tooltip="最小化">
          <svg width="10" height="2" viewBox="0 0 10 2">
            <rect width="10" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <button className="titlebar-btn maximize" onClick={handleMaximize} data-tooltip="最大化">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button className="titlebar-btn close" onClick={handleClose} data-tooltip="关闭">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
