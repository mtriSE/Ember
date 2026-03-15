//! User-friendly error display for the CLI
//!
//! This module provides beautiful, helpful error messages for terminal output.

#![allow(dead_code)]

use colored::Colorize;

/// Display an error message with helpful suggestions
pub fn display_error(error: &anyhow::Error) {
    // Check if this is an LLM error with user message support
    if let Some(llm_err) = error.downcast_ref::<ember_llm::Error>() {
        display_llm_error(llm_err);
        return;
    }

    // Check if this is a core error
    if let Some(core_err) = error.downcast_ref::<ember_core::Error>() {
        display_core_error(core_err);
        return;
    }

    // Generic error display
    display_generic_error(error);
}

/// Display an LLM-specific error with rich formatting
fn display_llm_error(error: &ember_llm::Error) {
    let user_msg = error.user_message();

    // Print the formatted error
    eprintln!();
    eprintln!("{}", "━".repeat(60).bright_red());
    eprintln!("{}", " ERROR ".bright_white().on_red().bold());
    eprintln!("{}", "━".repeat(60).bright_red());
    eprintln!();

    // Print user-friendly message with preserved formatting
    for line in user_msg.lines() {
        if line.starts_with("💡") || line.starts_with("📖") || line.starts_with("⏱️") {
            eprintln!("  {}", line.bright_cyan());
        } else if line.starts_with("  •")
            || line.starts_with("  1.")
            || line.starts_with("  2.")
            || line.starts_with("  3.")
        {
            eprintln!("  {}", line.bright_white());
        } else if line.contains("export ") || line.contains("ember ") || line.contains("ollama ") {
            eprintln!("  {}", line.bright_green());
        } else {
            eprintln!("  {}", line);
        }
    }

    eprintln!();

    // Add recovery suggestions if available
    let suggestions = error.recovery_suggestions();
    if !suggestions.is_empty() {
        eprintln!("{}", " Quick Actions ".bright_white().on_blue().bold());
        eprintln!();
        for (i, suggestion) in suggestions.iter().enumerate() {
            eprintln!("  {}. {}", i + 1, suggestion.bright_white());
        }
        eprintln!();
    }

    eprintln!("{}", "━".repeat(60).bright_red());
    eprintln!();
}

/// Display a core error
fn display_core_error(error: &ember_core::Error) {
    eprintln!();
    eprintln!("{}", "━".repeat(60).bright_red());
    eprintln!("{}", " ERROR ".bright_white().on_red().bold());
    eprintln!("{}", "━".repeat(60).bright_red());
    eprintln!();

    match error {
        ember_core::Error::Llm(llm_err) => {
            display_llm_error(llm_err);
            return;
        }
        ember_core::Error::ToolExecution { tool, message } => {
            eprintln!(
                "  {} Tool '{}' failed",
                "🔧".bright_red(),
                tool.bright_yellow()
            );
            eprintln!();
            eprintln!("  {}", message.bright_white());
            eprintln!();
            eprintln!("  {}", "Suggestions:".bright_cyan());
            eprintln!("  1. Check the tool configuration");
            eprintln!("  2. Ensure required permissions are granted");
            eprintln!("  3. Try running without the tool: ember chat --tools \"\"");
        }
        ember_core::Error::ContextOverflow { current, max } => {
            eprintln!("  {} Context window exceeded", "📏".bright_red());
            eprintln!();
            eprintln!("  Current: {} tokens", current.to_string().bright_yellow());
            eprintln!("  Maximum: {} tokens", max.to_string().bright_green());
            eprintln!();
            eprintln!("  {}", "Solutions:".bright_cyan());
            eprintln!("  1. Shorten your message");
            eprintln!("  2. Clear conversation: /clear");
            eprintln!("  3. Use a model with larger context");
        }
        ember_core::Error::Timeout { seconds } => {
            eprintln!(
                "  {} Operation timed out after {} seconds",
                "⏱️".bright_red(),
                seconds
            );
            eprintln!();
            eprintln!("  {}", "Suggestions:".bright_cyan());
            eprintln!("  1. Try a simpler request");
            eprintln!("  2. Use a faster provider (e.g., Groq)");
            eprintln!("  3. Check your network connection");
        }
        ember_core::Error::ConversationNotFound(id) => {
            eprintln!("  {} Conversation not found: {}", "❌".bright_red(), id);
            eprintln!();
            eprintln!("  The conversation may have been deleted or expired.");
        }
        ember_core::Error::Config(msg) | ember_core::Error::Configuration(msg) => {
            eprintln!("  {} Configuration error", "⚙️".bright_red());
            eprintln!();
            eprintln!("  {}", msg.bright_white());
            eprintln!();
            eprintln!("  {}", "Actions:".bright_cyan());
            eprintln!("  1. Run: ember config show");
            eprintln!("  2. Run: ember config init");
        }
        _ => {
            eprintln!("  {}", error.to_string().bright_white());
        }
    }

    eprintln!();
    eprintln!("{}", "━".repeat(60).bright_red());
    eprintln!();
}

/// Display a generic error
fn display_generic_error(error: &anyhow::Error) {
    eprintln!();
    eprintln!("{} {}", "Error:".bright_red().bold(), error);

    // Print error chain if available
    let mut source = error.source();
    if source.is_some() {
        eprintln!();
        eprintln!("{}", "Caused by:".bright_yellow());
    }
    while let Some(cause) = source {
        eprintln!("  • {}", cause);
        source = cause.source();
    }

    eprintln!();
    eprintln!(
        "{} Run {} for more information.",
        "💡".bright_cyan(),
        "ember --help".bright_green()
    );
    eprintln!();
}

/// Display a warning message
pub fn display_warning(message: &str) {
    eprintln!("{} {}", "⚠️  Warning:".bright_yellow().bold(), message);
}

/// Display a success message
pub fn display_success(message: &str) {
    println!("{} {}", "✓".bright_green().bold(), message.bright_white());
}

/// Display an info message
pub fn display_info(message: &str) {
    println!("{} {}", "ℹ".bright_blue().bold(), message);
}

/// Display a retry message
pub fn display_retry(attempt: u32, max_attempts: u32, delay_secs: u64) {
    eprintln!(
        "{} Retrying ({}/{}) in {} seconds...",
        "↻".bright_yellow(),
        attempt,
        max_attempts,
        delay_secs
    );
}

/// Display a progress spinner message
pub fn display_progress(message: &str) {
    print!("\r{} {}", "◐".bright_blue(), message);
    use std::io::Write;
    let _ = std::io::stdout().flush();
}

/// Clear the current line (for progress updates)
pub fn clear_line() {
    print!("\r{}\r", " ".repeat(80));
    use std::io::Write;
    let _ = std::io::stdout().flush();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_display_functions_exist() {
        // Just verify the functions compile
        let msg = "Test message";
        let _ = || display_warning(msg);
        let _ = || display_success(msg);
        let _ = || display_info(msg);
        let _ = || display_retry(1, 3, 5);
    }
}
