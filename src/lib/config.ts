/**
 * Smart configuration with defaults
 * Only requires JWT_SECRET to be set!
 */

export const config = {
  // Server
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // JWT (ONLY REQUIRED ENV VAR)
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },

  // Database (Auto SQLite)
  database: {
    type: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
    url: process.env.DATABASE_URL || '',
  },

  // Monitoring (Smart Defaults)
  monitoring: {
    scanInterval: parseInt(process.env.SCAN_INTERVAL_MS || '60000', 10),
    anomalyDetection: process.env.ANOMALY_DETECTION_ENABLED !== 'false',
    anomalyThreshold: parseFloat(process.env.ANOMALY_THRESHOLD_SIGMA || '3'),
  },

  // Pattern Analysis (Smart Defaults)
  patterns: {
    analysisInterval: parseInt(process.env.PATTERN_ANALYSIS_INTERVAL || '300000', 10),
    minConfidence: parseFloat(process.env.MIN_PATTERN_CONFIDENCE || '0.7'),
    minOccurrences: parseInt(process.env.MIN_PATTERN_OCCURRENCES || '3', 10),
  },

  // Alerts (Auto-enabled, configure to use)
  alerts: {
    email: {
      enabled: !!process.env.SMTP_USER && !!process.env.SMTP_PASSWORD,
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'panopticon@example.com',
      to: process.env.ALERT_EMAIL_TO || 'admin@example.com',
    },
    telegram: {
      enabled: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID,
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
    },
    slack: {
      enabled: !!process.env.SLACK_WEBHOOK_URL,
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    },
  },

  // Integrations (All optional)
  integrations: {
    atlas: {
      enabled: !!process.env.ATLAS_DB_CONNECTION,
      dbConnection: process.env.ATLAS_DB_CONNECTION || '',
      endpoint: process.env.ATLAS_NOTIFICATION_ENDPOINT || '',
      apiKey: process.env.ATLAS_API_KEY || '',
    },
    notion: {
      enabled: !!process.env.NOTION_API_KEY,
      apiKey: process.env.NOTION_API_KEY || '',
      databaseId: process.env.NOTION_DATABASE_ID || '',
      pageId: process.env.NOTION_PAGE_ID || '',
    },
  },

  // Logging (Smart Defaults)
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/panopticon.log',
  },

  // Features (All enabled by default)
  features: {
    sentimentAnalysis: process.env.ENABLE_SENTIMENT_ANALYSIS !== 'false',
    relationshipMapping: process.env.ENABLE_RELATIONSHIP_MAPPING !== 'false',
    temporalForecasting: process.env.ENABLE_TEMPORAL_FORECASTING !== 'false',
    realtimeUpdates: process.env.ENABLE_REALTIME_UPDATES !== 'false',
    dashboard: process.env.ENABLE_DASHBOARD !== 'false',
  },
};
