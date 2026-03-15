//! Benchmark utilities
//!
//! Common utilities and helpers for benchmark tests.

use std::time::{Duration, Instant};

/// Benchmark result containing timing information
#[derive(Debug, Clone)]
pub struct BenchmarkResult {
    pub name: String,
    pub iterations: u64,
    pub total_time: Duration,
    pub mean_time: Duration,
    pub min_time: Duration,
    pub max_time: Duration,
    pub std_dev: Duration,
    pub throughput: Option<f64>,
}

impl BenchmarkResult {
    /// Create a new benchmark result from timing samples
    pub fn from_samples(name: impl Into<String>, samples: &[Duration]) -> Self {
        let name = name.into();
        let iterations = samples.len() as u64;
        
        if samples.is_empty() {
            return Self {
                name,
                iterations: 0,
                total_time: Duration::ZERO,
                mean_time: Duration::ZERO,
                min_time: Duration::ZERO,
                max_time: Duration::ZERO,
                std_dev: Duration::ZERO,
                throughput: None,
            };
        }

        let total_time: Duration = samples.iter().sum();
        let mean_nanos = total_time.as_nanos() / iterations as u128;
        let mean_time = Duration::from_nanos(mean_nanos as u64);
        
        let min_time = *samples.iter().min().unwrap();
        let max_time = *samples.iter().max().unwrap();
        
        // Calculate standard deviation
        let variance = samples
            .iter()
            .map(|s| {
                let diff = s.as_nanos() as f64 - mean_nanos as f64;
                diff * diff
            })
            .sum::<f64>()
            / iterations as f64;
        let std_dev = Duration::from_nanos(variance.sqrt() as u64);
        
        Self {
            name,
            iterations,
            total_time,
            mean_time,
            min_time,
            max_time,
            std_dev,
            throughput: None,
        }
    }

    /// Set throughput (operations per second)
    pub fn with_throughput(mut self, ops_per_sec: f64) -> Self {
        self.throughput = Some(ops_per_sec);
        self
    }

    /// Calculate throughput from iterations and total time
    pub fn calculate_throughput(&mut self) {
        if self.total_time.as_secs_f64() > 0.0 {
            self.throughput = Some(self.iterations as f64 / self.total_time.as_secs_f64());
        }
    }

    /// Format the result as a string
    pub fn format(&self) -> String {
        let throughput_str = self
            .throughput
            .map(|t| format!(" ({:.2} ops/sec)", t))
            .unwrap_or_default();

        format!(
            "{}: mean={:?}, min={:?}, max={:?}, std_dev={:?}, n={}{}",
            self.name,
            self.mean_time,
            self.min_time,
            self.max_time,
            self.std_dev,
            self.iterations,
            throughput_str
        )
    }
}

/// Simple benchmark runner for quick measurements
pub struct QuickBench {
    name: String,
    warmup_iterations: u64,
    measure_iterations: u64,
}

impl QuickBench {
    /// Create a new quick benchmark
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            warmup_iterations: 10,
            measure_iterations: 100,
        }
    }

    /// Set warmup iterations
    pub fn warmup(mut self, iterations: u64) -> Self {
        self.warmup_iterations = iterations;
        self
    }

    /// Set measurement iterations
    pub fn iterations(mut self, iterations: u64) -> Self {
        self.measure_iterations = iterations;
        self
    }

    /// Run the benchmark with a closure
    pub fn run<F, R>(&self, mut f: F) -> BenchmarkResult
    where
        F: FnMut() -> R,
    {
        // Warmup
        for _ in 0..self.warmup_iterations {
            std::hint::black_box(f());
        }

        // Measure
        let mut samples = Vec::with_capacity(self.measure_iterations as usize);
        for _ in 0..self.measure_iterations {
            let start = Instant::now();
            std::hint::black_box(f());
            samples.push(start.elapsed());
        }

        let mut result = BenchmarkResult::from_samples(&self.name, &samples);
        result.calculate_throughput();
        result
    }

    /// Run an async benchmark
    pub async fn run_async<F, Fut, R>(&self, mut f: F) -> BenchmarkResult
    where
        F: FnMut() -> Fut,
        Fut: std::future::Future<Output = R>,
    {
        // Warmup
        for _ in 0..self.warmup_iterations {
            std::hint::black_box(f().await);
        }

        // Measure
        let mut samples = Vec::with_capacity(self.measure_iterations as usize);
        for _ in 0..self.measure_iterations {
            let start = Instant::now();
            std::hint::black_box(f().await);
            samples.push(start.elapsed());
        }

        let mut result = BenchmarkResult::from_samples(&self.name, &samples);
        result.calculate_throughput();
        result
    }
}

/// Generate random string of specified length
pub fn random_string(len: usize) -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();
    (0..len)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

/// Generate random JSON document
pub fn random_json(depth: usize, breadth: usize) -> serde_json::Value {
    use serde_json::json;
    
    if depth == 0 {
        return json!(random_string(10));
    }

    let mut obj = serde_json::Map::new();
    for i in 0..breadth {
        let key = format!("key_{}", i);
        let value = if i % 3 == 0 {
            json!(rand::random::<i64>())
        } else if i % 3 == 1 {
            json!(random_string(20))
        } else {
            random_json(depth - 1, breadth)
        };
        obj.insert(key, value);
    }
    serde_json::Value::Object(obj)
}

/// Memory usage tracker
#[cfg(target_os = "linux")]
pub fn get_memory_usage_kb() -> Option<u64> {
    std::fs::read_to_string("/proc/self/statm")
        .ok()
        .and_then(|s| s.split_whitespace().nth(1)?.parse().ok())
        .map(|pages: u64| pages * 4) // Assuming 4KB pages
}

#[cfg(not(target_os = "linux"))]
pub fn get_memory_usage_kb() -> Option<u64> {
    None
}

/// Print benchmark results in a formatted table
pub fn print_results(results: &[BenchmarkResult]) {
    println!("\n{:=^80}", " Benchmark Results ");
    println!(
        "{:<30} {:>12} {:>12} {:>12} {:>10}",
        "Name", "Mean", "Min", "Max", "Ops/sec"
    );
    println!("{:-^80}", "");

    for result in results {
        let throughput = result
            .throughput
            .map(|t| format!("{:.0}", t))
            .unwrap_or_else(|| "N/A".to_string());

        println!(
            "{:<30} {:>12.2?} {:>12.2?} {:>12.2?} {:>10}",
            truncate_name(&result.name, 30),
            result.mean_time,
            result.min_time,
            result.max_time,
            throughput
        );
    }
    println!("{:=^80}", "");
}

fn truncate_name(name: &str, max_len: usize) -> String {
    if name.len() <= max_len {
        name.to_string()
    } else {
        format!("{}...", &name[..max_len - 3])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_benchmark_result_from_samples() {
        let samples = vec![
            Duration::from_millis(10),
            Duration::from_millis(12),
            Duration::from_millis(11),
            Duration::from_millis(9),
            Duration::from_millis(13),
        ];

        let result = BenchmarkResult::from_samples("test", &samples);
        assert_eq!(result.iterations, 5);
        assert_eq!(result.min_time, Duration::from_millis(9));
        assert_eq!(result.max_time, Duration::from_millis(13));
    }

    #[test]
    fn test_quick_bench() {
        let result = QuickBench::new("addition")
            .warmup(5)
            .iterations(50)
            .run(|| 1 + 1);

        assert_eq!(result.iterations, 50);
        assert!(result.mean_time < Duration::from_millis(1));
    }

    #[test]
    fn test_random_string() {
        let s = random_string(20);
        assert_eq!(s.len(), 20);
    }

    #[test]
    fn test_random_json() {
        let json = random_json(2, 3);
        assert!(json.is_object());
    }
}