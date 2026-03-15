# Weather Plugin for Ember

Get weather forecasts for any location using the OpenWeatherMap API.

## Features

- **Current Weather**: Get real-time weather data for any city
- **5-Day Forecast**: Plan ahead with detailed forecasts
- **Weather Alerts**: Stay informed about severe weather conditions
- **Multiple Units**: Support for metric, imperial, and kelvin
- **Multi-Language**: Weather descriptions in 40+ languages

## Installation

```bash
ember plugin install weather
```

## Configuration

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Set the API key:

```bash
# Via environment variable
export OPENWEATHER_API_KEY=your_api_key

# Or via Ember config
ember config set weather.api_key your_api_key
```

### Optional Settings

```bash
# Set temperature units (metric, imperial, kelvin)
ember config set weather.units metric

# Set language for descriptions
ember config set weather.language en
```

## Usage

### Get Current Weather

```
User: What's the weather in Berlin?

Agent: Let me check the current weather in Berlin.

🌤️ Weather in Berlin, Germany:
- Temperature: 18°C (feels like 16°C)
- Conditions: Partly cloudy
- Humidity: 65%
- Wind: 12 km/h from the west
- Visibility: 10 km
```

### Get Forecast

```
User: What's the weather forecast for Tokyo this week?

Agent: Here's the 5-day forecast for Tokyo:

📅 5-Day Forecast for Tokyo, Japan:

Monday:    ☀️ 24°C / 18°C - Sunny
Tuesday:   🌤️ 22°C / 17°C - Partly cloudy
Wednesday: 🌧️ 19°C / 15°C - Rain expected
Thursday:  ⛈️ 17°C / 14°C - Thunderstorms
Friday:    🌤️ 21°C / 16°C - Clearing up
```

### Get Weather Alerts

```
User: Are there any weather alerts for Florida?

Agent: Let me check for weather alerts in Florida.

⚠️ Weather Alerts for Florida:
1. Heat Advisory (until 8 PM EDT)
   - Excessive heat expected with temperatures up to 38°C
   - Stay hydrated and limit outdoor activities

2. Thunderstorm Watch (6 PM - 11 PM EDT)
   - Scattered thunderstorms possible
   - Some storms may be severe
```

## Tools Reference

### get_weather

Get current weather for a location.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location | string | Yes | City name or coordinates (lat,lon) |

**Example:**
```json
{
  "name": "get_weather",
  "parameters": {
    "location": "New York"
  }
}
```

### get_forecast

Get weather forecast for the next 5 days.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | string | Yes | - | City name or coordinates |
| days | integer | No | 5 | Number of days (1-5) |

**Example:**
```json
{
  "name": "get_forecast",
  "parameters": {
    "location": "London",
    "days": 3
  }
}
```

### get_alerts

Get weather alerts for a location.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location | string | Yes | City name or coordinates |

## Development

### Building from Source

```bash
cd examples/plugins/weather
cargo build --release --target wasm32-wasi
```

### Testing

```bash
cargo test
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## Support

- [GitHub Issues](https://github.com/ember-ai/plugin-weather/issues)
- [Discord](https://discord.gg/ember)
- [Documentation](https://docs.ember.dev/plugins/weather)