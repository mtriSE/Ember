//! Browser automation for Ember AI agent.
//!
//! This crate provides headless browser control using Chrome DevTools Protocol (CDP).
//! It enables AI agents to interact with web pages, click elements, fill forms,
//! take screenshots, and execute JavaScript.
//!
//! # Features
//!
//! - **Headless Browser Control**: Launch and control Chrome/Chromium browsers
//! - **Element Interaction**: Click, type, and read content from web elements
//! - **Screenshots**: Capture full page or element screenshots
//! - **JavaScript Execution**: Run arbitrary JavaScript on pages
//! - **Tool Integration**: Implements `ember_tools::ToolHandler` trait for agent use
//!
//! # Example
//!
//! ```rust,no_run
//! use ember_browser::{BrowserController, BrowserConfig2};
//!
//! #[tokio::main]
//! async fn main() -> anyhow::Result<()> {
//!     let browser = BrowserController::new();
//!     
//!     browser.launch().await?;
//!     browser.navigate("https://example.com").await?;
//!     
//!     let result = browser.screenshot().await?;
//!     println!("Screenshot captured: {} bytes", result.screenshot.unwrap().len());
//!     
//!     browser.close().await?;
//!     Ok(())
//! }
//! ```
//!
//! # Using as a Tool
//!
//! ```rust,no_run
//! use ember_browser::BrowserTool;
//! use ember_tools::ToolHandler;
//! use serde_json::json;
//!
//! #[tokio::main]
//! async fn main() -> anyhow::Result<()> {
//!     let tool = BrowserTool::new();
//!     
//!     // Launch browser
//!     tool.execute(json!({"action": "launch"})).await?;
//!     
//!     // Navigate to a page
//!     tool.execute(json!({
//!         "action": "navigate",
//!         "url": "https://example.com"
//!     })).await?;
//!     
//!     // Click a button
//!     tool.execute(json!({
//!         "action": "click",
//!         "selector": "#submit-button"
//!     })).await?;
//!     
//!     // Close browser
//!     tool.execute(json!({"action": "close"})).await?;
//!     
//!     Ok(())
//! }
//! ```

#![deny(missing_docs)]

pub mod browser;
pub mod error;
pub mod tool;

// Re-exports for convenience
pub use browser::{BrowserActionResult, BrowserConfig2, BrowserController, ScrollDirection};
pub use error::{BrowserError, Result};
pub use tool::{BrowserAction, BrowserTool};

// Re-export ToolHandler for convenience
pub use ember_tools::ToolHandler;
