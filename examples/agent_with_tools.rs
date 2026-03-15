//! Agent with Tools Example
//!
//! This example demonstrates how to create an AI agent that can use tools
//! like shell commands, filesystem operations, and web requests.
//!
//! # Usage
//! ```bash
//! cargo run --example agent_with_tools
//! ```

use ember_core::{Agent, AgentConfig};
use ember_llm::{OllamaProvider, LLMProvider};
use ember_tools::{ToolRegistry, ShellTool, FilesystemTool, WebTool};
use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    println!("Ember Agent with Tools Example");
    println!("================================\n");

    // Create the LLM provider (using Ollama with local model)
    let provider = OllamaProvider::new()
        .with_base_url("http://localhost:11434")
        .with_default_model("llama3.2");

    println!("[info] Using Ollama with llama3.2");

    // Create a tool registry with available tools
    let mut registry = ToolRegistry::new();
    
    // Register tools
    registry.register(ShellTool::new());
    registry.register(FilesystemTool::new());
    registry.register(WebTool::new());

    println!("[info] Registered {} tools: {:?}", registry.len(), registry.tool_names());

    // Get tool definitions for the LLM
    let tools = registry.llm_tool_definitions();
    println!("[info] Tool definitions ready for LLM\n");

    // Example: Ask the agent to perform a task that requires tools
    let task = "List all Rust files in the current directory and count them";
    println!("[task] {}\n", task);

    // Build the request with tools
    let request = ember_llm::CompletionRequest::new("llama3.2")
        .with_message(ember_llm::Message::system(
            "You are a helpful AI assistant. When asked to perform tasks, use the available tools. \
             For shell commands, use the 'shell' tool. For file operations, use the 'filesystem' tool."
        ))
        .with_message(ember_llm::Message::user(task))
        .with_tools(tools)
        .with_temperature(0.7);

    // Get response from LLM
    println!("[info] Sending request to LLM...");
    let response = provider.complete(request).await?;

    // Check if the LLM wants to use tools
    if !response.tool_calls.is_empty() {
        println!("\n[info] LLM requested {} tool call(s)\n", response.tool_calls.len());

        for call in &response.tool_calls {
            println!("[tool] Executing: {} with args: {}", call.name, call.arguments);

            // Execute the tool
            match registry.execute_tool_call(call).await {
                Ok(result) => {
                    if result.success {
                        println!("[result] Success:\n{}\n", result.output);
                    } else {
                        println!("[result] Failed:\n{}\n", result.output);
                    }
                }
                Err(e) => {
                    println!("[error] Tool execution failed: {}\n", e);
                }
            }
        }
    } else {
        println!("\n[response] {}\n", response.content);
    }

    println!("[done] Example completed");
    Ok(())
}