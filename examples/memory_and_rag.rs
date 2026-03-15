//! Memory and RAG Example
//!
//! This example demonstrates how to use Ember's vector memory for
//! Retrieval-Augmented Generation (RAG) with local embeddings.
//!
//! # Usage
//! ```bash
//! cargo run --example memory_and_rag
//! ```

use ember_storage::{
    VectorStore, VectorDocument, LocalEmbedder, Embedder,
};
use ember_llm::{CompletionRequest, Message, OllamaProvider, LLMProvider};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("Ember Memory and RAG Example");
    println!("==============================\n");

    // Step 1: Create a local embedder (no external dependencies)
    println!("--- Step 1: Initialize Embedder ---");
    let embedder = LocalEmbedder::new();
    println!("[info] Using LocalEmbedder (n-gram based, works offline)\n");

    // Step 2: Create a vector store
    println!("--- Step 2: Create Vector Store ---");
    let mut store = VectorStore::new(embedder.dimensions());
    println!("[info] Vector store initialized with {} dimensions\n", embedder.dimensions());

    // Step 3: Add some documents (knowledge base)
    println!("--- Step 3: Add Documents to Knowledge Base ---");
    
    let documents = vec![
        ("doc1", "Ember is a blazing-fast AI agent framework written in Rust. It provides memory safety, high performance, and works completely offline with Ollama."),
        ("doc2", "To install Ember, you can use: curl -fsSL https://ember.dev/install.sh | sh. This will download and install the ember CLI tool."),
        ("doc3", "Ember supports multiple LLM providers including Ollama (local), OpenAI, and Anthropic. You can switch between them using the --provider flag."),
        ("doc4", "The ember CLI has several commands: 'ember chat' for interactive chat, 'ember tui' for terminal UI, and 'ember config' for configuration."),
        ("doc5", "Ember's agent mode allows the AI to use tools like shell commands, filesystem operations, and web requests. Enable it with --tools flag."),
        ("doc6", "Ember uses local embeddings for vector search, which means it can work completely offline without any API calls for the memory system."),
        ("doc7", "Checkpoints in Ember allow you to save and restore conversation state. Use the checkpoint manager to create snapshots before important operations."),
        ("doc8", "The MCP (Model Context Protocol) in Ember enables interoperability with tools like Cline and Continue. It uses JSON-RPC 2.0 for communication."),
    ];

    for (id, content) in &documents {
        let embedding = embedder.embed(content)?;
        let doc = VectorDocument {
            id: id.to_string(),
            content: content.to_string(),
            embedding,
            metadata: Default::default(),
        };
        store.add(doc);
        println!("[added] {}: {}...", id, &content[..50.min(content.len())]);
    }
    println!("\n[info] Added {} documents to vector store\n", documents.len());

    // Step 4: Query the knowledge base
    println!("--- Step 4: Query Knowledge Base ---");
    
    let queries = vec![
        "How do I install Ember?",
        "What tools can the agent use?",
        "Does Ember work offline?",
        "What is MCP?",
    ];

    for query in &queries {
        println!("\n[query] {}", query);
        
        let query_embedding = embedder.embed(query)?;
        let results = store.search(&query_embedding, 2);

        println!("[results] Top {} matches:", results.len());
        for (i, (doc, score)) in results.iter().enumerate() {
            println!("  {}. [score: {:.3}] {}", 
                i + 1, 
                score, 
                truncate(&doc.content, 80)
            );
        }
    }

    // Step 5: RAG - Use retrieved context in LLM prompt
    println!("\n--- Step 5: RAG with LLM ---");
    
    // Create LLM provider
    let provider = OllamaProvider::new()
        .with_base_url("http://localhost:11434")
        .with_default_model("llama3.2");

    let user_question = "How do I use agent mode in Ember with tools?";
    println!("\n[question] {}", user_question);

    // Retrieve relevant context
    let query_embedding = embedder.embed(user_question)?;
    let context_docs = store.search(&query_embedding, 3);

    // Build context from retrieved documents
    let context: String = context_docs
        .iter()
        .map(|(doc, _)| format!("- {}", doc.content))
        .collect::<Vec<_>>()
        .join("\n");

    println!("\n[context] Retrieved {} relevant documents", context_docs.len());

    // Build RAG prompt
    let system_prompt = format!(
        "You are a helpful assistant that answers questions about Ember, an AI agent framework.\n\n\
         Use the following context to answer the user's question. If the answer is not in the context, \
         say you don't know.\n\n\
         Context:\n{}\n\n\
         Answer the question concisely and accurately based on the context above.",
        context
    );

    let request = CompletionRequest::new("llama3.2")
        .with_message(Message::system(&system_prompt))
        .with_message(Message::user(user_question))
        .with_temperature(0.3)
        .with_max_tokens(300);

    println!("[info] Sending RAG query to LLM...");
    
    match provider.complete(request).await {
        Ok(response) => {
            println!("\n[answer] {}", response.content);
        }
        Err(e) => {
            println!("\n[error] LLM request failed: {}", e);
            println!("[info] Make sure Ollama is running with: ollama serve");
        }
    }

    // Step 6: Demonstrate similarity search
    println!("\n--- Step 6: Similarity Search ---");
    
    let new_query = "Ember performance and speed";
    println!("\n[similarity query] {}", new_query);
    
    let query_embedding = embedder.embed(new_query)?;
    let all_results = store.search(&query_embedding, documents.len());

    println!("[all documents ranked by similarity]");
    for (i, (doc, score)) in all_results.iter().enumerate() {
        let bar = "=".repeat(((score * 50.0) as usize).min(50));
        println!("  {}: [{:<50}] {:.3}", doc.id, bar, score);
    }

    println!("\n[done] Example completed");
    Ok(())
}

/// Truncate a string to a maximum length
fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len - 3])
    }
}