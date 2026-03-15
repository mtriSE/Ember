//! Core Component Benchmarks
//!
//! Benchmarks for ember-core components including:
//! - Configuration parsing
//! - Context management
//! - Conversation handling
//! - Memory operations
//! - Checkpoint management

use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use std::time::Duration;

/// Benchmark configuration operations
fn bench_config(c: &mut Criterion) {
    let mut group = c.benchmark_group("config");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark JSON config parsing
    group.bench_function("parse_json_config", |b| {
        let config_json = r#"{
            "provider": "openai",
            "model": "gpt-4",
            "temperature": 0.7,
            "max_tokens": 4096,
            "api_key": "sk-test-key-12345"
        }"#;

        b.iter(|| {
            let value: serde_json::Value = serde_json::from_str(black_box(config_json)).unwrap();
            black_box(value)
        })
    });

    // Benchmark TOML config parsing
    group.bench_function("parse_toml_config", |b| {
        let config_toml = r#"
            provider = "openai"
            model = "gpt-4"
            temperature = 0.7
            max_tokens = 4096
            api_key = "sk-test-key-12345"
        "#;

        b.iter(|| {
            let value: toml::Value = toml::from_str(black_box(config_toml)).unwrap();
            black_box(value)
        })
    });

    group.finish();
}

/// Benchmark conversation operations
fn bench_conversation(c: &mut Criterion) {
    use serde_json::json;

    let mut group = c.benchmark_group("conversation");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark message creation
    group.bench_function("create_message", |b| {
        b.iter(|| {
            let message = json!({
                "role": "user",
                "content": "Hello, how are you doing today?"
            });
            black_box(message)
        })
    });

    // Benchmark conversation serialization with varying sizes
    for size in [10, 50, 100, 500].iter() {
        group.throughput(Throughput::Elements(*size as u64));
        group.bench_with_input(
            BenchmarkId::new("serialize_conversation", size),
            size,
            |b, &size| {
                let conversation: Vec<serde_json::Value> = (0..size)
                    .map(|i| {
                        if i % 2 == 0 {
                            json!({"role": "user", "content": format!("Message {}", i)})
                        } else {
                            json!({"role": "assistant", "content": format!("Response {}", i)})
                        }
                    })
                    .collect();

                b.iter(|| {
                    let json = serde_json::to_string(black_box(&conversation)).unwrap();
                    black_box(json)
                })
            },
        );
    }

    // Benchmark conversation deserialization
    for size in [10, 50, 100, 500].iter() {
        group.throughput(Throughput::Elements(*size as u64));
        group.bench_with_input(
            BenchmarkId::new("deserialize_conversation", size),
            size,
            |b, &size| {
                let conversation: Vec<serde_json::Value> = (0..size)
                    .map(|i| {
                        if i % 2 == 0 {
                            json!({"role": "user", "content": format!("Message {}", i)})
                        } else {
                            json!({"role": "assistant", "content": format!("Response {}", i)})
                        }
                    })
                    .collect();
                let json_str = serde_json::to_string(&conversation).unwrap();

                b.iter(|| {
                    let parsed: Vec<serde_json::Value> =
                        serde_json::from_str(black_box(&json_str)).unwrap();
                    black_box(parsed)
                })
            },
        );
    }

    group.finish();
}

/// Benchmark context management
fn bench_context(c: &mut Criterion) {
    use std::collections::HashMap;

    let mut group = c.benchmark_group("context");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark context creation
    group.bench_function("create_context", |b| {
        b.iter(|| {
            let mut context: HashMap<String, String> = HashMap::new();
            context.insert("session_id".to_string(), "abc123".to_string());
            context.insert("user_id".to_string(), "user456".to_string());
            context.insert("model".to_string(), "gpt-4".to_string());
            context.insert("temperature".to_string(), "0.7".to_string());
            black_box(context)
        })
    });

    // Benchmark context lookup
    group.bench_function("context_lookup", |b| {
        let mut context: HashMap<String, String> = HashMap::new();
        for i in 0..100 {
            context.insert(format!("key_{}", i), format!("value_{}", i));
        }

        b.iter(|| {
            let value = context.get(black_box("key_50"));
            black_box(value)
        })
    });

    // Benchmark context cloning
    for size in [10, 50, 100, 500].iter() {
        group.bench_with_input(BenchmarkId::new("clone_context", size), size, |b, &size| {
            let mut context: HashMap<String, String> = HashMap::new();
            for i in 0..size {
                context.insert(format!("key_{}", i), format!("value_{}", i));
            }

            b.iter(|| {
                let cloned = black_box(&context).clone();
                black_box(cloned)
            })
        });
    }

    group.finish();
}

/// Benchmark memory operations
fn bench_memory(c: &mut Criterion) {
    use std::collections::VecDeque;

    let mut group = c.benchmark_group("memory");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark sliding window memory
    group.bench_function("sliding_window_push", |b| {
        let mut window: VecDeque<String> = VecDeque::with_capacity(100);

        b.iter(|| {
            if window.len() >= 100 {
                window.pop_front();
            }
            window.push_back(black_box("New message content".to_string()));
            black_box(&window);
        })
    });

    // Benchmark memory summary generation
    for size in [10, 50, 100].iter() {
        group.bench_with_input(BenchmarkId::new("generate_summary", size), size, |b, &size| {
            let messages: Vec<String> = (0..size)
                .map(|i| format!("Message {} with some content", i))
                .collect();

            b.iter(|| {
                // Simulate summary generation by concatenating and truncating
                let summary: String = messages
                    .iter()
                    .take(5)
                    .map(|s| s.as_str())
                    .collect::<Vec<_>>()
                    .join(" | ");
                black_box(summary)
            })
        });
    }

    group.finish();
}

/// Benchmark token counting (approximate)
fn bench_token_counting(c: &mut Criterion) {
    let mut group = c.benchmark_group("token_counting");
    group.measurement_time(Duration::from_secs(5));

    // Simple word-based approximation
    group.bench_function("word_count_approximation", |b| {
        let text = "This is a sample text that we want to count tokens for. \
                    It contains multiple sentences and should give us a good \
                    approximation of token counting performance.";

        b.iter(|| {
            let count = black_box(text).split_whitespace().count();
            black_box(count)
        })
    });

    // Character-based approximation
    group.bench_function("char_count_approximation", |b| {
        let text = "This is a sample text that we want to count tokens for. \
                    It contains multiple sentences and should give us a good \
                    approximation of token counting performance.";

        b.iter(|| {
            // Approximate: 4 characters per token
            let count = black_box(text).len() / 4;
            black_box(count)
        })
    });

    // Benchmark with varying text sizes
    for size in [100, 1000, 10000, 100000].iter() {
        let text: String = "word ".repeat(*size);
        group.throughput(Throughput::Bytes(text.len() as u64));
        group.bench_with_input(
            BenchmarkId::new("token_count_by_size", size),
            &text,
            |b, text| {
                b.iter(|| {
                    let count = black_box(text).split_whitespace().count();
                    black_box(count)
                })
            },
        );
    }

    group.finish();
}

/// Benchmark checkpoint operations
fn bench_checkpoint(c: &mut Criterion) {
    use serde_json::json;

    let mut group = c.benchmark_group("checkpoint");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark checkpoint creation
    group.bench_function("create_checkpoint", |b| {
        b.iter(|| {
            let checkpoint = json!({
                "id": "checkpoint_12345",
                "timestamp": "2026-03-15T19:00:00Z",
                "conversation_length": 50,
                "model": "gpt-4",
                "total_tokens": 15000,
                "metadata": {
                    "session_id": "sess_abc123",
                    "user_id": "user_456"
                }
            });
            black_box(checkpoint)
        })
    });

    // Benchmark checkpoint serialization
    group.bench_function("serialize_checkpoint", |b| {
        let conversation: Vec<serde_json::Value> = (0..50)
            .map(|i| json!({"role": "user", "content": format!("Message {}", i)}))
            .collect();

        let checkpoint = json!({
            "id": "checkpoint_12345",
            "timestamp": "2026-03-15T19:00:00Z",
            "conversation": conversation,
            "metadata": {
                "session_id": "sess_abc123",
                "user_id": "user_456"
            }
        });

        b.iter(|| {
            let json = serde_json::to_string(black_box(&checkpoint)).unwrap();
            black_box(json)
        })
    });

    group.finish();
}

/// Benchmark cost calculation
fn bench_cost_calculation(c: &mut Criterion) {
    let mut group = c.benchmark_group("cost_calculation");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark simple cost calculation
    group.bench_function("calculate_cost", |b| {
        let input_tokens = 1500u64;
        let output_tokens = 500u64;
        let input_cost_per_1k = 0.01f64; // $0.01 per 1K input tokens
        let output_cost_per_1k = 0.03f64; // $0.03 per 1K output tokens

        b.iter(|| {
            let input_cost = (black_box(input_tokens) as f64 / 1000.0) * input_cost_per_1k;
            let output_cost = (black_box(output_tokens) as f64 / 1000.0) * output_cost_per_1k;
            let total = input_cost + output_cost;
            black_box(total)
        })
    });

    // Benchmark cost tracking over time
    group.bench_function("track_cumulative_cost", |b| {
        let mut cumulative_cost = 0.0f64;
        let costs: Vec<f64> = (0..100).map(|i| (i as f64) * 0.001).collect();

        b.iter(|| {
            cumulative_cost = 0.0;
            for cost in costs.iter() {
                cumulative_cost += black_box(*cost);
            }
            black_box(cumulative_cost)
        })
    });

    group.finish();
}

criterion_group!(
    benches,
    bench_config,
    bench_conversation,
    bench_context,
    bench_memory,
    bench_token_counting,
    bench_checkpoint,
    bench_cost_calculation,
);

criterion_main!(benches);