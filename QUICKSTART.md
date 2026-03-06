# Panopticon Engine - Quick Start Guide

## 🚀 Deploy in 10 Minutes

**→ For detailed step-by-step instructions, see [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)**

### Prerequisites
- GitHub account (free)
- Supabase account (free) - [supabase.com](https://supabase.com)
- Vercel account (free) - [vercel.com](https://vercel.com)

---

## 📝 Step-by-Step

### Step 1: Set Up Supabase (5 minutes)

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

#### 2.1 Import Project
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Find **panopticon-engine** in your repos
5. Click **"Import"**

#### 2.2 Configure Environment Variables

Add these **4 variables** (use lowercase names):

```
supabase_url=https://your-project.supabase.co
supabase_anon_key=eyJhbGc...
supabase_service_key=eyJhbGc...
jwt_secret=your-random-secret
```

**For jwt_secret**, generate with:
```bash
openssl rand -base64 32
```
Or just use any random string (32+ characters)

**Important**: Use lowercase variable names as shown above!

#### 2.3 Deploy

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
smtp_user=your-email@gmail.com
smtp_password=your-gmail-app-password
smtp_host=smtp.gmail.com
email_from=panopticon@example.com
```

### Telegram Bot
```
telegram_bot_token=your-bot-token
telegram_chat_id=your-chat-id
```

### Slack Webhooks
```
slack_webhook_url=https://hooks.slack.com/services/...
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
- Verify `supabase_url` is correct (no trailing slash)
- Check `supabase_service_key` is the service_role key (not anon key)
- Ensure migration ran successfully
- Variable names must be **lowercase**

### Dashboard showing errors?
- Check Vercel logs: Deployments → Click deployment → Function logs
- Verify all 4 environment variables are set
- Ensure variable names are lowercase
- Check Supabase project is active

### Need to change variables?
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update values
3. Go to Deployments → ... menu → Redeploy

---

## 📖 Next Steps

- [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) - Detailed deployment guide
- [API Reference](docs/API.md) - Learn the API
- [Dashboard Guide](docs/DASHBOARD.md) - Explore features
- [Integrations](docs/INTEGRATIONS.md) - Add more integrations

---

## 💡 Key Points

✅ All environment variables use **lowercase** names  
✅ Set variables in **Vercel dashboard**, not vercel.json  
✅ Use **service_role** key for `supabase_service_key`  
✅ Redeploy after changing environment variables  

---

**Questions?** See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md#troubleshooting) or [open an issue](https://github.com/iacosta3994/panopticon-engine/issues)
