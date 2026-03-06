# Panopticon Engine Troubleshooting Guide

## Common Issues and Solutions

### Database Connection Issues

#### Issue: "Database pool not initialized"

**Symptoms**:
- API returns 503 errors
- Logs show "Database not configured"

**Solutions**:

1. **Check environment variables**:
```bash
echo $DATABASE_URL
# Should output: postgresql://user:password@host:5432/panopticon_engine
```

2. **Test database connection**:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

3. **Verify database exists**:
```bash
psql -l | grep panopticon
```

4. **Check logs for detailed error**:
```bash
tail -f logs/panopticon-error.log | grep "Database"
```

---

#### Issue: "Schema validation failed"

**Symptoms**:
- Server fails to start
- Logs show "Missing tables" or "Schema validation failed"

**Solutions**:

1. **Run migrations**:
```bash
psql panopticon_engine -f migrations/20260305_add_panopticon_engine_tables.sql
```

2. **Check tables exist**:
```bash
psql panopticon_engine -c "\dt"
```

3. **Validate schema manually**:
```bash
psql panopticon_engine -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
"
```

4. **Check for schema auto-fix in logs**:
```bash
grep "auto-fix" logs/panopticon.log
```

---

### WebSocket Connection Issues

#### Issue: Dashboard shows "Disconnected"

**Symptoms**:
- Real-time updates not working
- Red disconnected indicator
- No live data in dashboard

**Solutions**:

1. **Check WebSocket server is running**:
```bash
ps aux | grep "WebSocketServer"
# OR for PM2
pm2 list | grep websocket
```

2. **Verify WebSocket port**:
```bash
netstat -tulpn | grep :3002
# OR
lsof -i :3002
```

3. **Test WebSocket connection**:
```bash
wscat -c ws://localhost:3002
```

4. **Check frontend environment**:
```bash
echo $NEXT_PUBLIC_WS_URL
# Should be: http://localhost:3002 (dev) or your production URL
```

5. **Check browser console**:
- Open DevTools → Console
- Look for WebSocket errors
- Verify CORS is not blocking connection

---

### API Issues

#### Issue: "429 Too Many Requests"

**Symptoms**:
- API returns 429 status code
- "Too many requests" error message

**Solutions**:

1. **Increase rate limit** (in `.env`):
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000  # Increase this
```

2. **Check IP address**:
```bash
curl -i http://localhost:3001/health
# Check X-RateLimit headers
```

3. **Clear rate limit cache** (restart server):
```bash
pm2 restart panopticon-api
```

---

#### Issue: "401 Unauthorized"

**Symptoms**:
- API returns 401 for protected endpoints
- "No token provided" or "Invalid token"

**Solutions**:

1. **Generate JWT token** (for testing):
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: 'test', email: 'test@example.com', role: 'admin' },
  process.env.JWT_SECRET || 'your-secret',
  { expiresIn: '24h' }
);
console.log(token);
```

2. **Include token in requests**:
```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Check JWT secret matches**:
```bash
echo $JWT_SECRET
```

---

### Background Jobs Issues

#### Issue: Jobs not running

**Symptoms**:
- No pattern analysis happening
- Observations not being processed
- Alerts not being sent

**Solutions**:

1. **Check job scheduler is running**:
```bash
pm2 list | grep jobs
# OR
ps aux | grep JobScheduler
```

2. **Check job logs**:
```bash
tail -f logs/jobs-out.log
tail -f logs/jobs-error.log
```

3. **Verify cron schedule**:
- Check `src/jobs/JobScheduler.ts` for schedules
- Ensure node-cron is installed

4. **Test job manually**:
```typescript
import { ScanningJob } from './src/jobs/ScanningJob';
const job = new ScanningJob();
await job.execute();
```

---

### Integration Issues

#### Issue: Atlas integration not working

**Solutions**:

1. **Test Atlas database connection**:
```bash
psql $ATLAS_DB_CONNECTION -c "SELECT 1"
```

2. **Check atlas_messages table exists**:
```bash
psql $ATLAS_DB_CONNECTION -c "\d atlas_messages"
```

3. **Create table if missing**:
```sql
CREATE TABLE atlas_messages (
  id UUID PRIMARY KEY,
  type VARCHAR(50),
  priority VARCHAR(20),
  source VARCHAR(100),
  payload JSONB,
  metadata JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### Issue: Email notifications not sending

**Solutions**:

1. **Test SMTP connection**:
```bash
telnet smtp.gmail.com 587
```

2. **Verify credentials**:
- For Gmail: Use App Password, not regular password
- Enable "Less secure app access" if not using 2FA

3. **Check email service status**:
```bash
grep "Email" logs/panopticon.log
```

4. **Test with Nodemailer directly**:
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

await transporter.sendMail({
  from: 'test@example.com',
  to: 'admin@example.com',
  subject: 'Test',
  text: 'Test email',
});
```

---

#### Issue: Telegram bot not responding

**Solutions**:

1. **Verify bot token**:
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

2. **Get chat ID**:
```bash
# Send message to your bot, then:
curl https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
```

3. **Test bot manually**:
```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
await bot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, 'Test');
```

---

### Performance Issues

#### Issue: Slow API responses

**Solutions**:

1. **Check database connection pool**:
```bash
# View pool stats via API
curl http://localhost:3001/api/admin/stats
```

2. **Analyze slow queries**:
```sql
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

3. **Vacuum database**:
```bash
psql panopticon_engine -c "VACUUM ANALYZE;"
```

4. **Check index usage**:
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

5. **Monitor Node.js memory**:
```bash
pm2 monit
```

---

#### Issue: High memory usage

**Solutions**:

1. **Increase Node.js heap**:
```bash
node --max-old-space-size=4096 dist/api/server.js
```

2. **Check for memory leaks**:
```bash
# Install clinic.js
npm install -g clinic

# Profile memory
clinic doctor -- node dist/api/server.js
```

3. **Clear in-memory caches**:
- Anomaly detector cache
- Pattern synthesizer cache
- Threshold manager cache

4. **Restart services**:
```bash
pm2 restart all
```

---

### Dashboard Issues

#### Issue: Charts not rendering

**Solutions**:

1. **Check browser console for errors**
2. **Verify Recharts is installed**:
```bash
npm list recharts
```

3. **Clear Next.js cache**:
```bash
rm -rf .next
npm run build
```

4. **Check data format**:
- Ensure data matches chart requirements
- Verify timestamps are valid

---

#### Issue: Real-time updates not working

**Solutions**:

1. **Check WebSocket connection** (see above)

2. **Verify room subscriptions**:
```javascript
// In browser console
socket.emit('subscribe', 'alerts');
```

3. **Check event listeners**:
```javascript
// In browser console
socket.listeners('alert:new');
```

4. **Monitor WebSocket traffic**:
- Open DevTools → Network → WS tab
- View WebSocket frames

---

## Diagnostic Commands

### System Health Check

```bash
#!/bin/bash
echo "=== Panopticon Engine Health Check ==="

# Check services
echo "\n[Services]"
pm2 list

# Check ports
echo "\n[Ports]"
netstat -tulpn | grep -E ':(3000|3001|3002)'

# Check database
echo "\n[Database]"
psql panopticon_engine -c "SELECT COUNT(*) as observations FROM observations;"

# Check API health
echo "\n[API]"
curl -s http://localhost:3001/health | jq

# Check logs for errors
echo "\n[Recent Errors]"
tail -20 logs/panopticon-error.log
```

### Database Diagnostics

```sql
-- Connection count
SELECT COUNT(*) as connections 
FROM pg_stat_activity 
WHERE datname = 'panopticon_engine';

-- Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- Recent observations
SELECT COUNT(*), MAX(observed_at) as latest
FROM observations
WHERE observed_at > NOW() - INTERVAL '1 hour';

-- Active alerts
SELECT severity, COUNT(*)
FROM alerts
WHERE status = 'open'
GROUP BY severity;
```

## Getting Help

1. **Check Logs**:
   - `logs/panopticon.log` - General logs
   - `logs/panopticon-error.log` - Error logs
   - `logs/api-error.log` - API errors
   - `logs/jobs-error.log` - Background job errors

2. **Enable Debug Mode**:
```bash
LOG_LEVEL=debug npm run server:start
```

3. **Run Diagnostics**:
```bash
curl http://localhost:3001/api/admin/diagnostics
```

4. **GitHub Issues**: 
   - https://github.com/iacosta3994/panopticon-engine/issues
   - Include logs and error messages
   - Specify environment (dev/production)

5. **Check Documentation**:
   - [API Reference](API.md)
   - [Deployment Guide](DEPLOYMENT.md)
   - [Integration Guide](INTEGRATIONS.md)
