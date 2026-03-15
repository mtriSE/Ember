//! Checkpoints Example
//!
//! This example demonstrates how to use Ember's checkpoint system
//! to save and restore conversation state.
//!
//! # Usage
//! ```bash
//! cargo run --example checkpoints
//! ```

use ember_core::{
    CheckpointManager, CheckpointConfig, Checkpoint,
    conversation::{Conversation, Turn, TurnRole},
};
use std::path::PathBuf;
use tempfile::tempdir;

fn main() -> anyhow::Result<()> {
    println!("Ember Checkpoints Example");
    println!("==========================\n");

    // Create a temporary directory for checkpoints
    let temp_dir = tempdir()?;
    let checkpoint_path = temp_dir.path().to_path_buf();
    println!("[info] Checkpoint directory: {:?}\n", checkpoint_path);

    // Step 1: Create checkpoint manager
    println!("--- Step 1: Initialize Checkpoint Manager ---");
    let config = CheckpointConfig {
        max_checkpoints: 10,
        auto_checkpoint_interval: 3, // Auto-checkpoint every 3 turns
        checkpoint_dir: checkpoint_path.clone(),
    };
    let mut manager = CheckpointManager::new(config);
    println!("[info] Manager created with max {} checkpoints\n", 10);

    // Step 2: Simulate a conversation
    println!("--- Step 2: Simulate Conversation ---");
    let mut conversation = Conversation::new("test-session");

    // Turn 1
    conversation.add_turn(Turn {
        role: TurnRole::User,
        content: "Hello! Can you help me with Rust?".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    conversation.add_turn(Turn {
        role: TurnRole::Assistant,
        content: "Of course! I'd be happy to help you with Rust. What would you like to know?".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    println!("[turn 1] User asks for help with Rust");

    // Turn 2
    conversation.add_turn(Turn {
        role: TurnRole::User,
        content: "How do I handle errors in Rust?".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    conversation.add_turn(Turn {
        role: TurnRole::Assistant,
        content: "In Rust, you can handle errors using Result<T, E> type and the ? operator...".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    println!("[turn 2] User asks about error handling");

    // Step 3: Create a manual checkpoint
    println!("\n--- Step 3: Create Manual Checkpoint ---");
    let checkpoint1 = manager.create_checkpoint(&conversation, Some("before-code-example"))?;
    println!("[checkpoint] Created: {} (tag: before-code-example)", checkpoint1.id);
    println!("[checkpoint] Conversation has {} turns", conversation.turns().len());

    // Turn 3 - User asks for a code example
    conversation.add_turn(Turn {
        role: TurnRole::User,
        content: "Can you show me a code example?".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    conversation.add_turn(Turn {
        role: TurnRole::Assistant,
        content: "Here's an example:\n```rust\nfn divide(a: i32, b: i32) -> Result<i32, String> {\n    if b == 0 {\n        Err(\"Division by zero\".to_string())\n    } else {\n        Ok(a / b)\n    }\n}\n```".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    println!("[turn 3] User asks for code example");
    println!("[info] Current conversation: {} turns", conversation.turns().len());

    // Step 4: Create another checkpoint (auto-triggered by interval)
    println!("\n--- Step 4: Auto Checkpoint (every 3 turns) ---");
    let checkpoint2 = manager.auto_checkpoint(&conversation)?;
    if let Some(cp) = checkpoint2 {
        println!("[auto-checkpoint] Created: {}", cp.id);
    } else {
        println!("[auto-checkpoint] Not needed yet (interval not reached)");
    }

    // Turn 4 - Oops, user makes a mistake
    conversation.add_turn(Turn {
        role: TurnRole::User,
        content: "Actually, I want to learn about async/await instead.".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    conversation.add_turn(Turn {
        role: TurnRole::Assistant,
        content: "No problem! Let me explain async/await in Rust...".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    println!("[turn 4] User changes topic to async/await");

    // Step 5: List all checkpoints
    println!("\n--- Step 5: List Checkpoints ---");
    let checkpoints = manager.list_checkpoints();
    println!("[info] {} checkpoint(s) available:", checkpoints.len());
    for cp in &checkpoints {
        let tag = cp.tag.as_ref().map(|t| format!(" ({})", t)).unwrap_or_default();
        println!("  - {}{}: {} turns", cp.id, tag, cp.turn_count);
    }

    // Step 6: Restore to earlier checkpoint
    println!("\n--- Step 6: Restore Previous Checkpoint ---");
    println!("[info] Current conversation: {} turns", conversation.turns().len());
    println!("[action] Restoring to 'before-code-example' checkpoint...");

    if let Some(restored) = manager.restore_by_tag("before-code-example")? {
        conversation = restored;
        println!("[restored] Conversation now has {} turns", conversation.turns().len());
        println!("[info] Last message: {}...", 
            truncate(&conversation.turns().last().unwrap().content, 50));
    } else {
        println!("[error] Checkpoint not found!");
    }

    // Step 7: Continue from restored state
    println!("\n--- Step 7: Continue from Restored State ---");
    conversation.add_turn(Turn {
        role: TurnRole::User,
        content: "Can you explain the ? operator?".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    conversation.add_turn(Turn {
        role: TurnRole::Assistant,
        content: "The ? operator is a shorthand for error propagation...".to_string(),
        timestamp: chrono::Utc::now(),
        metadata: Default::default(),
    });
    println!("[turn] User asks about ? operator (different path)");
    println!("[info] Conversation now has {} turns", conversation.turns().len());

    // Step 8: Cleanup old checkpoints
    println!("\n--- Step 8: Cleanup ---");
    let preserved = manager.cleanup_old_checkpoints(2)?;
    println!("[cleanup] Kept {} most recent checkpoints", preserved);

    // Final state
    println!("\n--- Final State ---");
    println!("[conversation]");
    for (i, turn) in conversation.turns().iter().enumerate() {
        let role = match turn.role {
            TurnRole::User => "User",
            TurnRole::Assistant => "Assistant",
            _ => "System",
        };
        println!("  {}: {}: {}...", i + 1, role, truncate(&turn.content, 40));
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