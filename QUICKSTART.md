# Panopticon Engine - Quick Start

## 🚀 Deploy in 5 Minutes

### What You Need
- GitHub account (free)
- Vercel account (free)
- Supabase account (free)

### Step 1: Create Supabase Database (2 min)

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Name it **panopticon-engine**
4. Choose a password and region
5. Wait ~2 minutes for setup

**Run Migration**:
1. Click **"SQL Editor"** in sidebar
2. Click **"New Query"**
3. Copy content from `migrations/20260305_add_panopticon_engine_tables.sql`
4. Paste and click **"Run"**
5. See "Success" ✅

**Get Credentials**:
1. Go to **Settings** → **API**
2. Copy **URL** (like: `https://abc123.supabase.co`)
3. Copy **service_role** key (under "Project API keys")

---

### Step 2: Fork This Repository (30 sec)

1. Click **Fork** button at top of this page
2. Wait for fork to complete

---

### Step 3: Deploy to Vercel (2 min)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Select **`panopticon-engine`** from your repos
5. Click **"Import"**

---

### Step 4: Add Environment Variables (1 min)

In Vercel configuration, add **3 variables**:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
JWT_SECRET=generate-random-32-char-string
```

**Generate JWT_SECRET**:
```bash
openssl rand -base64 32
```
Or use any random string like: `my-secret-key-change-this-12345678`

---

### Step 5: Deploy & Access (30 sec)

1. Click **"Deploy"**
2. Wait ~2 minutes
3. Visit: `https://your-app.vercel.app/dashboard`

**You're done!** ✅

---

## 🎯 What Works Now

- ✅ Full dashboard with real-time charts
- ✅ Anomaly detection (3 methods)
- ✅ Pattern recognition
- ✅ Temporal forecasting
- ✅ Alert management
- ✅ WebSocket real-time updates
- ✅ API endpoints (20+)
- ✅ Background jobs

---

## 🔑 Optional: Add Alerts

### Email Alerts

Add to Vercel:
```
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

### Telegram Alerts
```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

**Get bot**: Message [@BotFather](https://t.me/BotFather) → `/newbot`

---

## 🔄 Automatic Updates

**Every time you push to GitHub**:
- ✅ Vercel auto-deploys
- ✅ Live in ~2 minutes
- ✅ Preview for PRs
- ✅ One-click rollback

---

## 📖 More Info

- [Full README](README.md)
- [API Docs](docs/API.md)
- [Dashboard Guide](docs/DASHBOARD.md)
- [Integrations](docs/INTEGRATIONS.md)

---

**Questions?** [Open an issue](https://github.com/iacosta3994/panopticon-engine/issues)
