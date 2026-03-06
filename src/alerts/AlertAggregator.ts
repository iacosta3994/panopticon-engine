import logger from '../lib/logger';
import { Alert } from '../lib/types';

export class AlertAggregator {
  private aggregationWindow: number = 5 * 60 * 1000; // 5 minutes
  private aggregatedAlerts: Map<string, Alert[]> = new Map();

  /**
   * Add alert to aggregation
   */
  addAlert(alert: Alert): void {
    const key = this.getAggregationKey(alert);
    const alerts = this.aggregatedAlerts.get(key) || [];
    alerts.push(alert);
    this.aggregatedAlerts.set(key, alerts);
  }

  /**
   * Get aggregated alerts
   */
  getAggregatedAlerts(): Map<string, Alert[]> {
    return this.aggregatedAlerts;
  }

  /**
   * Get alerts that should be sent
   */
  getAlertsToSend(): Alert[] {
    const now = Date.now();
    const alertsToSend: Alert[] = [];

    for (const [key, alerts] of this.aggregatedAlerts.entries()) {
      if (alerts.length === 0) continue;

      const oldestAlert = alerts[0];
      const timeSinceFirst = now - new Date(oldestAlert.triggered_at).getTime();

      // Send if window expired or count threshold reached
      if (timeSinceFirst >= this.aggregationWindow || alerts.length >= 10) {
        // Create aggregated alert
        const aggregated = this.createAggregatedAlert(alerts);
        alertsToSend.push(aggregated);

        // Clear aggregation
        this.aggregatedAlerts.set(key, []);
      }
    }

    return alertsToSend;
  }

  /**
   * Get aggregation key for alert
   */
  private getAggregationKey(alert: Alert): string {
    return `${alert.alert_type}:${alert.severity}`;
  }

  /**
   * Create aggregated alert from multiple alerts
   */
  private createAggregatedAlert(alerts: Alert[]): Alert {
    const first = alerts[0];
    const count = alerts.length;

    return {
      ...first,
      title: `${first.title} (${count} occurrences)`,
      message: `This alert occurred ${count} times in the last ${this.aggregationWindow / 1000 / 60} minutes.\n\nFirst: ${first.triggered_at}\nLast: ${alerts[count - 1].triggered_at}`,
      context: {
        ...first.context,
        aggregated: true,
        count,
        alerts: alerts.map(a => a.id),
      },
    };
  }

  /**
   * Clear all aggregations
   */
  clear(): void {
    this.aggregatedAlerts.clear();
    logger.debug('Alert aggregations cleared');
  }

  /**
   * Set aggregation window
   */
  setAggregationWindow(milliseconds: number): void {
    this.aggregationWindow = milliseconds;
    logger.info('Alert aggregation window updated', { windowMs: milliseconds });
  }
}
