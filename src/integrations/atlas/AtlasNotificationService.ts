import logger from '../../lib/logger';
import { AtlasMessenger } from './AtlasMessenger';
import { AtlasNotification } from './types';
import { DataExchange } from './DataExchangeProtocol';
import axios from 'axios';

export class AtlasNotificationService {
  private messenger: AtlasMessenger;
  private dataExchange: DataExchange;
  private notificationEndpoint: string;

  constructor(messenger: AtlasMessenger) {
    this.messenger = messenger;
    this.dataExchange = new DataExchange(messenger);
    this.notificationEndpoint = process.env.ATLAS_NOTIFICATION_ENDPOINT || '';
  }

  /**
   * Send important finding to Atlas
   */
  async notifyImportantFinding(finding: {
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    data: any;
  }): Promise<void> {
    try {
      // Send via database messenger
      await this.messenger.sendMessage({
        type: 'notification',
        priority: this.mapSeverityToPriority(finding.severity),
        source: 'panopticon-engine',
        payload: {
          title: finding.title,
          description: finding.description,
          severity: finding.severity,
          data: finding.data,
        },
      });

      // Also send via HTTP endpoint if configured
      if (this.notificationEndpoint) {
        await this.sendHttpNotification(finding);
      }

      logger.info('Important finding sent to Atlas', { title: finding.title });
    } catch (error) {
      logger.error('Failed to notify Atlas of important finding', { error });
    }
  }

  /**
   * Send critical alert to Atlas
   */
  async notifyCriticalAlert(alert: any): Promise<void> {
    try {
      await this.notifyImportantFinding({
        title: `Critical Alert: ${alert.title}`,
        description: alert.message || 'No description provided',
        severity: 'critical',
        data: {
          alert_id: alert.id,
          alert_type: alert.alert_type,
          triggered_at: alert.triggered_at,
          context: alert.context,
        },
      });
    } catch (error) {
      logger.error('Failed to notify Atlas of critical alert', { error });
    }
  }

  /**
   * Send pattern discovery notification
   */
  async notifyPatternDiscovery(pattern: any): Promise<void> {
    try {
      await this.dataExchange.sendPatternDiscovery(pattern);

      if (pattern.confidence_score > 90) {
        await this.notifyImportantFinding({
          title: `High-Confidence Pattern Detected: ${pattern.name}`,
          description: pattern.description || 'A significant pattern has been identified',
          severity: 'warning',
          data: {
            pattern_id: pattern.id,
            pattern_type: pattern.pattern_type,
            confidence_score: pattern.confidence_score,
            occurrence_count: pattern.occurrence_count,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to notify Atlas of pattern discovery', { error });
    }
  }

  /**
   * Send anomaly detection notification
   */
  async notifyAnomalyDetected(anomaly: any, observation: any): Promise<void> {
    try {
      await this.dataExchange.sendAnomalyAlert(anomaly);

      await this.notifyImportantFinding({
        title: `Anomaly Detected in ${observation.observation_type}`,
        description: `Value ${anomaly.value} deviates significantly from expected ${anomaly.expectedValue}`,
        severity: 'error',
        data: {
          observation_id: observation.id,
          anomaly_score: anomaly.score,
          detection_method: anomaly.method,
          confidence: anomaly.confidence,
        },
      });
    } catch (error) {
      logger.error('Failed to notify Atlas of anomaly detection', { error });
    }
  }

  /**
   * Send system health update
   */
  async notifyHealthUpdate(health: any): Promise<void> {
    try {
      await this.dataExchange.sendHealthStatus(health);
    } catch (error) {
      logger.error('Failed to send health update to Atlas', { error });
    }
  }

  /**
   * Send HTTP notification
   */
  private async sendHttpNotification(finding: any): Promise<void> {
    try {
      await axios.post(
        this.notificationEndpoint,
        finding,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.ATLAS_API_KEY || '',
          },
          timeout: 5000,
        }
      );

      logger.debug('HTTP notification sent to Atlas');
    } catch (error) {
      logger.error('Failed to send HTTP notification to Atlas', { error });
    }
  }

  /**
   * Map severity to priority
   */
  private mapSeverityToPriority(
    severity: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'error':
        return 'high';
      case 'warning':
        return 'medium';
      default:
        return 'low';
    }
  }
}
