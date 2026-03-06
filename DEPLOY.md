# Deploy Panopticon Engine in 2 Minutes

## 🚀 Automatic Deployment (Recommended)

### What You Need
- GitHub account
- Vercel account (free)
- 2 minutes of time

### What You Don't Need
- ❌ External database
- ❌ Complex configuration
- ❌ Multiple environment variables
- ❌ Docker knowledge
- ❌ DevOps expertise

---

## 📝 Step-by-Step Deployment

### Step 1: Fork the Repository (30 seconds)

1. Go to https://github.com/iacosta3994/panopticon-engine
2. Click **Fork** button (top right)
3. Wait for fork to complete

**Why fork?**
- Gets automatic updates when main repo updates
- Lets you customize if needed
- Enables automatic Vercel deployments

---

### Step 2: Deploy to Vercel (1 minute)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Find and click **"Import"** next to `panopticon-engine`
5. Vercel will detect it's a Next.js app automatically

---

### Step 3: Add Environment Variable (30 seconds)

In the "Configure Project" screen, add **ONE** environment variable:

**Name**: `JWT_SECRET`  
**Value**: Any random string (or generate with `openssl rand -base64 32`)

**Examples of valid JWT secrets**:
- `my-super-secret-key-12345678`
- `JKHSd89723hkjdHKJHS89d7h2kj`
- Any random 20+ character string

**That's the ONLY required variable!**

---

### Step 4: Deploy (30 seconds)

1. Click **"Deploy"**
2. Wait ~2 minutes while Vercel builds
3. Click the deployment URL when ready

---

### Step 5: Access Your Dashboard ✅

Visit: `https://your-app-name.vercel.app/dashboard`

You should see:
- ✅ Live dashboard with charts
- ✅ Sample data already loaded
- ✅ All features working
- ✅ Real-time updates active

**Done!** 🎉

---

## 🔄 Automatic Updates

From now on, **every time you push to your GitHub repo**:
- ✅ Vercel automatically deploys
- ✅ New version goes live in ~2 minutes
- ✅ Preview deployments for pull requests
- ✅ One-click rollback if needed

**No manual deployment ever needed again!**

---

## 🎯 What Works Out of the Box

### Without ANY Configuration

- ✅ **Full dashboard** with real-time charts
- ✅ **Anomaly detection** (3 statistical methods)
- ✅ **Pattern recognition**
- ✅ **Temporal forecasting**
- ✅ **Alert management**
- ✅ **WebSocket real-time updates**
- ✅ **API endpoints** (20+)
- ✅ **Sample data** for testing

### Database

- ✅ **SQLite embedded** - No external database needed
- ✅ **Auto-created** on first start
- ✅ **Migrations automatic**
- ✅ **Sample data seeded**
- ✅ **Fully functional**

**Upgrade to PostgreSQL later if needed** (just add DATABASE_URL env var)

---

## 🎨 Optional: Add Integrations

Want email/Telegram alerts? Just add more env vars in Vercel:

### Email Alerts

```
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

### Telegram Bot

```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

**That's it!** No restart needed - they activate automatically.

---

## 🏁 Local Development (Optional)

Want to run locally? It's just as easy:

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/panopticon-engine.git
cd panopticon-engine

# Install and auto-setup
npm install
# (Auto-setup runs, creates .env, database, sample data)

# Start
npm run dev

# Access at http://localhost:3000/dashboard
```

**Everything auto-configures!**

---

## 📊 What's Included

| Feature | Status | Configuration Needed |
|---------|--------|---------------------|
| Dashboard | ✅ Working | None |
| Anomaly Detection | ✅ Working | None |
| Pattern Recognition | ✅ Working | None |
| Real-Time Updates | ✅ Working | None |
| API Endpoints | ✅ Working | None |
| WebSocket | ✅ Working | None |
| Database (SQLite) | ✅ Working | None |
| Email Alerts | ⚪ Optional | SMTP credentials |
| Telegram Alerts | ⚪ Optional | Bot token |
| Slack Alerts | ⚪ Optional | Webhook URL |

---

## 🎓 Quick Usage

### Ingest Data via API

```bash
curl -X POST https://your-app.vercel.app/api/ingest/observation \
  -H "Content-Type: application/json" \
  -d '{"observation_type": "test", "payload": {"value": 100}}'
```

### View in Dashboard

Go to: `https://your-app.vercel.app/dashboard`

- See your data in real-time charts
- Anomaly detection runs automatically
- Patterns detected automatically
- Alerts trigger if configured

---

## 🔧 Advanced: Upgrade Database (Optional)

Want to use PostgreSQL instead of SQLite?

Just add ONE more environment variable in Vercel:

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

System automatically switches to PostgreSQL and runs migrations!

---

## 🛠️ Tech Stack

- Next.js 14 (Frontend)
- Express (Backend API)
- SQLite (Embedded database)
- Socket.io (Real-time)
- Recharts (Visualizations)
- Tailwind CSS (Styling)

---

## 📖 Documentation

- [Complete System Overview](COMPLETE_SYSTEM_OVERVIEW.md)
- [API Reference](docs/API.md)
- [Dashboard Guide](docs/DASHBOARD.md)
- [Integrations](docs/INTEGRATIONS.md)

---

## 🆚 Comparison

**Before** (Complex deployment):
```
❌ Set up PostgreSQL/Supabase
❌ Configure 10+ environment variables
❌ Run migrations manually
❌ Set up external services
❌ 30+ minutes of configuration
```

**Now** (Simple deployment):
```
✅ Fork repo
✅ Deploy on Vercel
✅ Add 1 env var (or use default)
✅ 2 minutes total
✅ Everything works immediately
```

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/iacosta3994/panopticon-engine/issues)
- **Docs**: `/docs` directory

---

## 📄 License

MIT License

---

**Panopticon Engine** - *The easiest way to monitor and analyze data.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fpanopticon-engine)

Built with ❤️ by [Ian Acosta](https://github.com/iacosta3994)
