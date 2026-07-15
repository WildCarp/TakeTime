// Tauri 窗口控制工具
// 仅在 Tauri 环境下生效，Web 环境下静默忽略

export function isTauri(): boolean {
  return !!(window as any).__TAURI__;
}

export async function enterFloatingMode() {
  if (!isTauri()) return;
  const { appWindow, LogicalSize } = await import('@tauri-apps/api/window');
  // 先设置最小尺寸（避免 setSize 时被限制）
  await appWindow.setMinSize(new LogicalSize(320, 100));
  await appWindow.setDecorations(false);
  await appWindow.setAlwaysOnTop(true);
  await appWindow.setSize(new LogicalSize(520, 160));
  await appWindow.center();
  // 设置透明背景以支持圆角
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
}

export async function exitFloatingMode() {
  if (!isTauri()) return;
  const { appWindow, LogicalSize } = await import('@tauri-apps/api/window');
  // 恢复背景色
  document.documentElement.style.background = '';
  document.body.style.background = '';
  await appWindow.setDecorations(true);
  await appWindow.setAlwaysOnTop(false);
  await appWindow.setMinSize(new LogicalSize(900, 600));
  await appWindow.setSize(new LogicalSize(1200, 800));
  await appWindow.center();
}
