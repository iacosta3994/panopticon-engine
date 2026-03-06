# Panopticon Engine - Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- GitHub account (free)
- Supabase account (free) - [supabase.com](https://supabase.com)
- Vercel account (free) - [vercel.com](https://vercel.com)

---

## 📝 Step-by-Step

### Step 1: Set Up Supabase (2 minutes)

#### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: panopticon-engine
   - **Database Password**: (choose a strong password)
   - **Region**: (closest to you)
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning ⏳

#### 1.2 Run Migration
1. In your Supabase project, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Go to this repo → `migrations/20260305_add_panopticon_engine_tables.sql`
4. Copy the entire file contents
5. Paste into Supabase SQL editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Wait for "Success. No rows returned" message ✅

#### 1.3 Get Credentials
1. In Supabase, go to **Settings** → **API** (left sidebar)
2. Find "Project API keys" section
3. Copy these THREE values:
   - **URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJhbGc...`)
   - **service_role** key (starts with `eyJhbGc...`) ⚠️ Secret!

---

### Step 2: Deploy to Vercel (3 minutes)

#### 2.1 Fork Repository
1. Go to [github.com/iacosta3994/panopticon-engine](https://github.com/iacosta3994/panopticon-engine)
2. Click **Fork** button (top right)
3. Wait for fork to complete

#### 2.2 Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Find **panopticon-engine** in your repos
5. Click **"Import"**

#### 2.3 Configure Environment Variables

In the "Configure Project" screen, add these **4 variables**:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
JWT_SECRET=your-random-secret
```

**For JWT_SECRET**, generate with:
```bash
openssl rand -base64 32
```
Or just use any random string (20+ characters)

#### 2.4 Deploy

1. Click **"Deploy"**
2. Wait ~2 minutes for build ⏳
3. Click the deployment URL when ready

---

### Step 3: Access Your Dashboard ✅

Visit: `https://your-app-name.vercel.app/dashboard`

You should see:
- ✅ Live dashboard with charts
- ✅ Real-time metrics
- ✅ All features working
- ✅ WebSocket connected

**🎉 Deployment complete!**

---

## 🔄 Automatic Updates

From now on:
- Push to GitHub → Vercel auto-deploys
- Pull requests → Preview deployments
- Always up-to-date automatically!

---

## 🎨 Optional: Add Integrations

Want extra features? Add more environment variables in Vercel:

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

### Slack Webhooks
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**No restart needed** - they activate automatically!

---

## 🎓 Usage Example

### Ingest Data

```bash
curl -X POST https://your-app.vercel.app/api/ingest/observation \
  -H "Content-Type: application/json" \
  -d '{
    "observation_type": "api_error",
    "severity": "high",
    "payload": {"error_code": 500}
  }'
```

### View in Dashboard

Go to your dashboard URL and see:
- Real-time chart updates
- Anomaly detection running
- Pattern recognition active
- Alerts if configured

---

## 🔧 Troubleshooting

### Can't connect to Supabase?
- Verify SUPABASE_URL is correct (no trailing slash)
- Check SERVICE_KEY is the service_role key (not anon key)
- Ensure migration ran successfully

### Dashboard showing errors?
- Check Vercel logs: Deployments → Click deployment → Function logs
- Verify all 4 environment variables are set
- Check Supabase project is active

### Need help?
- [Open an issue](https://github.com/iacosta3994/panopticon-engine/issues)
- Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📖 Next Steps

- [API Reference](docs/API.md) - Learn the API
- [Dashboard Guide](docs/DASHBOARD.md) - Explore features
- [Integrations](docs/INTEGRATIONS.md) - Add more integrations

---

**Questions?** Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) or [open an issue](https://github.com/iacosta3994/panopticon-engine/issues)
