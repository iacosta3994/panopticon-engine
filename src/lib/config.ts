/**
 * Configuration with smart defaults
 * Uses lowercase environment variables for consistency
 */

export const config = {
  // Server
  server: {
    port: parseInt(process.env.port || '3001', 10),
    nodeEnv: process.env.node_env || 'development',
  },

  // Supabase (REQUIRED)
  supabase: {
    url: process.env.supabase_url || '',
    anonKey: process.env.supabase_anon_key || '',
    serviceKey: process.env.supabase_service_key || '',
  },

  // JWT (REQUIRED)
  jwt: {
    secret: process.env.jwt_secret || 'dev-secret-CHANGE-IN-PRODUCTION',
    expiresIn: process.env.jwt_expiration || '24h',
  },

  // Monitoring (Smart Defaults)
  monitoring: {
    scanInterval: parseInt(process.env.scan_interval_ms || '60000', 10),
    anomalyDetection: process.env.anomaly_detection_enabled !== 'false',
    anomalyThreshold: parseFloat(process.env.anomaly_threshold_sigma || '3'),
  },

  // Pattern Analysis (Smart Defaults)
  patterns: {
    analysisInterval: parseInt(process.env.pattern_analysis_interval || '300000', 10),
    minConfidence: parseFloat(process.env.min_pattern_confidence || '0.7'),
    minOccurrences: parseInt(process.env.min_pattern_occurrences || '3', 10),
  },

  // Rate Limiting (Smart Defaults)
  rateLimit: {
    windowMs: parseInt(process.env.rate_limit_window_ms || '900000', 10),
    maxRequests: parseInt(process.env.rate_limit_max_requests || '100', 10),
  },

  // Alerts (Auto-enabled when credentials provided)
  alerts: {
    email: {
      enabled: !!process.env.smtp_user && !!process.env.smtp_password,
      host: process.env.smtp_host || 'smtp.gmail.com',
      port: parseInt(process.env.smtp_port || '587', 10),
      secure: process.env.smtp_secure === 'true',
      user: process.env.smtp_user || '',
      password: process.env.smtp_password || '',
      from: process.env.email_from || 'panopticon@example.com',
      to: process.env.alert_email_to || 'admin@example.com',
    },
    telegram: {
      enabled: !!process.env.telegram_bot_token && !!process.env.telegram_chat_id,
      botToken: process.env.telegram_bot_token || '',
      chatId: process.env.telegram_chat_id || '',
    },
    slack: {
      enabled: !!process.env.slack_webhook_url,
      webhookUrl: process.env.slack_webhook_url || '',
    },
  },

  // Integrations (All optional)
  integrations: {
    atlas: {
      enabled: !!process.env.atlas_db_connection,
      dbConnection: process.env.atlas_db_connection || '',
      endpoint: process.env.atlas_notification_endpoint || '',
      apiKey: process.env.atlas_api_key || '',
    },
    notion: {
      enabled: !!process.env.notion_api_key,
      apiKey: process.env.notion_api_key || '',
      databaseId: process.env.notion_database_id || '',
      pageId: process.env.notion_page_id || '',
    },
  },

  // Logging (Smart Defaults)
  logging: {
    level: process.env.log_level || 'info',
    filePath: process.env.log_file_path || './logs/panopticon.log',
  },

  // WebSocket (Smart Defaults)
  websocket: {
    enabled: process.env.websocket_enabled !== 'false',
    port: parseInt(process.env.websocket_port || '3002', 10),
  },

  // Features (All enabled by default)
  features: {
    sentimentAnalysis: process.env.enable_sentiment_analysis !== 'false',
    relationshipMapping: process.env.enable_relationship_mapping !== 'false',
    temporalForecasting: process.env.enable_temporal_forecasting !== 'false',
    realtimeUpdates: process.env.enable_realtime_updates !== 'false',
    dashboard: process.env.enable_dashboard !== 'false',
  },

  // Cleanup (Smart Defaults)
  cleanup: {
    retentionDays: parseInt(process.env.retention_days || '90', 10),
    cleanupInterval: parseInt(process.env.cleanup_interval || '86400000', 10),
  },
};
