# Ember Benchmarks

Comprehensive performance benchmarking suite for the Ember AI Agent Framework.

## Overview

This crate provides a collection of benchmarks using the [Criterion](https://github.com/bheisler/criterion.rs) framework to measure and track the performance of Ember's core operations.

## Benchmark Categories

### Core Benchmarks (`core_benchmarks`)
- **Config Parsing**: JSON/TOML configuration parsing performance
- **Conversation**: Message creation and serialization with varying sizes
- **Context**: Context creation, lookup, and cloning operations
- **Memory**: Sliding window and summary memory operations
- **Token Counting**: Word/character-based token approximation
- **Checkpoint**: Checkpoint creation and serialization
- **Cost Calculation**: Cost tracking operations

### Storage Benchmarks (`storage_benchmarks`)
- **Memory Store**: Insert, get, delete, and iteration operations
- **Document Store**: JSON document storage operations
- **Vector Store**: Vector creation, cosine similarity, brute force search
- **Text Chunking**: Fixed-size, sentence, and paragraph chunking
- **Conversation Storage**: Append, search, and serialize history

### Tools Benchmarks (`tools_benchmarks`)
- **Tool Registry**: Register, lookup, and list operations
- **Parameter Parsing**: Simple/complex parameter validation
- **Serialization**: Tool call/response serialization
- **Path Operations**: Path construction, joining, normalization
- **Command Building**: Command construction with escaping
- **HTTP Handling**: URL parsing, query strings, JSON responses

### Full Suite (`full_suite`)
Combined benchmark that runs representative tests from all categories in a single execution for comprehensive performance assessment.

## Running Benchmarks

### Run All Benchmarks
```bash
cargo bench -p ember-benchmarks
```

### Run Specific Benchmark
```bash
# Core benchmarks only
cargo bench -p ember-benchmarks --bench core_benchmarks

# Storage benchmarks only
cargo bench -p ember-benchmarks --bench storage_benchmarks

# Tools benchmarks only
cargo bench -p ember-benchmarks --bench tools_benchmarks

# Full suite (recommended for CI)
cargo bench -p ember-benchmarks --bench full_suite
```

### Run Specific Test
```bash
# Run only benchmarks matching a pattern
cargo bench -p ember-benchmarks -- "conversation"
cargo bench -p ember-benchmarks -- "vector"
```

### Save Baseline
```bash
# Save current results as baseline
cargo bench -p ember-benchmarks -- --save-baseline main

# Compare against baseline
cargo bench -p ember-benchmarks -- --baseline main
```

## Benchmark Output

Results are stored in `target/criterion/` and include:
- **HTML Reports**: Open `target/criterion/report/index.html` for interactive graphs
- **JSON Data**: Raw benchmark data for programmatic analysis
- **Comparison**: Automatic comparison with previous runs

### Sample Output
```
core/config_json_parse  time:   [1.2345 µs 1.2456 µs 1.2567 µs]
                        change: [-2.1234% -0.5678% +0.9876%] (p = 0.12 > 0.05)
                        No change in performance detected.

storage/vector_cosine_similarity/384
                        time:   [234.56 ns 235.67 ns 236.78 ns]
                        thrpt:  [4.2234 Melem/s 4.2435 Melem/s 4.2636 Melem/s]
```

## CI Integration

Benchmarks run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

### GitHub Actions Workflow
The benchmark workflow (`.github/workflows/benchmark.yml`) provides:
- Automatic benchmark execution on code changes
- Performance regression detection for PRs
- Artifact upload for detailed analysis
- PR comments with benchmark summaries

### Manual Trigger
```bash
# Via GitHub CLI
gh workflow run benchmark.yml -f benchmark_type=full_suite
```

## Writing New Benchmarks

### Adding a Benchmark Function
```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn my_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("my_category");
    
    group.bench_function("operation_name", |b| {
        b.iter(|| {
            // Code to benchmark
            black_box(expensive_operation())
        });
    });
    
    group.finish();
}

criterion_group!(benches, my_benchmark);
criterion_main!(benches);
```

### Parameterized Benchmarks
```rust
use criterion::{BenchmarkId, Throughput};

fn parameterized_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("scalability");
    
    for size in [10, 100, 1000] {
        group.throughput(Throughput::Elements(size as u64));
        group.bench_with_input(
            BenchmarkId::new("operation", size),
            &size,
            |b, &size| {
                b.iter(|| process_items(black_box(size)));
            },
        );
    }
    
    group.finish();
}
```

## Performance Guidelines

### What to Benchmark
- ✅ Hot paths (frequently called code)
- ✅ Serialization/deserialization
- ✅ Memory-intensive operations
- ✅ CPU-bound algorithms
- ✅ I/O simulation (without actual I/O)

### What NOT to Benchmark
- ❌ Network calls (use mocks)
- ❌ File I/O (use in-memory alternatives)
- ❌ Random data (use fixed seeds)
- ❌ External dependencies

### Best Practices
1. **Use `black_box`**: Prevent compiler optimizations that would skip the work
2. **Warm up**: Criterion handles this automatically
3. **Consistent environment**: Close other applications during local benchmarks
4. **Statistical significance**: Let Criterion collect enough samples
5. **Meaningful names**: Use descriptive benchmark names

## Utility Functions

The `ember_benchmarks::utils` module provides helpers:

```rust
use ember_benchmarks::utils::{
    random_string,      // Generate random test strings
    random_json,        // Generate random JSON values
    get_memory_usage_kb, // Get current memory usage
    print_results,      // Format benchmark results
};
```

## Interpreting Results

### Time Metrics
- **Lower Bound**: Fastest observed time (optimistic)
- **Estimate**: Statistical estimate of typical time
- **Upper Bound**: Slowest observed time (pessimistic)

### Change Detection
- **Green** (improvement): Performance got faster
- **Red** (regression): Performance got slower  
- **Gray** (no change): Within noise threshold

### Throughput
When `Throughput` is set, results also show:
- Elements/second for discrete items
- Bytes/second for data processing

## Troubleshooting

### Benchmark Too Slow
```rust
// Reduce sample size for slow benchmarks
group.sample_size(20);
group.measurement_time(Duration::from_secs(3));
```

### High Variance
```rust
// Increase samples for noisy benchmarks
group.sample_size(200);
group.warm_up_time(Duration::from_secs(5));
```

### Memory Issues
```bash
# Run with limited parallelism
cargo bench -p ember-benchmarks -- --test-threads=1
```

## License

This crate is part of the Ember project and is dual-licensed under Apache 2.0 and MIT licenses.