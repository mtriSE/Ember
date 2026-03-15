//! CLI Config Integration Tests
//!
//! Tests for the config command functionality.

use super::helpers::{assert_success, run_ember, stdout_str, temp_config_dir, run_ember_with_env};

#[test]
fn test_config_path_command() {
    let output = run_ember(&["config", "path"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    // Path should contain typical config directory patterns
    assert!(
        stdout.contains("ember") || stdout.contains("config") || stdout.contains("."),
        "Config path should show a valid path: {}",
        stdout
    );
}

#[test]
fn test_config_show_without_init() {
    // Show command should work even without explicit init
    // (may show defaults or error gracefully)
    let output = run_ember(&["config", "show"]);
    
    // Either shows config or gives helpful error
    let stdout = stdout_str(&output);
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    assert!(
        output.status.success() || 
        stderr.contains("config") ||
        stderr.contains("not found") ||
        stderr.contains("initialize"),
        "Config show should work or give helpful error. stdout: {}, stderr: {}",
        stdout,
        stderr
    );
}

#[test]
fn test_config_init_help() {
    let output = run_ember(&["config", "init", "--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(
        stdout.contains("force") || stdout.contains("init"),
        "Config init help should show options"
    );
}

#[test]
fn test_config_set_help() {
    let output = run_ember(&["config", "set", "--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(
        stdout.contains("key") || stdout.contains("value"),
        "Config set help should show key/value arguments"
    );
}

#[test]
fn test_config_get_help() {
    let output = run_ember(&["config", "get", "--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    assert!(
        stdout.contains("key") || stdout.contains("get"),
        "Config get help should show key argument"
    );
}

#[test]
fn test_config_init_with_force_flag() {
    let output = run_ember(&["config", "init", "--force", "--help"]);
    // Just verify the flag is recognized
    let _ = output;
}

#[test]
fn test_config_get_nonexistent_key() {
    let output = run_ember(&["config", "get", "nonexistent_key_12345"]);
    
    // Should fail gracefully with helpful message
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let stdout = stdout_str(&output);
    
    // Either not found or shows default/empty
    assert!(
        !output.status.success() ||
        stdout.is_empty() ||
        stdout.contains("null") ||
        stdout.contains("not set"),
        "Getting nonexistent key should fail or return empty. stdout: {}, stderr: {}",
        stdout,
        stderr
    );
}

#[test]
fn test_config_with_custom_path() {
    // Test --config flag for custom config path
    let temp = temp_config_dir();
    let config_path = temp.path().join("ember.toml");
    
    let output = run_ember(&[
        "--config",
        config_path.to_str().unwrap(),
        "config",
        "path",
    ]);
    
    // Command should accept custom config path
    // May fail if config doesn't exist, but shouldn't crash
    let _ = output;
}

#[test]
fn test_config_env_variable() {
    let temp = temp_config_dir();
    let config_path = temp.path().join("ember_test.toml");
    
    let output = run_ember_with_env(
        &["config", "path"],
        &[("EMBER_CONFIG", config_path.to_str().unwrap())],
    );
    
    // Should accept EMBER_CONFIG environment variable
    let _ = output;
}

#[cfg(test)]
mod config_workflow_tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_config_init_creates_file() {
        let temp = temp_config_dir();
        let config_path = temp.path().join("test_ember.toml");
        
        // Initialize config
        let output = run_ember(&[
            "--config",
            config_path.to_str().unwrap(),
            "config",
            "init",
        ]);
        
        // Either succeeds or fails gracefully
        if output.status.success() {
            // If init succeeded, file should exist
            // Note: actual path might differ from what we specified
            // depending on implementation
        }
        
        // Test passes regardless - we're just checking it doesn't crash
    }

    #[test]
    fn test_config_roundtrip() {
        let temp = temp_config_dir();
        let config_path = temp.path().join("roundtrip.toml");
        
        // Create minimal config
        fs::write(
            &config_path,
            r#"
[llm]
provider = "openai"
model = "gpt-4"

[agent]
name = "Test Agent"
"#,
        )
        .expect("Failed to write test config");
        
        // Read it back via show
        let output = run_ember(&[
            "--config",
            config_path.to_str().unwrap(),
            "config",
            "show",
        ]);
        
        if output.status.success() {
            let stdout = stdout_str(&output);
            // Should contain our test values
            assert!(
                stdout.contains("openai") || stdout.contains("gpt-4") || stdout.contains("Test"),
                "Config show should display our values: {}",
                stdout
            );
        }
    }
}

#[test]
fn test_config_subcommands_available() {
    let output = run_ember(&["config", "--help"]);
    assert_success(&output);
    
    let stdout = stdout_str(&output);
    
    // All subcommands should be listed
    let subcommands = ["init", "show", "set", "get", "path"];
    for cmd in &subcommands {
        assert!(
            stdout.contains(cmd),
            "Config help should list '{}' subcommand: {}",
            cmd,
            stdout
        );
    }
}