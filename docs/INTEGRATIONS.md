# Panopticon Engine Integrations Guide

## Overview

The Panopticon Engine supports multiple integrations for data exchange, notifications, and documentation.

## Available Integrations

### 1. Atlas Integration

Atlas integration enables database-level communication with the Atlas knowledge graph system.

#### Setup

1. **Configure Database Connection**:
```bash
ATLAS_ENABLED=true
ATLAS_DB_CONNECTION=postgresql://atlas:password@localhost:5432/atlas_db
ATLAS_NOTIFICATION_ENDPOINT=http://localhost:4000/api/notifications
ATLAS_API_KEY=your-atlas-api-key
```

2. **Create Atlas Messages Table** (in Atlas database):
```sql
CREATE TABLE atlas_messages (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  source VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_atlas_messages_processed ON atlas_messages(processed);
```

#### Usage

**Send Notification to Atlas**:
```typescript
import { AtlasMessenger } from './src/integrations/atlas/AtlasMessenger';
import { AtlasNotificationService } from './src/integrations/atlas/AtlasNotificationService';

const messenger = new AtlasMessenger();
await messenger.initialize();

const notificationService = new AtlasNotificationService(messenger);

await notificationService.notifyImportantFinding({
  title: 'Critical Anomaly Detected',
  description: 'Unusual spike in error rates',
  severity: 'critical',
  data: { error_rate: 25.5, threshold: 5.0 },
});
```

**Receive Messages from Atlas**:
```typescript
import { AtlasMessageHandler } from './src/integrations/atlas/AtlasMessageHandler';

const handler = new AtlasMessageHandler(messenger);
await handler.startProcessing(30000); // Process every 30 seconds
```

#### Features

- ✅ Database-level messaging
- ✅ Bidirectional communication
- ✅ Priority-based message queuing
- ✅ Automatic message processing
- ✅ HTTP fallback for notifications
- ✅ Query/Response pattern support

---

### 2. Notion Integration

Notion integration enables automated documentation and report generation.

#### Setup

1. **Create Notion Integration**:
   - Go to https://www.notion.so/my-integrations
   - Create new integration
   - Copy the Internal Integration Token

2. **Share Pages with Integration**:
   - Open your Notion page
   - Click "Share" → "Invite"
   - Add your integration

3. **Configure Environment**:
```bash
NOTION_ENABLED=true
NOTION_API_KEY=secret_your_integration_key
NOTION_DATABASE_ID=your-database-id
NOTION_PAGE_ID=your-parent-page-id
```

#### Usage

**Create Report**:
```typescript
import { NotionClient } from './src/integrations/notion/NotionClient';

const notion = new NotionClient();

const pageId = await notion.createPage(
  notion.getPageId(),
  'Anomaly Report - 2026-03-05',
  [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Summary' } }],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { type: 'text', text: { content: 'Detected 5 anomalies today.' } },
        ],
      },
    },
  ]
);
```

**Add to Database**:
```typescript
await notion.createDatabaseEntry({
  Name: { title: [{ text: { content: 'Anomaly Report' } }] },
  Date: { date: { start: '2026-03-05' } },
  Status: { select: { name: 'Complete' } },
  Severity: { select: { name: 'High' } },
});
```

#### Features

- ✅ Automated report generation
- ✅ Database entry creation
- ✅ Page content updates
- ✅ Template-based formatting
- ✅ Rich text support
- ✅ Embedded media support

---

### 3. Email Notifications

#### Setup

**Gmail Configuration**:
```bash
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=panopticon@example.com
ALERT_EMAIL_TO=admin@example.com
```

**Generate Gmail App Password**:
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate
4. Use the 16-character password

#### Usage

```typescript
import { EmailNotificationService } from './src/alerts/EmailNotificationService';

const emailService = new EmailNotificationService();
await emailService.sendAlertEmail(alert);
```

---

### 4. Telegram Bot

#### Setup

1. **Create Bot**:
   - Message @BotFather on Telegram
   - Send `/newbot`
   - Follow instructions
   - Copy the bot token

2. **Get Chat ID**:
   - Message your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Copy the chat ID from the response

3. **Configure**:
```bash
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

#### Usage

```typescript
import { TelegramNotificationService } from './src/alerts/TelegramNotificationService';

const telegram = new TelegramNotificationService();
await telegram.sendAlert(alert);
await telegram.sendMessage('Custom notification');
```

---

### 5. Slack Webhooks

#### Setup

1. Create incoming webhook:
   - Go to https://api.slack.com/apps
   - Create new app
   - Activate Incoming Webhooks
   - Create webhook URL

2. Configure:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Usage

Slack notifications are automatically sent through the AlertDispatcher.

---

## Multi-Channel Alert Dispatching

### Setup

```typescript
import { AlertDispatcher } from './src/alerts/AlertDispatcher';

const dispatcher = new AlertDispatcher();

// Send to all configured channels
await dispatcher.dispatch(alert, ['all']);

// Send to specific channels
await dispatcher.dispatch(alert, ['email', 'telegram']);
```

### Alert Aggregation

```typescript
import { AlertAggregator } from './src/alerts/AlertAggregator';

const aggregator = new AlertAggregator();
aggregator.setAggregationWindow(5 * 60 * 1000); // 5 minutes

// Add alerts
aggregator.addAlert(alert1);
aggregator.addAlert(alert2);

// Get aggregated alerts to send
const alertsToSend = aggregator.getAlertsToSend();
```

### Priority Filtering

```typescript
import { AlertPriorityFilter } from './src/alerts/AlertPriorityFilter';

const filter = new AlertPriorityFilter('high'); // Only high and critical

const shouldSend = filter.shouldProcess(alert);
const filteredAlerts = filter.filter(allAlerts);
const sortedAlerts = filter.sortByPriority(allAlerts);
```

## Testing Integrations

### Test Atlas Connection

```bash
curl -X POST http://localhost:3001/api/integrations/atlas/test
```

### Test Email

```bash
curl -X POST http://localhost:3001/api/integrations/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "message": "Test message"}'
```

### Test Telegram

```bash
curl -X POST http://localhost:3001/api/integrations/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'
```

## Troubleshooting

### Atlas Connection Issues

```bash
# Test PostgreSQL connection
psql $ATLAS_DB_CONNECTION

# Check table exists
\dt atlas_messages

# View recent messages
SELECT * FROM atlas_messages ORDER BY created_at DESC LIMIT 10;
```

### Email Issues

- Enable "Less secure app access" for Gmail (if using Gmail)
- Use App Passwords for Gmail with 2FA
- Check SMTP credentials
- Verify port and security settings

### Telegram Issues

- Ensure bot token is correct
- Message the bot first to activate chat
- Verify chat ID is correct
- Check bot has permission to send messages

### Notion Issues

- Verify integration has access to pages
- Check API key is correct
- Ensure database/page IDs are valid
- Review Notion integration permissions

## Best Practices

1. **Rate Limiting**: Implement rate limiting for external APIs
2. **Error Handling**: Always handle integration failures gracefully
3. **Retry Logic**: Implement exponential backoff for failed requests
4. **Monitoring**: Monitor integration health and success rates
5. **Testing**: Regularly test integrations in staging environment
6. **Security**: Store credentials in secure environment variables
7. **Logging**: Log all integration attempts for debugging

## Security Considerations

- Never commit API keys or tokens
- Use environment variables for all credentials
- Implement API key rotation
- Monitor for unauthorized access
- Use HTTPS for all external communications
- Validate all incoming webhook data
- Implement request signing where possible
