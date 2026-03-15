# Ember i18n

Internationalization (i18n) support for Ember - AI Agent Framework.

## Overview

This crate provides localization capabilities for Ember, enabling the framework to support multiple languages. It uses the `rust-i18n` library for translation management and includes automatic locale detection from system settings.

## Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete (Default) |
| German | `de` | ✅ Complete |
| French | `fr` | ✅ Complete |
| Spanish | `es` | ✅ Complete |
| Chinese (Simplified) | `zh-CN` | ✅ Complete |
| Japanese | `ja` | ✅ Complete |

## Features

- **Automatic Locale Detection**: Automatically detects the system locale on startup
- **Manual Override**: Set the locale programmatically at any time
- **Fallback Support**: Falls back to English for missing translations
- **Type-Safe Keys**: Organized translation modules for different components
- **Interpolation**: Support for dynamic values in translations
- **Pluralization**: Built-in pluralization support (via rust-i18n)

## Usage

### Basic Usage

```rust
use ember_i18n::{t, init, set_locale, get_locale, Locale};

fn main() {
    // Initialize with automatic locale detection
    init();
    
    // Or initialize with a specific locale
    // init_with_locale(Locale::German);
    
    // Get current locale
    println!("Current locale: {}", get_locale().code());
    
    // Use translations
    println!("{}", t!("cli.welcome"));
    
    // With interpolation
    println!("{}", t!("cli.version", version = "1.0.0"));
}
```

### Using Translation Modules

```rust
use ember_i18n::{cli, errors, status, ui};

fn main() {
    // CLI translations
    println!("{}", cli::welcome());
    println!("{}", cli::version("1.0.0"));
    
    // Error messages
    println!("{}", errors::api_key_missing("OpenAI"));
    println!("{}", errors::rate_limit(60));
    
    // Status messages
    println!("{}", status::connecting("Anthropic"));
    println!("{}", status::retrying(2, 3));
    
    // UI strings
    println!("{}", ui::send());
    println!("{}", ui::settings());
}
```

### Changing Locale at Runtime

```rust
use ember_i18n::{set_locale, get_locale, Locale};

fn main() {
    // Set to German
    set_locale(Locale::German);
    assert_eq!(get_locale(), Locale::German);
    
    // Set to Japanese
    set_locale(Locale::Japanese);
    assert_eq!(get_locale().code(), "ja");
}
```

### Getting Locale Information

```rust
use ember_i18n::Locale;

fn main() {
    let locale = Locale::German;
    
    println!("Code: {}", locale.code());           // "de"
    println!("Native: {}", locale.native_name());  // "Deutsch"
    println!("English: {}", locale.english_name()); // "German"
}
```

### Checking Supported Locales

```rust
use ember_i18n::{available_locales, is_locale_supported, Locale};

fn main() {
    // Get all available locales
    for locale in available_locales() {
        println!("{}: {}", locale.code(), locale.native_name());
    }
    
    // Check if a locale is supported
    assert!(is_locale_supported("de"));
    assert!(is_locale_supported("ja"));
    assert!(!is_locale_supported("xx"));
}
```

## Translation Categories

### CLI (`cli`)
- Welcome messages
- Help text
- Version information
- Command descriptions

### Errors (`errors`)
- API key missing
- Network errors
- Rate limiting
- Authentication failures
- File/permission errors

### Status (`status`)
- Connection status
- Loading/processing states
- Completion/failure messages
- Retry notifications

### Tools (`tools`)
- Execution status messages
- Tool descriptions

### UI (`ui`)
- Button labels (Send, Cancel, Save, Delete)
- Section titles (Settings, Conversation)
- Placeholders
- Theme options

### Providers (`providers`)
- Provider names
- Provider descriptions

## Adding New Translations

1. Add the translation key to all locale files in `locales/`:
   - `en.json` (English - required, serves as fallback)
   - `de.json` (German)
   - `fr.json` (French)
   - `es.json` (Spanish)
   - `zh-CN.json` (Chinese Simplified)
   - `ja.json` (Japanese)

2. Add a helper function in the appropriate module in `src/lib.rs`

### Example: Adding a new translation

In `locales/en.json`:
```json
{
  "my_module": {
    "greeting": "Hello, %{name}!"
  }
}
```

In `src/lib.rs`:
```rust
pub mod my_module {
    use super::t;
    
    pub fn greeting(name: &str) -> String {
        t!("my_module.greeting", name = name).to_string()
    }
}
```

## Translation File Format

Translations use JSON format with nested keys:

```json
{
  "category": {
    "key": "Translation text",
    "key_with_param": "Hello, %{name}!"
  }
}
```

### Interpolation

Use `%{variable}` syntax for dynamic values:

```json
{
  "greeting": "Hello, %{name}! You have %{count} messages."
}
```

```rust
t!("greeting", name = "Alice", count = 5)
// "Hello, Alice! You have 5 messages."
```

## Contributing Translations

We welcome contributions for:
- Improving existing translations
- Adding new languages
- Fixing translation errors

Please ensure:
1. All keys present in `en.json` are also present in your translation
2. Interpolation variables (`%{var}`) are preserved exactly
3. Translations are culturally appropriate and natural-sounding

## Testing

```bash
# Run i18n tests
cargo test -p ember-i18n

# Run specific test
cargo test -p ember-i18n test_locale_codes
```

## License

MIT OR Apache-2.0