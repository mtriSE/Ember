//! Ember Desktop Application
//!
//! A Tauri-based desktop application for the Ember AI agent.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIcon, TrayIconBuilder},
    App, Manager,
};

/// Chat request from frontend
#[derive(Debug, Clone, serde::Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub model: Option<String>,
}

/// Chat response to frontend
#[derive(Debug, Clone, serde::Serialize)]
pub struct ChatResponse {
    pub message: String,
    pub model: String,
}

/// Send a chat message to the LLM
#[tauri::command]
async fn chat(request: ChatRequest) -> Result<ChatResponse, String> {
    // In a full implementation, this would use ember-llm
    // For now, return a placeholder
    Ok(ChatResponse {
        message: format!("Echo: {}", request.message),
        model: request.model.unwrap_or_else(|| "default".to_string()),
    })
}

/// Get server info
#[tauri::command]
fn get_info() -> serde_json::Value {
    serde_json::json!({
        "name": "Ember AI Desktop",
        "version": env!("CARGO_PKG_VERSION"),
        "platform": std::env::consts::OS,
    })
}

/// Setup system tray
fn setup_tray(app: &App) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    let quit = MenuItem::with_id(app, "quit", "Quit Ember", true, None::<&str>)?;
    let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &quit])?;

    let tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Ember AI")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        })
        .build(app)?;

    Ok(tray)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![chat, get_info])
        .setup(|app| {
            // Setup system tray
            let _tray = setup_tray(app)?;

            // Register global shortcut (Cmd/Ctrl + Shift + E)
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

                let shortcut: Shortcut = "CommandOrControl+Shift+E".parse()?;
                let app_handle = app.handle().clone();

                app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, _event| {
                    if let Some(window) = app_handle.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}