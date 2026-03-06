import logger from '../lib/logger';
import { Alert } from '../lib/types';
import { EmailNotificationService } from './EmailNotificationService';
import { TelegramNotificationService } from './TelegramNotificationService';
import axios from 'axios';

export class AlertDispatcher {
  private emailService: EmailNotificationService;
  private telegramService: TelegramNotificationService;

  constructor() {
    this.emailService = new EmailNotificationService();
    this.telegramService = new TelegramNotificationService();
  }

  /**
   * Dispatch alert to all configured channels
   */
  async dispatch(alert: Alert, channels: string[] = ['all']): Promise<void> {
    logger.info('Dispatching alert', { alertId: alert.id, channels });

    const promises: Promise<void>[] = [];

    if (channels.includes('all') || channels.includes('email')) {
      promises.push(this.dispatchEmail(alert));
    }

    if (channels.includes('all') || channels.includes('telegram')) {
      promises.push(this.dispatchTelegram(alert));
    }

    if (channels.includes('all') || channels.includes('slack')) {
      promises.push(this.dispatchSlack(alert));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Dispatch via email
   */
  private async dispatchEmail(alert: Alert): Promise<void> {
    try {
      await this.emailService.sendAlertEmail(alert);
      logger.info('Alert dispatched via email', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to dispatch alert via email', { error });
    }
  }

  /**
   * Dispatch via Telegram
   */
  private async dispatchTelegram(alert: Alert): Promise<void> {
    try {
      await this.telegramService.sendAlert(alert);
      logger.info('Alert dispatched via Telegram', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to dispatch alert via Telegram', { error });
    }
  }

  /**
   * Dispatch via Slack
   */
  private async dispatchSlack(alert: Alert): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await axios.post(webhookUrl, {
        text: `🚨 ${alert.title}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: alert.title,
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
              { type: 'mrkdwn', text: `*Status:*\n${alert.status}` },
            ],
          },
        ],
      });

      logger.info('Alert dispatched via Slack', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to dispatch alert via Slack', { error });
    }
  }
}
