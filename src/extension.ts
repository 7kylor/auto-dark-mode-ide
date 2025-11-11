import * as vscode from 'vscode';
import { MacOSThemeDetector, SystemTheme } from './macosThemeDetector';
import { ThemeManager } from './themeManager';

let detector: MacOSThemeDetector | null = null;
let themeManager: ThemeManager | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;
let isMonitoring = false;

/**
 * Updates the status bar indicator
 */
function updateStatusBar(enabled: boolean): void {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = 'autoDarkMode.toggle';
  }

  if (enabled) {
    statusBarItem.text = '$(color-mode) Auto Dark Mode';
    statusBarItem.tooltip = 'Auto Dark Mode: Enabled (Click to disable)';
  } else {
    statusBarItem.text = '$(circle-slash) Auto Dark Mode';
    statusBarItem.tooltip = 'Auto Dark Mode: Disabled (Click to enable)';
  }

  statusBarItem.show();
}

/**
 * Checks if extension is enabled
 */
function isEnabled(): boolean {
  return vscode.workspace.getConfiguration('autoDarkMode').get<boolean>('enabled', true);
}

/**
 * Starts theme monitoring
 */
function startMonitoring(): void {
  if (isMonitoring || !isEnabled()) {
    return;
  }

  if (!detector) {
    detector = new MacOSThemeDetector();
  }

  if (!themeManager) {
    themeManager = new ThemeManager();
  }

  detector.startMonitoring(async (theme: SystemTheme) => {
    if (isEnabled()) {
      await themeManager!.applyTheme(theme);
    }
  });

  isMonitoring = true;
  updateStatusBar(true);
}

/**
 * Stops theme monitoring
 */
function stopMonitoring(): void {
  if (detector) {
    detector.stopMonitoring();
  }
  isMonitoring = false;
  updateStatusBar(false);
}

/**
 * Toggles the extension on/off
 */
async function toggleExtension(): Promise<void> {
  const config = vscode.workspace.getConfiguration('autoDarkMode');
  const currentValue = config.get<boolean>('enabled', true);
  await config.update('enabled', !currentValue, vscode.ConfigurationTarget.Global);
  
  if (!currentValue) {
    startMonitoring();
    // Immediately detect and apply theme
    if (detector && themeManager) {
      await themeManager.detectAndApplyTheme(detector);
    }
  } else {
    stopMonitoring();
  }
}

/**
 * Manually detects and applies macOS theme
 */
async function detectAndApplyTheme(): Promise<void> {
  if (!detector) {
    detector = new MacOSThemeDetector();
  }

  if (!themeManager) {
    themeManager = new ThemeManager();
  }

  await themeManager.detectAndApplyTheme(detector);
  vscode.window.showInformationMessage('Theme applied based on macOS system theme');
}

/**
 * Handles configuration changes
 */
function onConfigurationChanged(e: vscode.ConfigurationChangeEvent): void {
  if (e.affectsConfiguration('autoDarkMode.enabled')) {
    if (isEnabled()) {
      startMonitoring();
      if (detector && themeManager) {
        themeManager.detectAndApplyTheme(detector);
      }
    } else {
      stopMonitoring();
    }
  } else if (
    e.affectsConfiguration('autoDarkMode.darkTheme') ||
    e.affectsConfiguration('autoDarkMode.lightTheme')
  ) {
    // Reset cache when theme preferences change
    if (themeManager) {
      themeManager.resetCache();
      // Re-apply current theme
      if (detector && isEnabled()) {
        themeManager.detectAndApplyTheme(detector);
      }
    }
  }
}

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext): void {
  // Register commands
  const toggleCommand = vscode.commands.registerCommand('autoDarkMode.toggle', toggleExtension);
  const detectCommand = vscode.commands.registerCommand('autoDarkMode.detectTheme', detectAndApplyTheme);

  context.subscriptions.push(toggleCommand);
  context.subscriptions.push(detectCommand);

  // Listen for configuration changes
  const configWatcher = vscode.workspace.onDidChangeConfiguration(onConfigurationChanged);
  context.subscriptions.push(configWatcher);

  // Initialize components
  detector = new MacOSThemeDetector();
  themeManager = new ThemeManager();

  // Start monitoring if enabled
  if (isEnabled()) {
    startMonitoring();
    // Initial theme detection and application
    detector.detectTheme().then(async (theme) => {
      await themeManager!.applyTheme(theme);
    });
  } else {
    updateStatusBar(false);
  }

  // Cleanup on deactivation
  context.subscriptions.push({
    dispose: () => {
      stopMonitoring();
      if (statusBarItem) {
        statusBarItem.dispose();
      }
    }
  });
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  stopMonitoring();
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

