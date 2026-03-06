# Panopticon Engine

> An intelligent surveillance and analysis platform with real-time monitoring, anomaly detection, and pattern recognition. Deploy in 2 minutes.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Deploy Now (2 Minutes)

### Step 1: Fork This Repository
Click the **Fork** button at the top of this page

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Select **`panopticon-engine`** from your GitHub repos
4. Add **ONE** environment variable:
   ```
   JWT_SECRET=your-random-secret-here
   ```
   (Generate with: `openssl rand -base64 32`)
5. Click **"Deploy"**

### Step 3: Done! ✅
- Visit your dashboard at `https://your-app.vercel.app/dashboard`
- System auto-creates database and sample data
- Future updates deploy automatically when you push to GitHub

**That's it!** The system is fully self-contained and works out of the box.

---

## ⚡ Why This Is Easy

✅ **No external database required** - Uses embedded SQLite  
✅ **Only 1 environment variable** - JWT_SECRET (can even auto-generate)  
✅ **Auto-creates database** - Migrations run automatically  
✅ **Sample data included** - Works immediately  
✅ **Smart defaults** - Everything pre-configured  
✅ **Automatic updates** - Push to GitHub → Auto-deploys  
✅ **Zero configuration** - Just click deploy  

---

## 🎯 What You Get

A complete surveillance platform with:

- 🔍 **Real-time monitoring** across multiple data sources
- 🧠 **AI-powered anomaly detection** (3 statistical methods)
- 📊 **Interactive dashboard** with cyberpunk theme
- 🔔 **Multi-channel alerts** (Email, Telegram, Slack)
- ⚡ **WebSocket real-time** updates
- 📈 **Pattern recognition** and forecasting
- 🌐 **Knowledge graph** integration
- 📝 **Automated documentation**

All working **immediately** after deployment!

---

## 🔑 Configuration (Optional)

The system works perfectly with **zero configuration**. Add these **only if you want extra features**:

### Email Alerts (Optional)

Add to Vercel environment variables:

```
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

That's it! Email alerts now work.

### Telegram Alerts (Optional)

Add to Vercel environment variables:

```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

[Get bot token from @BotFather](https://t.me/BotFather)

### Slack Alerts (Optional)

```
SLACK_WEBHOOK_URL=your-webhook-url
```

[Create webhook](https://api.slack.com/messaging/webhooks)

**Everything else uses smart defaults!**

---

## 📊 Features

### Core Capabilities (All Included)

✅ **Anomaly Detection** - Z-score, IQR, Moving Average  
✅ **Pattern Recognition** - Sequential, frequency, correlation patterns  
✅ **Temporal Analysis** - Trend detection and forecasting  
✅ **Entity Mapping** - Automatic relationship discovery  
✅ **Sentiment Analysis** - Emotional context detection  
✅ **Real-Time Dashboard** - Live charts and metrics  
✅ **Alert System** - Multi-channel notifications  
✅ **WebSocket Updates** - Real-time data streaming  
✅ **API** - RESTful endpoints for all operations  

### Dashboard Pages

- `/dashboard` - Overview with metrics and charts
- `/dashboard/anomalies` - Anomaly detection view
- `/dashboard/patterns` - Pattern analysis
- `/dashboard/alerts` - Alert management

---

## 🎓 Quick Usage

### Ingest Data

```bash
curl -X POST https://your-app.vercel.app/api/ingest/observation \
  -H "Content-Type: application/json" \
  -d '{
    "observation_type": "api_error",
    "payload": {"error_code": 500}
  }'
```

### View Results

Go to your dashboard: `https://your-app.vercel.app/dashboard`

- See real-time charts
- View detected anomalies
- Check patterns
- Manage alerts

**It's that simple!**

---

## 🏁 Local Development (Optional)

If you want to develop locally:

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/panopticon-engine.git
cd panopticon-engine
npm install

# 2. Auto-setup (creates .env, database, sample data)
npm run setup

# 3. Start development
npm run dev

# Access at http://localhost:3000/dashboard
```

**The setup script automatically**:
- Creates `.env` with random JWT_SECRET
- Creates SQLite database
- Runs migrations
- Seeds sample data

Zero manual configuration needed!

---

## 📖 Documentation

| Document | What's Inside |
|----------|---------------|
| [API Reference](docs/API.md) | All API endpoints with examples |
| [Dashboard Guide](docs/DASHBOARD.md) | How to use the dashboard |
| [Integrations](docs/INTEGRATIONS.md) | Optional integrations setup |
| [Complete Overview](COMPLETE_SYSTEM_OVERVIEW.md) | Full system details |

---

## 🔒 Security

- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ Security headers
- ✅ Audit logging

All enabled by default!

---

## 📈 Performance

- API Response: <200ms
- Anomaly Detection: <50ms
- Dashboard Load: <2s
- Handles 10,000+ observations/minute

---

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind
- **Backend**: Node.js, Express, SQLite
- **Real-time**: Socket.io, WebSocket
- **Charts**: Recharts, D3.js, React Flow
- **Deploy**: Vercel (automatic)

---

## 🤝 Contributing

1. Fork the repository
2. Make changes
3. Push to your fork
4. Vercel auto-deploys your changes!

---

## 📄 License

MIT License

---

## 🌟 Why Panopticon Engine?

**Most surveillance platforms** require:
- ❌ Complex database setup
- ❌ Multiple environment variables
- ❌ Manual migration running
- ❌ Configuration files
- ❌ External service dependencies

**Panopticon Engine** requires:
- ✅ Just fork and deploy
- ✅ ONE environment variable (auto-generated if needed)
- ✅ Everything else is automatic
- ✅ Works immediately
- ✅ Updates automatically

**It just works.** 🎉

---

**Panopticon Engine** - *Deploy in 2 minutes. Monitor everything.*

Built by [Ian Acosta](https://github.com/iacosta3994)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fpanopticon-engine)
