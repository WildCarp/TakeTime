// Tauri 窗口控制工具
// 仅在 Tauri 环境下生效，Web 环境下静默忽略

export function isTauri(): boolean {
  return !!(window as any).__TAURI__;
}

export async function enterFloatingMode() {
  if (!isTauri()) return;
  const { appWindow, LogicalSize } = await import('@tauri-apps/api/window');
  const { invoke } = await import('@tauri-apps/api/tauri');
  // 先设置最小尺寸（避免 setSize 时被限制）
  await appWindow.setMinSize(new LogicalSize(320, 80));
  await appWindow.setAlwaysOnTop(true);
  await appWindow.setSize(new LogicalSize(1040, 160));
  await appWindow.center();
  // 隐藏任务栏图标（只保留系统托盘图标）
  await invoke('set_skip_taskbar', { skip: true });
  // 设置透明背景以支持圆角
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
  const root = document.getElementById('root');
  if (root) root.style.background = 'transparent';
}

export async function exitFloatingMode() {
  if (!isTauri()) return;
  const { appWindow, LogicalSize } = await import('@tauri-apps/api/window');
  const { invoke } = await import('@tauri-apps/api/tauri');
  // 恢复背景色
  document.documentElement.style.background = '';
  document.body.style.background = '';
  const root = document.getElementById('root');
  if (root) root.style.background = '';
  // 恢复任务栏图标
  await invoke('set_skip_taskbar', { skip: false });
  await appWindow.setAlwaysOnTop(false);
  await appWindow.setMinSize(new LogicalSize(900, 600));
  await appWindow.setSize(new LogicalSize(1200, 800));
  await appWindow.center();
}
