//! Basic chat example for Ember
//!
//! Run with:
//! ```bash
//! OPENAI_API_KEY=your_key cargo run --example basic_chat
//! ```

use ember_llm::{CompletionRequest, LLMProvider, Message, OpenAIProvider};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize from environment
    let provider = OpenAIProvider::from_env()?;

    println!("Ember Basic Chat Example\n");

    // Create a simple request
    let request = CompletionRequest::new("gpt-4o-mini")
        .with_message(Message::system("You are a helpful assistant."))
        .with_message(Message::user("What is Rust, and why should I use it?"))
        .with_temperature(0.7)
        .with_max_tokens(500);

    println!("Sending request to OpenAI...\n");

    // Get completion
    let response = provider.complete(request).await?;

    println!("Response:\n");
    println!("{}", response.content);
    println!("\nUsage: {} tokens", response.usage.total_tokens);

    Ok(())
}