// Tauri 窗口控制工具
// 仅在 Tauri 环境下生效，Web 环境下静默忽略

export function isTauri(): boolean {
  return !!(window as any).__TAURI__;
}

export async function enterFloatingMode() {
  if (!isTauri()) return;
  const { appWindow } = await import('@tauri-apps/api/window');
  await appWindow.setDecorations(false);
  await appWindow.setAlwaysOnTop(true);
  await appWindow.setSize(new (await import('@tauri-apps/api/window')).LogicalSize(480, 160));
  await appWindow.setMinSize(new (await import('@tauri-apps/api/window')).LogicalSize(320, 100));
  await appWindow.center();
}

export async function exitFloatingMode() {
  if (!isTauri()) return;
  const { appWindow } = await import('@tauri-apps/api/window');
  await appWindow.setDecorations(true);
  await appWindow.setAlwaysOnTop(false);
  await appWindow.setMinSize(new (await import('@tauri-apps/api/window')).LogicalSize(900, 600));
  await appWindow.setSize(new (await import('@tauri-apps/api/window')).LogicalSize(1200, 800));
  await appWindow.center();
}
