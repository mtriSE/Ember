//! Plugin management CLI commands.
//!
//! Commands for searching, installing, updating, and managing Ember plugins.
//!
//! Note: These commands are prepared for future integration into the main CLI.
//! They are currently not wired up to the command router.

#![allow(dead_code)]

use clap::{Args, Subcommand};
use colored::Colorize;
use ember_plugins::marketplace::{
    MarketplaceClient, PluginSearchQuery, PluginSortField, SortOrder,
};
use std::path::PathBuf;
use tabled::{Table, Tabled};
use tokio::fs;

/// Plugin management commands.
#[derive(Debug, Args)]
pub struct PluginArgs {
    #[command(subcommand)]
    pub command: PluginCommand,
}

/// Available plugin commands.
#[derive(Debug, Subcommand)]
pub enum PluginCommand {
    /// Search for plugins in the marketplace.
    Search {
        /// Search query.
        query: String,
        /// Filter by tags (comma-separated).
        #[arg(short, long)]
        tags: Option<String>,
        /// Sort by field (downloads, rating, name, published, updated).
        #[arg(short, long, default_value = "downloads")]
        sort: String,
        /// Number of results to show.
        #[arg(short, long, default_value = "10")]
        limit: u32,
    },
    /// Install a plugin from the marketplace.
    Install {
        /// Plugin name.
        name: String,
        /// Specific version to install.
        #[arg(short, long)]
        version: Option<String>,
    },
    /// Uninstall a plugin.
    Uninstall {
        /// Plugin name.
        name: String,
    },
    /// Update a plugin to the latest version.
    Update {
        /// Plugin name (or --all for all plugins).
        name: Option<String>,
        /// Update all plugins.
        #[arg(short, long)]
        all: bool,
    },
    /// List installed plugins.
    List,
    /// Show plugin details.
    Info {
        /// Plugin name.
        name: String,
    },
    /// Check for available updates.
    CheckUpdates,
    /// Show featured plugins from the marketplace.
    Featured,
    /// Show available plugin tags.
    Tags,
    /// Clear plugin cache.
    CacheClear,
    /// Show cache statistics.
    CacheInfo,
}

/// Table row for plugin list.
#[derive(Tabled)]
struct PluginRow {
    #[tabled(rename = "Name")]
    name: String,
    #[tabled(rename = "Version")]
    version: String,
    #[tabled(rename = "Description")]
    description: String,
    #[tabled(rename = "Downloads")]
    downloads: String,
    #[tabled(rename = "Rating")]
    rating: String,
}

/// Table row for installed plugins.
#[derive(Tabled)]
struct InstalledPluginRow {
    #[tabled(rename = "Name")]
    name: String,
    #[tabled(rename = "Version")]
    version: String,
    #[tabled(rename = "Installed")]
    installed: String,
    #[tabled(rename = "Size")]
    size: String,
}

/// Get the plugin cache directory.
fn get_cache_dir() -> PathBuf {
    dirs::cache_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("ember")
        .join("plugins")
}

/// Execute plugin command.
pub async fn execute(args: PluginArgs) -> anyhow::Result<()> {
    match args.command {
        PluginCommand::Search {
            query,
            tags,
            sort,
            limit,
        } => search_plugins(&query, tags, &sort, limit).await,
        PluginCommand::Install { name, version } => install_plugin(&name, version).await,
        PluginCommand::Uninstall { name } => uninstall_plugin(&name).await,
        PluginCommand::Update { name, all } => update_plugins(name, all).await,
        PluginCommand::List => list_plugins().await,
        PluginCommand::Info { name } => show_plugin_info(&name).await,
        PluginCommand::CheckUpdates => check_updates().await,
        PluginCommand::Featured => show_featured().await,
        PluginCommand::Tags => show_tags().await,
        PluginCommand::CacheClear => clear_cache().await,
        PluginCommand::CacheInfo => show_cache_info().await,
    }
}

/// Search for plugins.
async fn search_plugins(
    query: &str,
    tags: Option<String>,
    sort: &str,
    limit: u32,
) -> anyhow::Result<()> {
    println!("{}", "🔍 Searching plugins...".cyan());

    let client = MarketplaceClient::new(get_cache_dir()).await?;

    let sort_by = match sort.to_lowercase().as_str() {
        "name" => PluginSortField::Name,
        "downloads" => PluginSortField::Downloads,
        "rating" => PluginSortField::Rating,
        "published" => PluginSortField::Published,
        "updated" => PluginSortField::Updated,
        _ => PluginSortField::Downloads,
    };

    let search_query = PluginSearchQuery {
        query: Some(query.to_string()),
        tags: tags
            .map(|t| t.split(',').map(|s| s.trim().to_string()).collect())
            .unwrap_or_default(),
        sort_by,
        sort_order: SortOrder::Descending,
        per_page: limit,
        ..Default::default()
    };

    match client.search(search_query).await {
        Ok(results) => {
            if results.plugins.is_empty() {
                println!("{}", "No plugins found matching your query.".yellow());
                return Ok(());
            }

            println!(
                "\n{} Found {} plugins (showing {})\n",
                "✓".green(),
                results.total,
                results.plugins.len()
            );

            let rows: Vec<PluginRow> = results
                .plugins
                .iter()
                .map(|p| PluginRow {
                    name: p.manifest.name.clone(),
                    version: p.manifest.version.clone(),
                    description: truncate(&p.manifest.description, 40),
                    downloads: format_number(p.downloads),
                    rating: format!("⭐ {:.1}", p.rating),
                })
                .collect();

            let table = Table::new(rows).to_string();
            println!("{}", table);

            println!(
                "\n{} Use {} to install a plugin",
                "💡".blue(),
                "ember plugin install <name>".cyan()
            );
        }
        Err(_e) => {
            // Fallback: Show mock data for demo
            println!(
                "{}",
                "⚠️  Could not connect to marketplace. Showing example plugins:".yellow()
            );
            show_example_plugins();
        }
    }

    Ok(())
}

/// Install a plugin.
async fn install_plugin(name: &str, version: Option<String>) -> anyhow::Result<()> {
    println!(
        "{} Installing plugin: {}{}",
        "📦".cyan(),
        name.green(),
        version
            .as_ref()
            .map(|v| format!("@{}", v))
            .unwrap_or_default()
    );

    let mut client = MarketplaceClient::new(get_cache_dir()).await?;

    match client.install(name, version.as_deref()).await {
        Ok(path) => {
            println!(
                "\n{} Plugin {} installed successfully!",
                "✓".green(),
                name.green()
            );
            println!("  Location: {}", path.display());
        }
        Err(e) => {
            // Provide helpful error message
            println!("\n{} Could not install plugin: {}", "✗".red(), e);
            println!("\n{} Tips:", "💡".blue());
            println!("  • Check if the plugin name is correct");
            println!("  • Verify your internet connection");
            println!("  • Try: ember plugin search {}", name);
        }
    }

    Ok(())
}

/// Uninstall a plugin.
async fn uninstall_plugin(name: &str) -> anyhow::Result<()> {
    println!("{} Uninstalling plugin: {}", "🗑️ ".cyan(), name.yellow());

    let mut client = MarketplaceClient::new(get_cache_dir()).await?;

    client.uninstall(name).await?;

    println!(
        "\n{} Plugin {} uninstalled successfully!",
        "✓".green(),
        name.green()
    );

    Ok(())
}

/// Update plugins.
async fn update_plugins(name: Option<String>, all: bool) -> anyhow::Result<()> {
    let mut client = MarketplaceClient::new(get_cache_dir()).await?;

    if all {
        println!("{} Checking for updates...", "🔄".cyan());

        let updates = client.check_updates().await?;

        if updates.is_empty() {
            println!("{} All plugins are up to date!", "✓".green());
            return Ok(());
        }

        println!("\n{} Updates available:", "📦".blue());
        for (plugin_name, current, latest) in &updates {
            println!(
                "  • {} {} → {}",
                plugin_name.cyan(),
                current.yellow(),
                latest.green()
            );
        }

        println!("\n{} Updating {} plugins...", "🔄".cyan(), updates.len());

        for (plugin_name, _, _) in updates {
            match client.update(&plugin_name).await {
                Ok(_) => println!("  {} {} updated", "✓".green(), plugin_name),
                Err(e) => println!("  {} {} failed: {}", "✗".red(), plugin_name, e),
            }
        }
    } else if let Some(plugin_name) = name {
        println!("{} Updating plugin: {}", "🔄".cyan(), plugin_name.yellow());

        match client.update(&plugin_name).await {
            Ok(_path) => {
                println!(
                    "\n{} Plugin {} updated successfully!",
                    "✓".green(),
                    plugin_name.green()
                );
            }
            Err(e) => {
                println!("\n{} Failed to update plugin: {}", "✗".red(), e);
            }
        }
    } else {
        println!(
            "{} Please specify a plugin name or use --all",
            "⚠️".yellow()
        );
    }

    Ok(())
}

/// List installed plugins.
async fn list_plugins() -> anyhow::Result<()> {
    println!("{} Installed plugins:\n", "📦".cyan());

    let client = MarketplaceClient::new(get_cache_dir()).await?;
    let installed = client.list_installed();

    if installed.is_empty() {
        println!("{}", "No plugins installed.".yellow());
        println!(
            "\n{} Use {} to search for plugins",
            "💡".blue(),
            "ember plugin search <query>".cyan()
        );
        return Ok(());
    }

    let rows: Vec<InstalledPluginRow> = installed
        .iter()
        .map(|p| InstalledPluginRow {
            name: p.name.clone(),
            version: p.version.clone(),
            installed: p.installed_at.format("%Y-%m-%d").to_string(),
            size: format_size(get_file_size(&p.wasm_path)),
        })
        .collect();

    let table = Table::new(rows).to_string();
    println!("{}", table);

    println!("\n{} {} plugins installed", "📊".blue(), installed.len());

    Ok(())
}

/// Show plugin details.
async fn show_plugin_info(name: &str) -> anyhow::Result<()> {
    println!("{} Plugin info: {}\n", "ℹ️ ".cyan(), name.green());

    let client = MarketplaceClient::new(get_cache_dir()).await?;

    // Check if installed locally
    if let Some(info) = client.list_installed().iter().find(|p| p.name == name) {
        println!("{}", "Local Installation:".blue().bold());
        println!("  Name:      {}", info.name);
        println!("  Version:   {}", info.version);
        println!(
            "  Installed: {}",
            info.installed_at.format("%Y-%m-%d %H:%M")
        );
        println!("  Path:      {}", info.wasm_path.display());
        println!("  Checksum:  {}", info.checksum);
        println!();
    }

    // Try to get remote info
    match client.get_plugin(name).await {
        Ok(entry) => {
            println!("{}", "Marketplace Info:".blue().bold());
            println!("  Name:        {}", entry.manifest.name);
            println!("  Version:     {}", entry.manifest.version);
            println!("  Description: {}", entry.manifest.description);
            println!("  Author:      {}", entry.author.name);
            println!("  License:     {}", entry.license);
            println!("  Downloads:   {}", format_number(entry.downloads));
            println!(
                "  Rating:      ⭐ {:.1} ({} ratings)",
                entry.rating, entry.rating_count
            );
            println!("  Published:   {}", entry.published_at.format("%Y-%m-%d"));
            println!("  Updated:     {}", entry.updated_at.format("%Y-%m-%d"));
            if let Some(repo) = &entry.repository {
                println!("  Repository:  {}", repo);
            }
            if !entry.tags.is_empty() {
                println!("  Tags:        {}", entry.tags.join(", "));
            }
        }
        Err(_) => {
            println!("{} Could not fetch remote plugin info", "⚠️".yellow());
        }
    }

    Ok(())
}

/// Check for updates.
async fn check_updates() -> anyhow::Result<()> {
    println!("{} Checking for updates...\n", "🔄".cyan());

    let client = MarketplaceClient::new(get_cache_dir()).await?;
    let updates = client.check_updates().await?;

    if updates.is_empty() {
        println!("{} All plugins are up to date!", "✓".green());
    } else {
        println!("{} Updates available:\n", "📦".blue());
        for (name, current, latest) in &updates {
            println!(
                "  • {} {} → {}",
                name.cyan(),
                current.yellow(),
                latest.green()
            );
        }
        println!(
            "\n{} Run {} to update all",
            "💡".blue(),
            "ember plugin update --all".cyan()
        );
    }

    Ok(())
}

/// Show featured plugins.
async fn show_featured() -> anyhow::Result<()> {
    println!("{} Featured Plugins\n", "⭐".cyan());

    let client = MarketplaceClient::new(get_cache_dir()).await?;

    match client.get_featured().await {
        Ok(featured) => {
            if !featured.editors_picks.is_empty() {
                println!("{}", "🏆 Editor's Picks:".blue().bold());
                for p in &featured.editors_picks {
                    println!(
                        "  • {} v{} - {}",
                        p.manifest.name.green(),
                        p.manifest.version,
                        truncate(&p.manifest.description, 50)
                    );
                }
                println!();
            }

            if !featured.popular.is_empty() {
                println!("{}", "📈 Most Popular:".blue().bold());
                for p in &featured.popular {
                    println!(
                        "  • {} ({} downloads) - {}",
                        p.manifest.name.green(),
                        format_number(p.downloads),
                        truncate(&p.manifest.description, 40)
                    );
                }
                println!();
            }

            if !featured.trending.is_empty() {
                println!("{}", "🔥 Trending:".blue().bold());
                for p in &featured.trending {
                    println!(
                        "  • {} ⭐{:.1} - {}",
                        p.manifest.name.green(),
                        p.rating,
                        truncate(&p.manifest.description, 40)
                    );
                }
            }
        }
        Err(_) => {
            // Fallback to example plugins
            show_example_plugins();
        }
    }

    Ok(())
}

/// Show available tags.
async fn show_tags() -> anyhow::Result<()> {
    println!("{} Available Tags\n", "🏷️ ".cyan());

    let client = MarketplaceClient::new(get_cache_dir()).await?;

    match client.get_tags().await {
        Ok(tags) => {
            for tag in tags {
                println!(
                    "  {} ({} plugins){}",
                    tag.name.cyan(),
                    tag.count,
                    tag.description
                        .map(|d| format!(" - {}", d))
                        .unwrap_or_default()
                );
            }
        }
        Err(_) => {
            // Show example tags
            let example_tags = vec![
                ("ai", 15, "AI and machine learning tools"),
                ("productivity", 12, "Productivity enhancements"),
                ("devtools", 10, "Developer tools"),
                ("integration", 8, "Third-party integrations"),
                ("utility", 6, "General utilities"),
            ];
            for (name, count, desc) in example_tags {
                println!("  {} ({} plugins) - {}", name.cyan(), count, desc);
            }
        }
    }

    println!(
        "\n{} Use {} to filter by tag",
        "💡".blue(),
        "ember plugin search --tags ai".cyan()
    );

    Ok(())
}

/// Clear plugin cache.
async fn clear_cache() -> anyhow::Result<()> {
    println!("{} Clearing plugin cache...", "🗑️ ".cyan());

    let cache_dir = get_cache_dir();
    if cache_dir.exists() {
        fs::remove_dir_all(&cache_dir).await?;
        fs::create_dir_all(&cache_dir).await?;
    }

    println!("{} Plugin cache cleared!", "✓".green());

    Ok(())
}

/// Show cache information.
async fn show_cache_info() -> anyhow::Result<()> {
    println!("{} Plugin Cache Info\n", "📊".cyan());

    let client = MarketplaceClient::new(get_cache_dir()).await?;
    let stats = client.cache_stats().await?;

    println!("  Location:     {}", stats.cache_dir.display());
    println!("  Plugins:      {}", stats.plugin_count);
    println!("  Total Size:   {}", format_size(stats.total_size));

    Ok(())
}

// ============================================================================
// Helper Functions
// ============================================================================

/// Show example plugins (for demo when offline).
fn show_example_plugins() {
    println!("\n{}", "Example Plugins:".blue().bold());

    let examples = vec![
        (
            "weather",
            "1.2.0",
            "Get weather forecasts for any location",
            "12.5k",
            "4.8",
        ),
        (
            "slack",
            "2.0.1",
            "Send messages and notifications to Slack",
            "8.3k",
            "4.6",
        ),
        (
            "github",
            "1.5.0",
            "Interact with GitHub repositories and issues",
            "15.2k",
            "4.9",
        ),
        (
            "jira",
            "1.1.0",
            "Create and manage Jira tickets",
            "5.7k",
            "4.3",
        ),
        (
            "calendar",
            "1.0.0",
            "Manage Google Calendar events",
            "3.2k",
            "4.5",
        ),
    ];

    for (name, version, desc, downloads, rating) in examples {
        println!(
            "  • {} v{} ({} downloads, ⭐{}) - {}",
            name.green(),
            version,
            downloads,
            rating,
            desc
        );
    }

    println!(
        "\n{} These are example plugins for demonstration.",
        "ℹ️ ".blue()
    );
}

/// Truncate string to max length.
fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len - 3])
    }
}

/// Format large numbers with K/M suffixes.
fn format_number(n: u64) -> String {
    if n >= 1_000_000 {
        format!("{:.1}M", n as f64 / 1_000_000.0)
    } else if n >= 1_000 {
        format!("{:.1}k", n as f64 / 1_000.0)
    } else {
        n.to_string()
    }
}

/// Format file size.
fn format_size(bytes: u64) -> String {
    if bytes >= 1_024 * 1_024 {
        format!("{:.1} MB", bytes as f64 / (1_024.0 * 1_024.0))
    } else if bytes >= 1_024 {
        format!("{:.1} KB", bytes as f64 / 1_024.0)
    } else {
        format!("{} B", bytes)
    }
}

/// Get file size (0 if not exists).
fn get_file_size(path: &std::path::Path) -> u64 {
    std::fs::metadata(path).map(|m| m.len()).unwrap_or(0)
}
