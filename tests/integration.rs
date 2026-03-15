//! Integration Tests for Ember
//!
//! This file registers the integration test modules.
//! Run with: `cargo test --test integration`

mod integration;

// Re-export for use in tests
pub use integration::*;