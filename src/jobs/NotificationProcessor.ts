import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { Alert } from '../lib/types';
import axios from 'axios';
import { config } from '../lib/config';

export class NotificationProcessor {
  async execute(): Promise<void> {
    try {
      if (!config.notification.enabled) {
        return;
      }

      // Get unprocessed alerts
      const alerts = await this.getUnprocessedAlerts();

      if (alerts.length === 0) {
        return;
      }

      logger.info(`Processing ${alerts.length} notifications`);

      for (const alert of alerts) {
        await this.processAlert(alert);
      }

    } catch (error) {
      logger.error('Notification processor failed', { error });
      throw error;
    }
  }

  private async getUnprocessedAlerts(): Promise<Alert[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'open')
        .is('acknowledged_at', null)
        .order('triggered_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch unprocessed alerts', { error });
      return [];
    }
  }

  private async processAlert(alert: Alert): Promise<void> {
    try {
      // Send to configured notification channels
      if (config.notification.slackWebhookUrl) {
        await this.sendSlackNotification(alert);
      }

      // Mark as acknowledged
      if (supabase) {
        await supabase
          .from('alerts')
          .update({
            status: 'acknowledged',
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: 'notification_processor',
          })
          .eq('id', alert.id);
      }

      logger.debug('Alert notification sent', { alert: alert.id });
    } catch (error) {
      logger.error('Failed to process alert notification', { error, alert: alert.id });
    }
  }

  private async sendSlackNotification(alert: Alert): Promise<void> {
    const emoji = this.getSeverityEmoji(alert.severity);
    
    await axios.post(config.notification.slackWebhookUrl, {
      text: `${emoji} *${alert.title}*`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${alert.title}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: alert.message || 'No additional details',
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Severity:*\n${alert.severity}` },
            { type: 'mrkdwn', text: `*Type:*\n${alert.alert_type}` },
            { type: 'mrkdwn', text: `*Triggered:*\n${alert.triggered_at}` },
            { type: 'mrkdwn', text: `*Status:*\n${alert.status}` },
          ],
        },
      ],
    });
  }

  private getSeverityEmoji(severity: string): string {
    const emojiMap: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
      info: 'ℹ️',
    };
    return emojiMap[severity] || '❓';
  }
}
