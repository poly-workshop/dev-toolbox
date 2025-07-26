mod timestamp;

use timestamp::{TimestampConversionRequest, TimestampConversionResponse};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
}

#[tauri::command]
async fn get_current_time(unit: String, format: Option<String>) -> TimestampConversionResponse {
    timestamp::get_current_time(unit, format).await
}

#[tauri::command]
async fn convert_timestamp(request: TimestampConversionRequest) -> TimestampConversionResponse {
    timestamp::convert_timestamp(request).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            convert_timestamp,
            get_current_time
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
