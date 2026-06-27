import * as vscode from "vscode";
import { SystemTheme } from "./macosThemeDetector";

export class ThemeManager {
  private lastAppliedTheme: string | null = null;
  private installedThemeNames: Set<string> | null = null;
  private readonly isCursor = vscode.env.appName.toLowerCase().includes("cursor");

  private readonly vsCodeThemes: Record<SystemTheme, string[]> = {
    dark: ["Dark 2026", "Dark Modern", "Dark+", "Cursor Dark"],
    light: ["Light 2026", "Light Modern", "Light+", "Cursor Light"],
  };

  private readonly cursorThemes: Record<SystemTheme, string[]> = {
    dark: ["Cursor Dark", "Dark 2026", "Dark Modern", "Dark+"],
    light: ["Cursor Light", "Light 2026", "Light Modern", "Light+"],
  };

  /**
   * Gets installed theme ids and labels contributed by VS Code/Cursor extensions.
   */
  private getInstalledThemeNames(): Set<string> {
    if (this.installedThemeNames) {
      return this.installedThemeNames;
    }

    const themeNames = new Set<string>();

    for (const extension of vscode.extensions.all) {
      const themes = extension.packageJSON?.contributes?.themes;
      if (!Array.isArray(themes)) {
        continue;
      }

      for (const theme of themes) {
        for (const key of ["id", "label"]) {
          const value = theme[key];
          if (typeof value === "string" && value && !value.startsWith("%")) {
            themeNames.add(value);
          }
        }
      }
    }

    this.installedThemeNames = themeNames;
    return themeNames;
  }

  private getThemeCandidates(systemTheme: SystemTheme): string[] {
    return this.isCursor
      ? this.cursorThemes[systemTheme]
      : this.vsCodeThemes[systemTheme];
  }

  private getConfiguredTheme(systemTheme: SystemTheme): string | undefined {
    const config = vscode.workspace.getConfiguration("autoDarkMode");
    const settingName = systemTheme === "dark" ? "darkTheme" : "lightTheme";
    const inspected = config.inspect<string>(settingName);

    return (
      inspected?.workspaceFolderValue ??
      inspected?.workspaceValue ??
      inspected?.globalValue
    );
  }

  private getAvailableThemeName(systemTheme: SystemTheme): string {
    const installedThemeNames = this.getInstalledThemeNames();
    const configuredTheme = this.getConfiguredTheme(systemTheme);
    const candidates = configuredTheme
      ? [configuredTheme, ...this.getThemeCandidates(systemTheme)]
      : this.getThemeCandidates(systemTheme);

    for (const themeName of candidates) {
      if (installedThemeNames.has(themeName)) {
        return themeName;
      }
    }

    return configuredTheme ?? candidates[0];
  }

  /**
   * Gets the configured theme name for the given system theme
   */
  private getThemeName(systemTheme: SystemTheme): string {
    return this.getAvailableThemeName(systemTheme);
  }

  /**
   * Applies the appropriate theme based on macOS system theme
   */
  async applyTheme(systemTheme: SystemTheme): Promise<boolean> {
    const themeName = this.getThemeName(systemTheme);

    // Avoid redundant updates
    const currentTheme = vscode.workspace
      .getConfiguration()
      .get<string>("workbench.colorTheme");

    if (this.lastAppliedTheme === themeName || currentTheme === themeName) {
      this.lastAppliedTheme = themeName;
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
    this.installedThemeNames = null;
  }
}
