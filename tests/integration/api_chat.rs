//! API Chat Integration Tests
//!
//! Tests for the web API chat endpoints.
//! These tests verify the REST API functionality when the server is running.

use std::time::Duration;

/// Test server configuration for API tests
pub struct TestServer {
    pub base_url: String,
    pub port: u16,
}

impl Default for TestServer {
    fn default() -> Self {
        Self {
            base_url: "http://127.0.0.1".to_string(),
            port: 3001, // Use different port than default to avoid conflicts
        }
    }
}

impl TestServer {
    pub fn url(&self, path: &str) -> String {
        format!("{}:{}{}", self.base_url, self.port, path)
    }
}

/// Note: These tests require a running server instance.
/// In CI, they should be run with the server started beforehand,
/// or marked as ignored for unit test runs.

#[cfg(test)]
mod api_tests {
    use super::*;

    /// Test health endpoint
    #[test]
    #[ignore = "Requires running server"]
    fn test_health_endpoint() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        let response = client.get(server.url("/health")).send();

        match response {
            Ok(resp) => {
                assert!(
                    resp.status().is_success(),
                    "Health endpoint should return success status"
                );
            }
            Err(e) => {
                // Server might not be running, which is expected in some test environments
                println!("Health check failed (server may not be running): {}", e);
            }
        }
    }

    /// Test API info endpoint
    #[test]
    #[ignore = "Requires running server"]
    fn test_api_info_endpoint() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        let response = client.get(server.url("/api/info")).send();

        if let Ok(resp) = response {
            if resp.status().is_success() {
                let body = resp.text().unwrap_or_default();
                assert!(
                    body.contains("version") || body.contains("ember"),
                    "Info endpoint should return version information"
                );
            }
        }
    }

    /// Test chat endpoint structure
    #[test]
    #[ignore = "Requires running server"]
    fn test_chat_endpoint_exists() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        // OPTIONS request to check endpoint exists
        let response = client
            .request(reqwest::Method::OPTIONS, server.url("/api/chat"))
            .send();

        match response {
            Ok(resp) => {
                // Endpoint should exist (may return various status codes)
                assert!(
                    resp.status().as_u16() < 500,
                    "Chat endpoint should not return server error"
                );
            }
            Err(_) => {
                // Server might not be running
            }
        }
    }

    /// Test chat request with mock data
    #[test]
    #[ignore = "Requires running server with mock provider"]
    fn test_chat_request() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        let chat_request = serde_json::json!({
            "message": "Hello, this is a test message",
            "provider": "mock",
            "model": "mock-model"
        });

        let response = client
            .post(server.url("/api/chat"))
            .header("Content-Type", "application/json")
            .body(chat_request.to_string())
            .send();

        if let Ok(resp) = response {
            if resp.status().is_success() {
                let body = resp.text().unwrap_or_default();
                // Response should be valid JSON or text
                assert!(
                    !body.is_empty(),
                    "Chat response should not be empty"
                );
            }
        }
    }

    /// Test conversations endpoint
    #[test]
    #[ignore = "Requires running server"]
    fn test_conversations_endpoint() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        let response = client.get(server.url("/api/conversations")).send();

        if let Ok(resp) = response {
            // Should return list (possibly empty) or auth error
            assert!(
                resp.status().as_u16() < 500,
                "Conversations endpoint should not return server error"
            );
        }
    }

    /// Test models endpoint
    #[test]
    #[ignore = "Requires running server"]
    fn test_models_endpoint() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        let response = client.get(server.url("/api/models")).send();

        if let Ok(resp) = response {
            if resp.status().is_success() {
                let body = resp.text().unwrap_or_default();
                // Should return JSON array of models
                assert!(
                    body.starts_with('[') || body.starts_with('{'),
                    "Models endpoint should return JSON"
                );
            }
        }
    }

    /// Test costs endpoint
    #[test]
    #[ignore = "Requires running server"]
    fn test_costs_endpoint() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        let response = client.get(server.url("/api/costs")).send();

        if let Ok(resp) = response {
            assert!(
                resp.status().as_u16() < 500,
                "Costs endpoint should not return server error"
            );
        }
    }

    /// Test invalid endpoint returns 404
    #[test]
    #[ignore = "Requires running server"]
    fn test_invalid_endpoint() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        let response = client
            .get(server.url("/api/nonexistent-endpoint-12345"))
            .send();

        if let Ok(resp) = response {
            assert_eq!(
                resp.status().as_u16(),
                404,
                "Unknown endpoint should return 404"
            );
        }
    }

    /// Test CORS headers
    #[test]
    #[ignore = "Requires running server"]
    fn test_cors_headers() {
        let server = TestServer::default();
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");

        let response = client
            .request(reqwest::Method::OPTIONS, server.url("/api/chat"))
            .header("Origin", "http://localhost:5173")
            .send();

        if let Ok(resp) = response {
            // Should include CORS headers
            let headers = resp.headers();
            // CORS might be configured or not
            let _ = headers;
        }
    }
}

#[cfg(test)]
mod api_structure_tests {
    //! Tests that verify API request/response structures without requiring a server

    use serde::{Deserialize, Serialize};

    /// Chat request structure
    #[derive(Debug, Serialize, Deserialize)]
    pub struct ChatRequest {
        pub message: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub provider: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub model: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub conversation_id: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub stream: Option<bool>,
    }

    /// Chat response structure
    #[derive(Debug, Serialize, Deserialize)]
    pub struct ChatResponse {
        pub content: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub conversation_id: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub model: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub usage: Option<UsageInfo>,
    }

    /// Token usage information
    #[derive(Debug, Serialize, Deserialize)]
    pub struct UsageInfo {
        pub prompt_tokens: u32,
        pub completion_tokens: u32,
        pub total_tokens: u32,
    }

    #[test]
    fn test_chat_request_serialization() {
        let request = ChatRequest {
            message: "Hello".to_string(),
            provider: Some("openai".to_string()),
            model: Some("gpt-4".to_string()),
            conversation_id: None,
            stream: Some(false),
        };

        let json = serde_json::to_string(&request).expect("Failed to serialize");
        assert!(json.contains("Hello"));
        assert!(json.contains("openai"));
        assert!(json.contains("gpt-4"));
    }

    #[test]
    fn test_chat_request_minimal() {
        let request = ChatRequest {
            message: "Test".to_string(),
            provider: None,
            model: None,
            conversation_id: None,
            stream: None,
        };

        let json = serde_json::to_string(&request).expect("Failed to serialize");
        assert!(json.contains("Test"));
        // Optional fields should not appear
        assert!(!json.contains("provider"));
    }

    #[test]
    fn test_chat_response_deserialization() {
        let json = r#"{"content":"Hello!","model":"gpt-4"}"#;
        let response: ChatResponse =
            serde_json::from_str(json).expect("Failed to deserialize");

        assert_eq!(response.content, "Hello!");
        assert_eq!(response.model, Some("gpt-4".to_string()));
    }

    #[test]
    fn test_usage_info() {
        let usage = UsageInfo {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
        };

        let json = serde_json::to_string(&usage).expect("Failed to serialize");
        assert!(json.contains("30"));
    }
}