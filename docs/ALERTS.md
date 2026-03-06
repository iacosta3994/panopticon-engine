# Alert System Configuration Guide

## Overview

The Panopticon Engine Alert System provides multi-channel notifications, intelligent filtering, and alert aggregation.

## Architecture

```
Alert Generation
    ↓
Alert Priority Filter
    ↓
Alert Aggregator
    ↓
Alert Dispatcher
    ├── Email
    ├── Telegram
    ├── Slack
    └── Webhooks
```

## Components

### 1. Alert Dispatcher

**Purpose**: Route alerts to configured notification channels

**Supported Channels**:
- ✅ Email (SMTP/Nodemailer)
- ✅ Telegram Bot
- ✅ Slack Webhooks
- ✅ Custom Webhooks

**Usage**:
```typescript
import { AlertDispatcher } from '@/src/alerts/AlertDispatcher';

const dispatcher = new AlertDispatcher();

// Dispatch to all channels
await dispatcher.dispatch(alert, ['all']);

// Dispatch to specific channels
await dispatcher.dispatch(alert, ['email', 'telegram']);
```

### 2. Email Notification Service

**Configuration**:
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

**Features**:
- HTML email templates
- Severity-based color coding
- Mobile-responsive design
- Inline CSS for compatibility

**Gmail Setup**:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password in `SMTP_PASSWORD`

### 3. Telegram Notification Service

**Configuration**:
```bash
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789
```

**Bot Setup**:
1. Message @BotFather
2. Send `/newbot`
3. Follow instructions
4. Copy bot token

**Get Chat ID**:
```bash
# Message your bot first, then:
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

**Features**:
- Markdown formatting
- Emoji-based severity indicators
- Instant delivery
- Chat thread support

### 4. Alert Priority Filter

**Purpose**: Filter alerts based on severity threshold

**Configuration**:
```typescript
import { AlertPriorityFilter } from '@/src/alerts/AlertPriorityFilter';

const filter = new AlertPriorityFilter('high');
// Only processes 'high' and 'critical' alerts

const shouldProcess = filter.shouldProcess(alert);
const filtered = filter.filter(allAlerts);
const sorted = filter.sortByPriority(allAlerts);
```

**Severity Levels** (ascending):
1. `info`
2. `low`
3. `medium`
4. `high`
5. `critical`

### 5. Alert Aggregator

**Purpose**: Prevent alert fatigue by aggregating similar alerts

**Configuration**:
```typescript
import { AlertAggregator } from '@/src/alerts/AlertAggregator';

const aggregator = new AlertAggregator();
aggregator.setAggregationWindow(5 * 60 * 1000); // 5 minutes
```

**Aggregation Logic**:
- Groups alerts by type and severity
- Triggers after time window OR count threshold
- Creates single aggregated alert
- Includes occurrence count

**Example**:
```typescript
// Add alerts
aggregator.addAlert(alert1);
aggregator.addAlert(alert2);
aggregator.addAlert(alert3);

// Get aggregated alerts to send
const alertsToSend = aggregator.getAlertsToSend();
// Returns: ["High Error Rate (3 occurrences)"]
```

## Alert Templates

### Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Severity-based coloring */
    .critical { background: #d32f2f; }
    .high { background: #f57c00; }
    .medium { background: #fbc02d; }
    .low { background: #388e3c; }
  </style>
</head>
<body>
  <div class="header critical">
    <h1>Alert Title</h1>
  </div>
  <div class="content">
    <p>Alert details...</p>
  </div>
</body>
</html>
```

### Telegram Template

```markdown
🔴 **Critical Alert**

*Severity:* CRITICAL
*Type:* threshold
*Triggered:* 2026-03-05 23:15:00

High error rate detected on production API

_Alert ID: 550e8400-e29b-41d4-a716-446655440000_
```

### Slack Template

```json
{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "Alert Title" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Severity:*\nCritical" },
        { "type": "mrkdwn", "text": "*Status:*\nOpen" }
      ]
    }
  ]
}
```

## Alert Workflow

### 1. Alert Creation

```typescript
// Monitoring rule triggers alert
const alert = {
  id: generateId(),
  rule_id: rule.id,
  alert_type: 'threshold',
  severity: 'high',
  title: 'High Error Rate Detected',
  message: 'Error rate exceeded 5% threshold',
  status: 'open',
  triggered_at: new Date(),
};
```

### 2. Filtering

```typescript
// Apply priority filter
if (!priorityFilter.shouldProcess(alert)) {
  return; // Skip low-priority alerts
}
```

### 3. Aggregation

```typescript
// Add to aggregator
aggregator.addAlert(alert);

// Check if ready to send
const alertsToSend = aggregator.getAlertsToSend();
```

### 4. Dispatching

```typescript
// Dispatch to channels
for (const alert of alertsToSend) {
  await dispatcher.dispatch(alert, ['email', 'telegram', 'slack']);
}
```

### 5. Acknowledgment

```typescript
// User acknowledges alert
await updateAlert(alert.id, {
  status: 'acknowledged',
  acknowledged_by: 'user@example.com',
  acknowledged_at: new Date(),
});
```

### 6. Resolution

```typescript
// User resolves alert
await updateAlert(alert.id, {
  status: 'resolved',
  resolved_by: 'user@example.com',
  resolved_at: new Date(),
  resolution_notes: 'Fixed database connection pool',
});
```

## Configuration Examples

### High-Severity Only

```typescript
const filter = new AlertPriorityFilter('high');
const dispatcher = new AlertDispatcher();

if (filter.shouldProcess(alert)) {
  await dispatcher.dispatch(alert, ['email', 'telegram']);
}
```

### Business Hours Only

```typescript
function isBusinessHours(): boolean {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 17;
}

if (isBusinessHours() || alert.severity === 'critical') {
  await dispatcher.dispatch(alert, ['all']);
}
```

### Escalation Rules

```typescript
const escalationRules = {
  critical: ['email', 'telegram', 'slack'], // All channels
  high: ['email', 'telegram'],              // Email + Telegram
  medium: ['slack'],                        // Slack only
  low: [],                                  // No notifications
};

const channels = escalationRules[alert.severity];
await dispatcher.dispatch(alert, channels);
```

## Monitoring Alert Performance

### Alert Metrics

```sql
-- Alert response time
SELECT 
  severity,
  AVG(EXTRACT(EPOCH FROM (acknowledged_at - triggered_at))) as avg_ack_time,
  AVG(EXTRACT(EPOCH FROM (resolved_at - triggered_at))) as avg_resolution_time
FROM alerts
WHERE triggered_at > NOW() - INTERVAL '7 days'
GROUP BY severity;
```

### False Positive Rate

```sql
-- Calculate false positive rate by rule
SELECT 
  mr.name,
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE a.status = 'false_positive') as false_positives,
  ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'false_positive') / COUNT(*), 2) as fp_rate
FROM alerts a
JOIN monitoring_rules mr ON a.rule_id = mr.id
GROUP BY mr.name
ORDER BY fp_rate DESC;
```

## Best Practices

1. **Set Appropriate Severity**: Calibrate severity levels
2. **Use Aggregation**: Prevent alert fatigue
3. **Configure Channels**: Right channel for right severity
4. **Monitor Performance**: Track response times
5. **Review Rules**: Regularly review and adjust
6. **Test Notifications**: Test all channels regularly
7. **Document Procedures**: Clear escalation procedures
8. **Audit Trail**: Review alert history

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials
2. Verify port is not blocked
3. Test with telnet: `telnet smtp.gmail.com 587`
4. Check spam folder
5. Review email service logs

### Telegram Not Working

1. Verify bot token
2. Ensure you've messaged the bot
3. Check chat ID is correct
4. Test with curl:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Test"
   ```

### Slack Not Receiving

1. Verify webhook URL
2. Check webhook is not disabled
3. Test with curl:
   ```bash
   curl -X POST <WEBHOOK_URL> -H 'Content-Type: application/json' -d '{"text":"Test"}'
   ```
