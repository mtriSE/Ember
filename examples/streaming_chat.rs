//! Streaming chat example for Ember
//!
//! Demonstrates real-time streaming output from the LLM.
//!
//! Run with:
//! ```bash
//! OPENAI_API_KEY=your_key cargo run --example streaming_chat
//! ```

use ember_llm::{CompletionRequest, LLMProvider, Message, OpenAIProvider};
use futures::StreamExt;
use std::io::{self, Write};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize from environment
    let provider = OpenAIProvider::from_env()?;

    println!("Ember Streaming Chat Example\n");

    // Create a streaming request
    let request = CompletionRequest::new("gpt-4o-mini")
        .with_message(Message::system("You are a creative storyteller."))
        .with_message(Message::user("Write a short story about a robot learning to paint."))
        .with_temperature(0.9)
        .with_max_tokens(1000);

    println!("Starting stream...\n");
    println!("---");

    // Get streaming response
    let mut stream = provider.complete_stream(request).await?;

    // Process chunks as they arrive
    while let Some(result) = stream.next().await {
        match result {
            Ok(chunk) => {
                if let Some(content) = chunk.content {
                    print!("{}", content);
                    io::stdout().flush()?;
                }

                if chunk.done {
                    println!("\n---");
                    println!("\nStream complete!");
                }
            }
            Err(e) => {
                eprintln!("\nError: {}", e);
                break;
            }
        }
    }

    Ok(())
}