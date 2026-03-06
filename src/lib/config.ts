import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Monitoring Configuration
  monitoring: {
    scanIntervalMs: parseInt(process.env.SCAN_INTERVAL_MS || '60000', 10),
    anomalyDetectionEnabled: process.env.ANOMALY_DETECTION_ENABLED === 'true',
    anomalyThresholdSigma: parseFloat(process.env.ANOMALY_THRESHOLD_SIGMA || '3'),
  },

  // Pattern Analysis
  patternAnalysis: {
    intervalMs: parseInt(process.env.PATTERN_ANALYSIS_INTERVAL || '300000', 10),
    minConfidence: parseFloat(process.env.MIN_PATTERN_CONFIDENCE || '0.7'),
    minOccurrences: parseInt(process.env.MIN_PATTERN_OCCURRENCES || '3', 10),
  },

  // Notification Configuration
  notification: {
    enabled: process.env.NOTIFICATION_ENABLED === 'true',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    emailServiceApiKey: process.env.EMAIL_SERVICE_API_KEY || '',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/panopticon.log',
  },

  // Cleanup Configuration
  cleanup: {
    retentionDays: parseInt(process.env.RETENTION_DAYS || '90', 10),
    intervalMs: parseInt(process.env.CLEANUP_INTERVAL || '86400000', 10),
  },

  // Feature Flags
  features: {
    sentimentAnalysis: process.env.ENABLE_SENTIMENT_ANALYSIS === 'true',
    relationshipMapping: process.env.ENABLE_RELATIONSHIP_MAPPING === 'true',
    temporalForecasting: process.env.ENABLE_TEMPORAL_FORECASTING === 'true',
  },
};

export default config;
