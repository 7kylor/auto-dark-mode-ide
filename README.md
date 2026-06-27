# Auto Dark Mode IDE

A lightweight VS Code and Cursor extension that automatically switches your IDE color theme based on the macOS system appearance. When macOS switches between light and dark mode, VS Code or Cursor follows with the themes you choose.

## Features

- **Automatic Theme Switching**: Monitors macOS system theme and automatically switches VS Code or Cursor theme
- **Enable/Disable Toggle**: Easy on/off control via status bar or command palette
- **Native Defaults Per IDE**: Uses VS Code's `Dark 2026` and `Light 2026`, and Cursor's original `Cursor Dark` and `Cursor Light`
- **IDE-Safe Fallbacks**: Falls back to installed Cursor or VS Code themes when a configured theme is unavailable
- **Configurable Themes**: Choose any installed dark and light themes for your IDE
- **Performance Optimized**: Efficient polling with caching to minimize system impact
- **Status Bar Indicator**: Visual feedback showing extension state

## Installation

### From VSIX File

1. Download the `.vsix` file from the releases
2. Open VS Code or Cursor
3. Go to Extensions view (Cmd+Shift+X)
4. Click the `...` menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

### From Source

1. Clone this repository
2. Run `bun install` to install dependencies
3. Run `bun run compile` to build the extension
4. Press `F5` in VS Code or Cursor to open a new window with the extension loaded
5. Or package the extension:
   ```bash
   bun run package
   ```

## Usage

### Automatic Mode (Default)

The extension automatically starts monitoring macOS theme changes when enabled. Switch your macOS appearance and your active IDE follows.

### Manual Control

- **Toggle Extension**: Click the status bar indicator or run `Auto Dark Mode: Toggle Auto Dark Mode` from the command palette
- **Manual Detection**: Run `Auto Dark Mode: Detect and Apply macOS Theme` to immediately detect and apply the current macOS theme

### Configuration

You can configure the extension in your settings:

```json
{
  "autoDarkMode.enabled": true,
  "autoDarkMode.darkTheme": "Dark 2026",
  "autoDarkMode.lightTheme": "Light 2026"
}
```

`Dark 2026` and `Light 2026` are the exact built-in VS Code theme ids. When no custom theme is configured, Cursor uses its original built-in theme names: `Cursor Dark` and `Cursor Light`.

## Requirements

- macOS (for system theme detection)
- VS Code or Cursor 1.80.0 or higher

## How It Works

1. The extension polls macOS system theme every 2.5 seconds using the `defaults read -g AppleInterfaceStyle` command
2. When a theme change is detected, it updates the IDE's `workbench.colorTheme` setting
3. Theme changes are cached to avoid redundant updates
4. Monitoring only occurs when the extension is enabled

## Performance

- Lightweight polling with 2.5 second intervals
- Caching prevents unnecessary theme updates
- Monitoring stops when extension is disabled
- Minimal CPU and memory usage

## Publishing

To publish the extension to the VS Code Marketplace:

1. Install the VS Code Extension Manager:

   ```bash
   bun install
   ```

2. Login to the marketplace:

   ```bash
   bunx vsce login <publisher-name>
   ```

3. Package the extension:

   ```bash
   bun run package
   ```

4. Publish the extension:
   ```bash
   bun run publish
   ```

## Development

```bash
# Install dependencies
bun install

# Compile TypeScript
bun run compile

# Watch for changes
bun run watch
```

## License

MIT
