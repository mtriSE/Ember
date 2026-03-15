//! Basic CLI Integration Tests
//!
//! Tests for fundamental CLI functionality like help, version, and info commands.

use super::helpers::{assert_success, run_ember, stdout_contains, stdout_str};

#[test]
fn test_help_command() {
    let output = run_ember(&["--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(stdout.contains("Ember"), "Help should mention Ember");
    assert!(stdout.contains("chat"), "Help should mention chat command");
    assert!(stdout.contains("config"), "Help should mention config command");
    assert!(stdout.contains("serve"), "Help should mention serve command");
}

#[test]
fn test_version_flag() {
    let output = run_ember(&["--version"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    // Version should contain a semver-like pattern
    assert!(
        stdout.contains('.') && stdout.chars().any(|c| c.is_ascii_digit()),
        "Version output should contain version number: {}",
        stdout
    );
}

#[test]
fn test_info_command() {
    let output = run_ember(&["info"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(stdout.contains("Version"), "Info should show version");
    assert!(stdout.contains("Rust"), "Info should show Rust version");
    assert!(
        stdout.contains("OS") || stdout.contains("macos") || stdout.contains("linux") || stdout.contains("windows"),
        "Info should show OS information"
    );
}

#[test]
fn test_chat_help() {
    let output = run_ember(&["chat", "--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(stdout.contains("message"), "Chat help should mention message");
    assert!(stdout.contains("--provider"), "Chat help should mention provider flag");
    assert!(stdout.contains("--model"), "Chat help should mention model flag");
}

#[test]
fn test_config_help() {
    let output = run_ember(&["config", "--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(stdout.contains("init"), "Config help should mention init");
    assert!(stdout.contains("show"), "Config help should mention show");
    assert!(stdout.contains("set"), "Config help should mention set");
    assert!(stdout.contains("get"), "Config help should mention get");
}

#[test]
fn test_serve_help() {
    let output = run_ember(&["serve", "--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(
        stdout.contains("port") || stdout.contains("host") || stdout.contains("server"),
        "Serve help should mention server options"
    );
}

#[test]
fn test_invalid_command() {
    let output = run_ember(&["invalid-command-that-does-not-exist"]);
    assert!(!output.status.success(), "Invalid command should fail");
}

#[test]
fn test_verbose_flag() {
    let output = run_ember(&["--verbose", "info"]);
    // Command should run (may or may not have additional output)
    // The test just verifies the flag is accepted
    assert_success(&output);
}

#[test]
fn test_multiple_help_formats() {
    // Short form
    let output_short = run_ember(&["-h"]);
    assert_success(&output_short);
    assert!(stdout_contains(&output_short, "Ember"));
    
    // Long form
    let output_long = run_ember(&["--help"]);
    assert_success(&output_long);
    assert!(stdout_contains(&output_long, "Ember"));
}

#[test]
fn test_subcommand_with_verbose() {
    let output = run_ember(&["-v", "info"]);
    assert_success(&output);
}