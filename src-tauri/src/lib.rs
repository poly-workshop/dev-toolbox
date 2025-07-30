use chrono::{DateTime, Local, NaiveDateTime, TimeZone, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TimestampConversionRequest {
    pub input: String,
    pub mode: String,           // "timestamp-to-time" or "time-to-timestamp"
    pub unit: String,           // "seconds" or "milliseconds"
    pub format: Option<String>, // Format options: "local-readable", "utc-readable", "rfc3339", "iso8601-basic", "iso8601-extended", "rfc2822"
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
async fn get_current_time(unit: String, format: Option<String>) -> TimestampConversionResponse {
    let now = chrono::Utc::now();

    match unit.as_str() {
        "seconds" | "milliseconds" => {
            // Return timestamp
            let timestamp = if unit == "seconds" {
                now.timestamp().to_string()
            } else {
                now.timestamp_millis().to_string()
            };

            TimestampConversionResponse {
                success: true,
                result: Some(timestamp),
                error: None,
            }
        }
        "formatted" => {
            // Return formatted time
            let result = match format.as_deref().unwrap_or("local-readable") {
                "local-readable" => {
                    let local_datetime: DateTime<Local> = DateTime::from(now);
                    local_datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                }
                "utc-readable" => now.format("%Y-%m-%d %H:%M:%S UTC").to_string(),
                "rfc3339" => now.to_rfc3339(),
                "iso8601-basic" => now.format("%Y%m%dT%H%M%S%.3fZ").to_string(),
                "iso8601-extended" => now.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
                "rfc2822" => now.format("%a, %d %b %Y %H:%M:%S GMT").to_string(),
                _ => {
                    return TimestampConversionResponse {
                        success: false,
                        result: None,
                        error: Some("Invalid format".to_string()),
                    }
                }
            };

            TimestampConversionResponse {
                success: true,
                result: Some(result),
                error: None,
            }
        }
        _ => TimestampConversionResponse {
            success: false,
            result: None,
            error: Some("Invalid unit".to_string()),
        },
    }
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
            match time_to_timestamp(&request.input, &request.unit, request.format.as_deref()) {
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
    let num: i64 = timestamp
        .parse()
        .map_err(|_| "Invalid timestamp".to_string())?;

    // Convert to milliseconds if needed
    let milliseconds = match unit {
        "seconds" => num * 1000,
        "milliseconds" => num,
        _ => return Err("Invalid unit".to_string()),
    };

    // Create DateTime from timestamp
    let datetime = Utc
        .timestamp_millis_opt(milliseconds)
        .single()
        .ok_or("Timestamp out of valid range".to_string())?;

    // Format based on requested format
    let result = match format.unwrap_or("local-readable") {
        "local-readable" => {
            let local_datetime: DateTime<Local> = DateTime::from(datetime);
            local_datetime.format("%Y-%m-%d %H:%M:%S").to_string()
        }
        "utc-readable" => datetime.format("%Y-%m-%d %H:%M:%S UTC").to_string(),
        "rfc3339" => datetime.to_rfc3339(),
        "iso8601-basic" => datetime.format("%Y%m%dT%H%M%S%.3fZ").to_string(),
        "iso8601-extended" => datetime.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
        "rfc2822" => datetime.format("%a, %d %b %Y %H:%M:%S GMT").to_string(),
        _ => return Err("Invalid format".to_string()),
    };

    Ok(result)
}

fn time_to_timestamp(time_str: &str, unit: &str, format: Option<&str>) -> Result<String, String> {
    // Try to parse the time string with different formats
    // If format is specified, try that format first, then fall back to auto-detection
    let datetime = if let Some(fmt) = format {
        match fmt {
            "rfc3339" => {
                if let Ok(dt) = DateTime::parse_from_rfc3339(time_str) {
                    dt.naive_utc()
                } else {
                    return Err("Invalid RFC 3339 format".to_string());
                }
            }
            "rfc2822" => {
                if let Ok(dt) = DateTime::parse_from_rfc2822(time_str) {
                    dt.naive_utc()
                } else {
                    return Err("Invalid RFC 2822 format".to_string());
                }
            }
            "iso8601-basic" => {
                if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%S%.3fZ") {
                    dt
                } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%SZ") {
                    dt
                } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%S%.3f")
                {
                    dt
                } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%S") {
                    dt
                } else {
                    return Err("Invalid ISO 8601 basic format".to_string());
                }
            }
            "iso8601-extended" => {
                if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%S%.3fZ") {
                    dt
                } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%SZ")
                {
                    dt
                } else if let Ok(dt) =
                    NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%S%.3f")
                {
                    dt
                } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%S")
                {
                    dt
                } else {
                    return Err("Invalid ISO 8601 extended format".to_string());
                }
            }
            "local-readable" => {
                if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M:%S") {
                    dt
                } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M") {
                    dt
                } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d") {
                    dt
                } else {
                    return Err("Invalid local readable format".to_string());
                }
            }
            "utc-readable" => {
                if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M:%S UTC") {
                    dt
                } else {
                    return Err("Invalid UTC readable format".to_string());
                }
            }
            _ => {
                return Err("Unsupported format".to_string());
            }
        }
    } else {
        // Auto-detect format if no specific format is provided
        if let Ok(dt) = DateTime::parse_from_rfc3339(time_str) {
            // RFC 3339 format: 2024-01-01T12:00:00Z or 2024-01-01T12:00:00+08:00
            dt.naive_utc()
        } else if let Ok(dt) = DateTime::parse_from_rfc2822(time_str) {
            // RFC 2822 format: Mon, 01 Jan 2024 12:00:00 GMT
            dt.naive_utc()
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%S%.3fZ") {
            // ISO 8601 basic format with milliseconds: 20240101T120000.123Z
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%SZ") {
            // ISO 8601 basic format: 20240101T120000Z
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%S%.3f") {
            // ISO 8601 basic format with milliseconds without Z: 20240101T120000.123
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y%m%dT%H%M%S") {
            // ISO 8601 basic format without Z: 20240101T120000
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%S%.3fZ") {
            // ISO 8601 extended format with milliseconds: 2024-01-01T12:00:00.123Z
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%SZ") {
            // ISO 8601 extended format: 2024-01-01T12:00:00Z
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%S%.3f") {
            // ISO 8601 extended format with milliseconds without Z: 2024-01-01T12:00:00.123
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M:%S") {
            // ISO 8601 extended format without Z: 2024-01-01T12:00:00
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M:%S UTC") {
            // UTC readable format: 2024-01-01 12:00:00 UTC
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M:%S") {
            // Local readable format: 2024-01-01 12:00:00
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M") {
            // Without seconds: 2024-01-01 12:00
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d") {
            // Date only: 2024-01-01 (assumes 00:00:00)
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y/%m/%d %H:%M:%S") {
            // Alternative format with slashes: 2024/01/01 12:00:00
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%Y/%m/%d") {
            // Date only with slashes: 2024/01/01
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%m/%d/%Y %H:%M:%S") {
            // US format: 01/01/2024 12:00:00
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%m/%d/%Y") {
            // US date format: 01/01/2024
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%d/%m/%Y %H:%M:%S") {
            // European format: 01/01/2024 12:00:00
            dt
        } else if let Ok(dt) = NaiveDateTime::parse_from_str(time_str, "%d/%m/%Y") {
            // European date format: 01/01/2024
            dt
        } else {
            return Err("Invalid time format. Supported formats: RFC 3339, RFC 2822, ISO 8601, YYYY-MM-DD HH:MM:SS, YYYY/MM/DD, MM/DD/YYYY, DD/MM/YYYY, etc.".to_string());
        }
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
        .invoke_handler(tauri::generate_handler![
            greet,
            convert_timestamp,
            get_current_time
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
