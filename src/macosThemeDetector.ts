import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type SystemTheme = "light" | "dark";

export class MacOSThemeDetector {
  private lastDetectedTheme: SystemTheme | null = null;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private readonly pollIntervalMs = 2500; // Check every 2.5 seconds

  /**
   * Detects the current macOS system theme
   * @returns Promise resolving to 'light' or 'dark'
   */
  async detectTheme(): Promise<SystemTheme> {
    try {
      const { stdout } = await execAsync(
        "defaults read -g AppleInterfaceStyle"
      );
      const theme = stdout.trim();
      const systemTheme: SystemTheme = theme === "Dark" ? "dark" : "light";
      this.lastDetectedTheme = systemTheme;
      return systemTheme;
    } catch {
      // If command fails (e.g., on non-macOS or light mode), defaults to light
      this.lastDetectedTheme = "light";
      return "light";
    }
  }

  /**
   * Starts monitoring macOS theme changes
   * @param callback Function called when theme changes
   */
  startMonitoring(callback: (theme: SystemTheme) => void): void {
    this.stopMonitoring();

    // Initial detection
    this.detectTheme().then(callback);

    // Poll for changes
    this.checkInterval = setInterval(async () => {
      const previousTheme = this.lastDetectedTheme;
      const currentTheme = await this.detectTheme();

      // Only call callback if theme actually changed
      if (previousTheme !== currentTheme) {
        callback(currentTheme);
      }
    }, this.pollIntervalMs);
  }

  /**
   * Stops monitoring macOS theme changes
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Gets the last detected theme without making a new detection
   */
  getLastDetectedTheme(): SystemTheme | null {
    return this.lastDetectedTheme;
  }
}
