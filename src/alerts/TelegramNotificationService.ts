import { Telegraf } from 'telegraf';
import logger from '../lib/logger';
import { Alert } from '../lib/types';

export class TelegramNotificationService {
  private bot: Telegraf | null = null;
  private chatId: string;

  constructor() {
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.initialize();
  }

  private initialize(): void {
    if (process.env.TELEGRAM_ENABLED !== 'true') {
      logger.info('Telegram notifications disabled');
      return;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      logger.warn('Telegram bot token not configured');
      return;
    }

    try {
      this.bot = new Telegraf(token);
      logger.info('Telegram bot initialized');
    } catch (error) {
      logger.error('Failed to initialize Telegram bot', { error });
    }
  }

  /**
   * Send alert via Telegram
   */
  async sendAlert(alert: Alert): Promise<void> {
    if (!this.bot || !this.chatId) {
      logger.warn('Telegram bot not configured');
      return;
    }

    try {
      const message = this.formatAlertMessage(alert);

      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
      });

      logger.info('Alert sent via Telegram', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to send alert via Telegram', { error });
      throw error;
    }
  }

  /**
   * Format alert message for Telegram
   */
  private formatAlertMessage(alert: Alert): string {
    const emoji = this.getSeverityEmoji(alert.severity);

    return `
${emoji} *${alert.title}*

*Severity:* ${alert.severity.toUpperCase()}
*Type:* ${alert.alert_type}
*Status:* ${alert.status}
*Triggered:* ${alert.triggered_at}

${alert.message || 'No additional details'}

_Alert ID: ${alert.id}_
    `.trim();
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
      info: 'ℹ️',
    };
    return emojis[severity] || '⚠️';
  }

  /**
   * Send custom message
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.bot || !this.chatId) return;

    try {
      await this.bot.telegram.sendMessage(this.chatId, message);
      logger.debug('Custom message sent via Telegram');
    } catch (error) {
      logger.error('Failed to send custom message via Telegram', { error });
    }
  }
}
