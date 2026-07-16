#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, Manager};

#[tauri::command]
fn set_skip_taskbar(window: tauri::Window, skip: bool) {
    window.set_skip_taskbar(skip).unwrap_or_default();
}

fn main() {
    // 系统托盘菜单
    let show = CustomMenuItem::new("show".to_string(), "显示主窗口");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                // 左键点击托盘图标：通知前端退出悬浮模式并显示主窗口
                let window = app.get_window("main").unwrap();
                window.emit("tray-show-main", ()).unwrap_or_default();
                window.show().unwrap_or_default();
                window.set_focus().unwrap_or_default();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.emit("tray-show-main", ()).unwrap_or_default();
                    window.show().unwrap_or_default();
                    window.set_focus().unwrap_or_default();
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![set_skip_taskbar])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
