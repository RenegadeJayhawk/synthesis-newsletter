/**
 * Cron Job Logging Utility
 * Provides structured logging for automated newsletter generation
 */

export interface CronLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  metadata?: Record<string, any>;
}

class CronLogger {
  private logs: CronLogEntry[] = [];
  private maxLogs = 100; // Keep last 100 log entries

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: CronLogEntry['level'], message: string, metadata?: Record<string, any>) {
    const entry: CronLogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for Vercel logs
    const prefix = `[Cron ${level.toUpperCase()}]`;
    const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    console.log(`${prefix} ${message}${metaStr}`);

    return entry;
  }

  info(message: string, metadata?: Record<string, any>) {
    return this.addLog('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    return this.addLog('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>) {
    return this.addLog('error', message, metadata);
  }

  success(message: string, metadata?: Record<string, any>) {
    return this.addLog('success', message, metadata);
  }

  getLogs(): CronLogEntry[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 10): CronLogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const cronLogger = new CronLogger();
