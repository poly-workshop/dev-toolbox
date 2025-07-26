use chrono::{DateTime, Local, TimeZone, Utc, NaiveDateTime};
use serde::{Deserialize, Serialize};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[derive(Debug, Serialize, Deserialize)]
pub struct TimestampConversionRequest {
    pub input: String,
    pub mode: String, // "timestamp-to-time" or "time-to-timestamp"
    pub unit: String, // "seconds" or "milliseconds"
    pub format: Option<String>, // "local", "utc", "iso" (only for timestamp-to-time)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimestampConversionResponse {
    pub success: bool,
    pub result: Option<String>,
    pub error: Option<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn convert_timestamp(request: TimestampConversionRequest) -> TimestampConversionResponse {
    match request.mode.as_str() {
        "timestamp-to-time" => {
            match timestamp_to_time(&request.input, &request.unit, request.format.as_deref()) {
                Ok(result) => TimestampConversionResponse {
                    success: true,
                    result: Some(result),
                    error: None,
                },
                Err(error) => TimestampConversionResponse {
                    success: false,
                    result: None,
                    error: Some(error),
                },
            }
        }
        "time-to-timestamp" => {
            match time_to_timestamp(&request.input, &request.unit) {
                Ok(result) => TimestampConversionResponse {
                    success: true,
                    result: Some(result),
                    error: None,
                },
                Err(error) => TimestampConversionResponse {
                    success: false,
                    result: None,
                    error: Some(error),
                },
            }
        }
        _ => TimestampConversionResponse {
            success: false,
            result: None,
            error: Some("Invalid mode".to_string()),
        },
    }
}

fn timestamp_to_time(timestamp: &str, unit: &str, format: Option<&str>) -> Result<String, String> {
    let num: i64 = timestamp.parse().map_err(|_| "Invalid timestamp".to_string())?;
    
    // Convert to milliseconds if needed
    let milliseconds = match unit {
        "seconds" => num * 1000,
        "milliseconds" => num,
        _ => return Err("Invalid unit".to_string()),
    };
    
    // Create DateTime from timestamp
    let datetime = Utc.timestamp_millis_opt(milliseconds)
        .single()
        .ok_or("Timestamp out of valid range".to_string())?;
    
    // Format based on requested format
    let result = match format.unwrap_or("local") {
        "local" => {
            let local_datetime: DateTime<Local> = DateTime::from(datetime);
            local_datetime.format("%Y-%m-%d %H:%M:%S").to_string()
        }
        "utc" => datetime.format("%a, %d %b %Y %H:%M:%S GMT").to_string(),
        "iso" => datetime.to_rfc3339(),
        _ => return Err("Invalid format".to_string()),
    };
    
    Ok(result)
}

fn time_to_timestamp(time_str: &str, unit: &str) -> Result<String, String> {
    // Try to parse the time string
    let datetime = if let Ok(dt) = DateTime::parse_from_rfc3339(time_str) {
        dt.naive_utc()
    } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M:%S") {
        dt
    } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M") {
        dt
    } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d") {
        dt
    } else {
        return Err("Invalid time format".to_string());
    };
    
    // Convert to timestamp
    let timestamp = datetime.and_utc().timestamp_millis();
    
    // Return based on requested unit
    match unit {
        "seconds" => Ok((timestamp / 1000).to_string()),
        "milliseconds" => Ok(timestamp.to_string()),
        _ => Err("Invalid unit".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, convert_timestamp])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
