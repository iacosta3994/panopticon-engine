import nodemailer from 'nodemailer';
import logger from '../lib/logger';
import { Alert } from '../lib/types';

export class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (process.env.EMAIL_ENABLED !== 'true') {
      logger.info('Email notifications disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      logger.info('Email service initialized');
    } catch (error) {
      logger.error('Failed to initialize email service', { error });
    }
  }

  /**
   * Send alert email
   */
  async sendAlertEmail(alert: Alert): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email transporter not configured');
      return;
    }

    try {
      const html = this.formatAlertHtml(alert);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'panopticon@example.com',
        to: process.env.ALERT_EMAIL_TO || 'admin@example.com',
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html,
      });

      logger.info('Alert email sent', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to send alert email', { error });
      throw error;
    }
  }

  /**
   * Format alert as HTML
   */
  private formatAlertHtml(alert: Alert): string {
    const severityColor = this.getSeverityColor(alert.severity);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${severityColor}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${alert.title}</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Alert ID:</span> ${alert.id}
            </div>
            <div class="field">
              <span class="label">Severity:</span> ${alert.severity.toUpperCase()}
            </div>
            <div class="field">
              <span class="label">Type:</span> ${alert.alert_type}
            </div>
            <div class="field">
              <span class="label">Status:</span> ${alert.status}
            </div>
            <div class="field">
              <span class="label">Triggered:</span> ${alert.triggered_at}
            </div>
            ${alert.message ? `
            <div class="field">
              <span class="label">Message:</span>
              <p>${alert.message}</p>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>Panopticon Engine - Intelligent Surveillance System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: '#d32f2f',
      high: '#f57c00',
      medium: '#fbc02d',
      low: '#388e3c',
      info: '#1976d2',
    };
    return colors[severity] || '#666';
  }
}
