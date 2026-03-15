//! Multi-Provider Example
//!
//! This example demonstrates how to use multiple LLM providers and switch
//! between them dynamically (Ollama for local, OpenAI for cloud).
//!
//! # Usage
//! ```bash
//! # With Ollama (default)
//! cargo run --example multi_provider
//!
//! # With OpenAI (requires OPENAI_API_KEY)
//! OPENAI_API_KEY=sk-... cargo run --example multi_provider -- --provider openai
//! ```

use ember_llm::{
    CompletionRequest, LLMProvider, Message,
    OllamaProvider, OpenAIProvider,
};
use std::env;
use std::sync::Arc;

/// Create a provider based on the name
fn create_provider(name: &str) -> anyhow::Result<Arc<dyn LLMProvider>> {
    match name.to_lowercase().as_str() {
        "ollama" => {
            let provider = OllamaProvider::new()
                .with_base_url("http://localhost:11434")
                .with_default_model("llama3.2");
            Ok(Arc::new(provider))
        }
        "openai" => {
            let api_key = env::var("OPENAI_API_KEY")
                .map_err(|_| anyhow::anyhow!("OPENAI_API_KEY environment variable not set"))?;
            let provider = OpenAIProvider::new(api_key)
                .with_default_model("gpt-4o-mini");
            Ok(Arc::new(provider))
        }
        _ => Err(anyhow::anyhow!("Unknown provider: {}", name)),
    }
}

/// Simple router that chooses provider based on task complexity
fn choose_provider(task: &str, providers: &[Arc<dyn LLMProvider>]) -> Arc<dyn LLMProvider> {
    // Simple heuristic: use more powerful provider for complex tasks
    let is_complex = task.len() > 100 
        || task.contains("analyze")
        || task.contains("explain")
        || task.contains("code");

    if is_complex && providers.len() > 1 {
        println!("[router] Complex task detected, using {}", providers[1].name());
        Arc::clone(&providers[1])
    } else {
        println!("[router] Simple task, using {}", providers[0].name());
        Arc::clone(&providers[0])
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("Ember Multi-Provider Example");
    println!("==============================\n");

    // Parse command line arguments
    let args: Vec<String> = env::args().collect();
    let provider_name = if args.len() > 2 && args[1] == "--provider" {
        &args[2]
    } else {
        "ollama"
    };

    // Create the specified provider
    let provider = create_provider(provider_name)?;
    println!("[info] Using provider: {}", provider.name());
    println!();

    // Example 1: Simple completion
    println!("--- Example 1: Simple Completion ---");
    let request = CompletionRequest::new(provider.default_model())
        .with_message(Message::user("What is Rust programming language in one sentence?"))
        .with_temperature(0.7);

    let response = provider.complete(request).await?;
    println!("[response] {}\n", response.content);

    // Example 2: With system prompt
    println!("--- Example 2: With System Prompt ---");
    let request = CompletionRequest::new(provider.default_model())
        .with_message(Message::system("You are a helpful coding assistant. Be concise."))
        .with_message(Message::user("How do I read a file in Rust?"))
        .with_temperature(0.5);

    let response = provider.complete(request).await?;
    println!("[response] {}\n", response.content);

    // Example 3: Multi-turn conversation
    println!("--- Example 3: Multi-turn Conversation ---");
    let request = CompletionRequest::new(provider.default_model())
        .with_message(Message::system("You are a helpful assistant."))
        .with_message(Message::user("My name is Alice."))
        .with_message(Message::assistant("Hello Alice! Nice to meet you. How can I help you today?"))
        .with_message(Message::user("What's my name?"))
        .with_temperature(0.3);

    let response = provider.complete(request).await?;
    println!("[response] {}\n", response.content);

    // Example 4: Provider comparison (if multiple available)
    println!("--- Example 4: Provider Routing ---");
    
    // Try to create both providers
    let mut providers: Vec<Arc<dyn LLMProvider>> = Vec::new();
    
    if let Ok(ollama) = create_provider("ollama") {
        providers.push(ollama);
    }
    
    if let Ok(openai) = create_provider("openai") {
        providers.push(openai);
    }

    if !providers.is_empty() {
        // Simple task
        let simple_task = "Say hello";
        let provider = choose_provider(simple_task, &providers);
        println!("[task] {}", simple_task);
        
        let request = CompletionRequest::new(provider.default_model())
            .with_message(Message::user(simple_task));
        
        if let Ok(response) = provider.complete(request).await {
            println!("[response] {}\n", response.content);
        }

        // Complex task
        let complex_task = "Analyze the trade-offs between async/await and threads in Rust for high-performance applications";
        let provider = choose_provider(complex_task, &providers);
        println!("[task] {}", complex_task);
        
        let request = CompletionRequest::new(provider.default_model())
            .with_message(Message::user(complex_task))
            .with_max_tokens(500);
        
        if let Ok(response) = provider.complete(request).await {
            println!("[response] {}\n", response.content);
        }
    }

    println!("[done] Example completed");
    Ok(())
}