//! Test Helper Functions
//!
//! Common utilities for Ember integration tests.

use std::env;
use std::path::PathBuf;
use std::process::{Command, Output};

/// Get the path to the ember binary
pub fn ember_binary() -> PathBuf {
    let mut path = env::current_dir().expect("Failed to get current directory");
    path.push("target");
    path.push(if cfg!(debug_assertions) {
        "debug"
    } else {
        "release"
    });
    path.push(if cfg!(windows) { "ember.exe" } else { "ember" });
    path
}

/// Run ember CLI with arguments
pub fn run_ember(args: &[&str]) -> Output {
    Command::new(ember_binary())
        .args(args)
        .output()
        .expect("Failed to execute ember command")
}

/// Run ember CLI with arguments and environment variables
pub fn run_ember_with_env(args: &[&str], env_vars: &[(&str, &str)]) -> Output {
    let mut cmd = Command::new(ember_binary());
    cmd.args(args);
    for (key, value) in env_vars {
        cmd.env(key, value);
    }
    cmd.output().expect("Failed to execute ember command")
}

/// Assert command succeeded
pub fn assert_success(output: &Output) {
    assert!(
        output.status.success(),
        "Command failed with status: {:?}\nstdout: {}\nstderr: {}",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
}

/// Assert command failed
pub fn assert_failure(output: &Output) {
    assert!(
        !output.status.success(),
        "Command succeeded but was expected to fail\nstdout: {}\nstderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
}

/// Get stdout as string
pub fn stdout_str(output: &Output) -> String {
    String::from_utf8_lossy(&output.stdout).to_string()
}

/// Get stderr as string
pub fn stderr_str(output: &Output) -> String {
    String::from_utf8_lossy(&output.stderr).to_string()
}

/// Check if stdout contains a substring
pub fn stdout_contains(output: &Output, substring: &str) -> bool {
    stdout_str(output).contains(substring)
}

/// Check if stderr contains a substring
pub fn stderr_contains(output: &Output, substring: &str) -> bool {
    stderr_str(output).contains(substring)
}

/// Create a temporary config directory for tests
pub fn temp_config_dir() -> tempfile::TempDir {
    tempfile::tempdir().expect("Failed to create temp directory")
}

/// Create a mock API key environment
pub fn mock_api_env() -> Vec<(&'static str, &'static str)> {
    vec![
        ("OPENAI_API_KEY", "sk-test-mock-key-for-testing-only"),
        ("ANTHROPIC_API_KEY", "sk-ant-test-mock-key"),
        ("EMBER_NO_TELEMETRY", "1"),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ember_binary_path() {
        let path = ember_binary();
        assert!(path.to_string_lossy().contains("ember"));
    }
}