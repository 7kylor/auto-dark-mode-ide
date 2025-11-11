# Auto Dark Mode Cursor Extension

A lightweight Cursor extension that automatically switches Cursor's color theme based on your macOS system theme (light/dark mode). When macOS switches to dark mode, Cursor follows suit, and vice versa.

## Features

- **Automatic Theme Switching**: Monitors macOS system theme and automatically switches Cursor theme
- **Enable/Disable Toggle**: Easy on/off control via status bar or command palette
- **Configurable Themes**: Choose which dark and light themes to use
- **Performance Optimized**: Efficient polling with caching to minimize system impact
- **Status Bar Indicator**: Visual feedback showing extension state

## Installation

### From VSIX File

1. Download the `.vsix` file from the releases
2. Open Cursor/VS Code
3. Go to Extensions view (Cmd+Shift+X)
4. Click the `...` menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

### From Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` in VS Code/Cursor to open a new window with the extension loaded
5. Or package the extension:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

## Usage

### Automatic Mode (Default)

The extension automatically starts monitoring macOS theme changes when enabled. Simply switch your macOS theme and Cursor will follow.

### Manual Control

- **Toggle Extension**: Click the status bar indicator or run `Auto Dark Mode: Toggle Auto Dark Mode` from the command palette
- **Manual Detection**: Run `Auto Dark Mode: Detect and Apply macOS Theme` to immediately detect and apply the current macOS theme

### Configuration

You can configure the extension in your settings:

```json
{
  "autoDarkMode.enabled": true,
  "autoDarkMode.darkTheme": "Cursor Dark",
  "autoDarkMode.lightTheme": "Cursor Light"
}
```

## Requirements

- macOS (for system theme detection)
- Cursor or VS Code 1.80.0 or higher

## How It Works

1. The extension polls macOS system theme every 2.5 seconds using the `defaults read -g AppleInterfaceStyle` command
2. When a theme change is detected, it updates Cursor's `workbench.colorTheme` setting
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
   npm install -g @vscode/vsce
   ```

2. Login to the marketplace:

   ```bash
   vsce login <publisher-name>
   ```

3. Package the extension:

   ```bash
   vsce package
   ```

4. Publish the extension:
   ```bash
   vsce publish
   ```

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

## License

MIT
