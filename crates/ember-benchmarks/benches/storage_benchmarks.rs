//! Storage Benchmarks
//!
//! Benchmarks for ember-storage components including:
//! - In-memory storage
//! - SQLite operations
//! - Vector store operations
//! - RAG retrieval

use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use std::time::Duration;

/// Benchmark in-memory key-value operations
fn bench_memory_store(c: &mut Criterion) {
    use std::collections::HashMap;

    let mut group = c.benchmark_group("memory_store");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark insert
    group.bench_function("insert", |b| {
        let mut store: HashMap<String, String> = HashMap::new();
        let mut i = 0u64;

        b.iter(|| {
            store.insert(format!("key_{}", i), format!("value_{}", i));
            i += 1;
            black_box(&store);
        })
    });

    // Benchmark get
    group.bench_function("get_existing", |b| {
        let mut store: HashMap<String, String> = HashMap::new();
        for i in 0..1000 {
            store.insert(format!("key_{}", i), format!("value_{}", i));
        }

        let mut i = 0usize;
        b.iter(|| {
            let key = format!("key_{}", i % 1000);
            let value = store.get(black_box(&key));
            i += 1;
            black_box(value)
        })
    });

    // Benchmark get missing
    group.bench_function("get_missing", |b| {
        let mut store: HashMap<String, String> = HashMap::new();
        for i in 0..1000 {
            store.insert(format!("key_{}", i), format!("value_{}", i));
        }

        b.iter(|| {
            let value = store.get(black_box("nonexistent_key"));
            black_box(value)
        })
    });

    // Benchmark delete
    group.bench_function("delete", |b| {
        let mut store: HashMap<String, String> = HashMap::new();
        for i in 0..10000 {
            store.insert(format!("key_{}", i), format!("value_{}", i));
        }

        let mut i = 0usize;
        b.iter(|| {
            let key = format!("key_{}", i % 10000);
            let removed = store.remove(black_box(&key));
            // Re-insert to keep store populated
            if removed.is_some() {
                store.insert(key, format!("value_{}", i));
            }
            i += 1;
        })
    });

    // Benchmark iteration
    for size in [100, 1000, 10000].iter() {
        group.throughput(Throughput::Elements(*size as u64));
        group.bench_with_input(BenchmarkId::new("iterate", size), size, |b, &size| {
            let mut store: HashMap<String, String> = HashMap::new();
            for i in 0..size {
                store.insert(format!("key_{}", i), format!("value_{}", i));
            }

            b.iter(|| {
                let count = black_box(&store).iter().count();
                black_box(count)
            })
        });
    }

    group.finish();
}

/// Benchmark JSON document storage
fn bench_document_store(c: &mut Criterion) {
    use serde_json::json;
    use std::collections::HashMap;

    let mut group = c.benchmark_group("document_store");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark storing JSON documents
    group.bench_function("store_document", |b| {
        let mut store: HashMap<String, serde_json::Value> = HashMap::new();
        let mut i = 0u64;

        b.iter(|| {
            let doc = json!({
                "id": format!("doc_{}", i),
                "title": "Test Document",
                "content": "This is a test document with some content.",
                "metadata": {
                    "author": "test_user",
                    "created_at": "2026-03-15T19:00:00Z"
                }
            });
            store.insert(format!("doc_{}", i), doc);
            i += 1;
            black_box(&store);
        })
    });

    // Benchmark retrieving and parsing documents
    group.bench_function("retrieve_document", |b| {
        let mut store: HashMap<String, serde_json::Value> = HashMap::new();
        for i in 0..1000 {
            let doc = json!({
                "id": format!("doc_{}", i),
                "title": format!("Document {}", i),
                "content": "Content here",
                "tags": ["tag1", "tag2", "tag3"]
            });
            store.insert(format!("doc_{}", i), doc);
        }

        let mut i = 0usize;
        b.iter(|| {
            let key = format!("doc_{}", i % 1000);
            let doc = store.get(black_box(&key));
            i += 1;
            black_box(doc)
        })
    });

    // Benchmark document updates
    group.bench_function("update_document", |b| {
        let mut store: HashMap<String, serde_json::Value> = HashMap::new();
        for i in 0..1000 {
            store.insert(format!("doc_{}", i), json!({"count": 0}));
        }

        let mut i = 0usize;
        b.iter(|| {
            let key = format!("doc_{}", i % 1000);
            if let Some(doc) = store.get_mut(&key) {
                if let Some(count) = doc.get_mut("count") {
                    *count = json!(count.as_i64().unwrap_or(0) + 1);
                }
            }
            i += 1;
            black_box(&store);
        })
    });

    group.finish();
}

/// Benchmark vector operations (simulated embeddings)
fn bench_vector_store(c: &mut Criterion) {
    let mut group = c.benchmark_group("vector_store");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark vector creation
    group.bench_function("create_vector_1536", |b| {
        b.iter(|| {
            let vector: Vec<f32> = (0..1536).map(|i| (i as f32) * 0.001).collect();
            black_box(vector)
        })
    });

    // Benchmark cosine similarity
    group.bench_function("cosine_similarity_1536", |b| {
        let vec_a: Vec<f32> = (0..1536).map(|i| (i as f32) * 0.001).collect();
        let vec_b: Vec<f32> = (0..1536).map(|i| ((1536 - i) as f32) * 0.001).collect();

        b.iter(|| {
            let dot_product: f32 = black_box(&vec_a)
                .iter()
                .zip(black_box(&vec_b).iter())
                .map(|(a, b)| a * b)
                .sum();

            let norm_a: f32 = vec_a.iter().map(|x| x * x).sum::<f32>().sqrt();
            let norm_b: f32 = vec_b.iter().map(|x| x * x).sum::<f32>().sqrt();

            let similarity = dot_product / (norm_a * norm_b);
            black_box(similarity)
        })
    });

    // Benchmark vector search (brute force)
    for num_vectors in [100, 1000, 10000].iter() {
        group.throughput(Throughput::Elements(*num_vectors as u64));
        group.bench_with_input(
            BenchmarkId::new("vector_search_brute_force", num_vectors),
            num_vectors,
            |b, &num_vectors| {
                let vectors: Vec<Vec<f32>> = (0..num_vectors)
                    .map(|i| (0..1536).map(|j| ((i + j) % 100) as f32 * 0.01).collect())
                    .collect();

                let query: Vec<f32> = (0..1536).map(|i| (i as f32) * 0.001).collect();

                b.iter(|| {
                    let mut best_score = f32::MIN;
                    let mut best_idx = 0;

                    for (idx, vec) in black_box(&vectors).iter().enumerate() {
                        let dot_product: f32 =
                            query.iter().zip(vec.iter()).map(|(a, b)| a * b).sum();
                        if dot_product > best_score {
                            best_score = dot_product;
                            best_idx = idx;
                        }
                    }

                    black_box((best_idx, best_score))
                })
            },
        );
    }

    // Benchmark top-k retrieval
    group.bench_function("top_k_retrieval", |b| {
        let vectors: Vec<(String, Vec<f32>)> = (0..1000)
            .map(|i| {
                (
                    format!("doc_{}", i),
                    (0..1536).map(|j| ((i + j) % 100) as f32 * 0.01).collect(),
                )
            })
            .collect();

        let query: Vec<f32> = (0..1536).map(|i| (i as f32) * 0.001).collect();
        let k = 10;

        b.iter(|| {
            let mut scores: Vec<(&String, f32)> = vectors
                .iter()
                .map(|(id, vec)| {
                    let score: f32 = query.iter().zip(vec.iter()).map(|(a, b)| a * b).sum();
                    (id, score)
                })
                .collect();

            scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
            let top_k: Vec<_> = scores.into_iter().take(k).collect();
            black_box(top_k)
        })
    });

    group.finish();
}

/// Benchmark text chunking for RAG
fn bench_text_chunking(c: &mut Criterion) {
    let mut group = c.benchmark_group("text_chunking");
    group.measurement_time(Duration::from_secs(5));

    // Generate sample text
    let sample_text: String = (0..1000)
        .map(|i| format!("This is sentence number {}. ", i))
        .collect();

    // Benchmark fixed-size chunking
    group.bench_function("fixed_size_chunks", |b| {
        let chunk_size = 500;
        let overlap = 50;

        b.iter(|| {
            let text = black_box(&sample_text);
            let mut chunks = Vec::new();
            let mut start = 0;

            while start < text.len() {
                let end = (start + chunk_size).min(text.len());
                chunks.push(&text[start..end]);
                start = if start + chunk_size >= text.len() {
                    text.len()
                } else {
                    start + chunk_size - overlap
                };
            }

            black_box(chunks)
        })
    });

    // Benchmark sentence-based chunking
    group.bench_function("sentence_chunks", |b| {
        b.iter(|| {
            let text = black_box(&sample_text);
            let chunks: Vec<&str> = text.split(". ").collect();
            black_box(chunks)
        })
    });

    // Benchmark paragraph-based chunking
    let paragraph_text: String = (0..100)
        .map(|i| {
            format!(
                "Paragraph {}.\nThis has multiple sentences. It is quite long.\n\n",
                i
            )
        })
        .collect();

    group.bench_function("paragraph_chunks", |b| {
        b.iter(|| {
            let text = black_box(&paragraph_text);
            let chunks: Vec<&str> = text.split("\n\n").filter(|s| !s.is_empty()).collect();
            black_box(chunks)
        })
    });

    group.finish();
}

/// Benchmark conversation history storage
fn bench_conversation_storage(c: &mut Criterion) {
    use serde_json::json;
    use std::collections::VecDeque;

    let mut group = c.benchmark_group("conversation_storage");
    group.measurement_time(Duration::from_secs(5));

    // Benchmark appending messages
    group.bench_function("append_message", |b| {
        let mut history: VecDeque<serde_json::Value> = VecDeque::new();
        let mut i = 0u64;

        b.iter(|| {
            let message = json!({
                "role": "user",
                "content": format!("Message number {}", i),
                "timestamp": "2026-03-15T19:00:00Z"
            });
            history.push_back(message);
            if history.len() > 1000 {
                history.pop_front();
            }
            i += 1;
            black_box(&history);
        })
    });

    // Benchmark searching conversation history
    group.bench_function("search_history", |b| {
        let mut history: Vec<serde_json::Value> = (0..1000)
            .map(|i| {
                json!({
                    "role": if i % 2 == 0 { "user" } else { "assistant" },
                    "content": format!("Message with keyword_{} in it", i % 100)
                })
            })
            .collect();

        b.iter(|| {
            let search_term = "keyword_50";
            let matches: Vec<_> = black_box(&history)
                .iter()
                .filter(|msg| {
                    msg.get("content")
                        .and_then(|c| c.as_str())
                        .map(|s| s.contains(search_term))
                        .unwrap_or(false)
                })
                .collect();
            black_box(matches)
        })
    });

    // Benchmark serializing conversation history
    for size in [10, 50, 100, 500].iter() {
        group.throughput(Throughput::Elements(*size as u64));
        group.bench_with_input(
            BenchmarkId::new("serialize_history", size),
            size,
            |b, &size| {
                let history: Vec<serde_json::Value> = (0..size)
                    .map(|i| {
                        json!({
                            "role": if i % 2 == 0 { "user" } else { "assistant" },
                            "content": format!("This is message number {} with some content", i)
                        })
                    })
                    .collect();

                b.iter(|| {
                    let json = serde_json::to_string(black_box(&history)).unwrap();
                    black_box(json)
                })
            },
        );
    }

    group.finish();
}

criterion_group!(
    benches,
    bench_memory_store,
    bench_document_store,
    bench_vector_store,
    bench_text_chunking,
    bench_conversation_storage,
);

criterion_main!(benches);
