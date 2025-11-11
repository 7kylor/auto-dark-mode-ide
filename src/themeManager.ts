import * as vscode from "vscode";
import { SystemTheme } from "./macosThemeDetector";

export class ThemeManager {
  private lastAppliedTheme: string | null = null;

  /**
   * Gets the configured theme name for the given system theme
   */
  private getThemeName(systemTheme: SystemTheme): string {
    const config = vscode.workspace.getConfiguration("autoDarkMode");
    return systemTheme === "dark"
      ? config.get<string>("darkTheme", "Cursor Dark")
      : config.get<string>("lightTheme", "Cursor Light");
  }

  /**
   * Applies the appropriate theme based on macOS system theme
   */
  async applyTheme(systemTheme: SystemTheme): Promise<boolean> {
    const themeName = this.getThemeName(systemTheme);

    // Avoid redundant updates
    if (this.lastAppliedTheme === themeName) {
      return false;
    }

    try {
      await vscode.workspace
        .getConfiguration()
        .update(
          "workbench.colorTheme",
          themeName,
          vscode.ConfigurationTarget.Global
        );

      this.lastAppliedTheme = themeName;
      return true;
    } catch (error) {
      console.error("Failed to apply theme:", error);
      return false;
    }
  }

  /**
   * Manually applies theme based on current macOS system theme
   */
  async detectAndApplyTheme(detector: {
    detectTheme: () => Promise<SystemTheme>;
  }): Promise<void> {
    const systemTheme = await detector.detectTheme();
    await this.applyTheme(systemTheme);
  }

  /**
   * Resets the last applied theme cache
   */
  resetCache(): void {
    this.lastAppliedTheme = null;
  }
}
