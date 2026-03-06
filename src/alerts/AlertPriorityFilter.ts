import logger from '../lib/logger';
import { Alert, Severity } from '../lib/types';

export class AlertPriorityFilter {
  private minSeverity: Severity;
  private severityLevels: Record<Severity, number> = {
    info: 1,
    low: 2,
    medium: 3,
    high: 4,
    critical: 5,
  };

  constructor(minSeverity: Severity = 'medium') {
    this.minSeverity = minSeverity;
  }

  /**
   * Check if alert should be processed
   */
  shouldProcess(alert: Alert): boolean {
    const alertLevel = this.severityLevels[alert.severity];
    const minLevel = this.severityLevels[this.minSeverity];

    return alertLevel >= minLevel;
  }

  /**
   * Filter alerts by priority
   */
  filter(alerts: Alert[]): Alert[] {
    return alerts.filter(alert => this.shouldProcess(alert));
  }

  /**
   * Set minimum severity
   */
  setMinSeverity(severity: Severity): void {
    this.minSeverity = severity;
    logger.info('Alert priority filter updated', { minSeverity: severity });
  }

  /**
   * Get current minimum severity
   */
  getMinSeverity(): Severity {
    return this.minSeverity;
  }

  /**
   * Sort alerts by priority (highest first)
   */
  sortByPriority(alerts: Alert[]): Alert[] {
    return alerts.sort((a, b) => {
      return this.severityLevels[b.severity] - this.severityLevels[a.severity];
    });
  }
}
