# Deployment Guide - Panopticon Engine

## 🎯 Recommended: Vercel + Supabase

**Time**: 5 minutes  
**Cost**: Free tier available  
**Difficulty**: Easy  

---

## 📝 Complete Deployment Steps

### Part 1: Supabase Database Setup

#### 1.1: Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **"New Project"** button
4. Configure:
   - **Organization**: Select or create
   - **Name**: `panopticon-engine`
   - **Database Password**: Choose strong password (save it!)
   - **Region**: Select closest to your users
   - **Pricing**: Free tier is fine for testing
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

#### 1.2: Run Database Migration

1. In your Supabase project, click **"SQL Editor"** (left sidebar)
2. Click **"New query"** button
3. Open the file `migrations/20260305_add_panopticon_engine_tables.sql` from this repository
4. Copy the **entire content** (it's a long file - ~1000 lines)
5. Paste into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Wait ~10 seconds
8. You should see: **"Success. No rows returned"** ✅

This creates:
- 15 core tables
- 50+ indexes
- 4 materialized views
- 3 database functions
- 5 triggers

#### 1.3: Get Database Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Under "Project URL" section:
   - Copy the **URL** (like: `https://abc123.supabase.co`)
   - Save as: `SUPABASE_URL`
3. Under "Project API keys" section:
   - Copy the **service_role** key (the longer one)
   - Save as: `SUPABASE_SERVICE_KEY`
   - ⚠️ **Keep this secret!** Don't commit to Git

---

### Part 2: Fork Repository

1. Go to [github.com/iacosta3994/panopticon-engine](https://github.com/iacosta3994/panopticon-engine)
2. Click **"Fork"** button (top right)
3. Select your GitHub account
4. Wait for fork to complete (~10 seconds)

**Why fork?**
- Enables automatic updates
- Lets you customize if needed
- Vercel auto-deploys on every push

---

### Part 3: Deploy to Vercel

#### 3.1: Import Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. You'll see a list of your GitHub repositories
5. Find **`panopticon-engine`**
6. Click **"Import"**

#### 3.2: Configure Project

Vercel will auto-detect it's a Next.js project. Just configure environment variables:

1. Click **"Environment Variables"** section
2. Add these **3 variables**:

**Variable 1**:
```
Name: SUPABASE_URL
Value: https://your-project.supabase.co
```
(Paste the URL from Step 1.3)

**Variable 2**:
```
Name: SUPABASE_SERVICE_KEY  
Value: your-service-role-key-from-supabase
```
(Paste the service_role key from Step 1.3)

**Variable 3**:
```
Name: JWT_SECRET
Value: any-random-32-character-string
```

**Generate JWT_SECRET**:
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or just use any random string:
my-super-secret-jwt-key-12345678901234567890
```

#### 3.3: Deploy

1. Click **"Deploy"** button
2. Wait ~2 minutes while Vercel builds
3. You'll see progress: Installing → Building → Deploying
4. When complete, you'll see: **"Congratulations!"** 🎉
5. Click **"Visit"** button

---

### Part 4: Access Your Dashboard

1. Your app is live at: `https://your-app-name.vercel.app`
2. Go to: `https://your-app-name.vercel.app/dashboard`
3. You should see:
   - ✅ Dashboard loading
   - ✅ Charts rendering
   - ✅ Real-time updates working
   - ✅ System status: "All Systems Operational"

**Success!** Your surveillance platform is now live! 🎊

---

## 🔄 Future Updates

**Automatic Deployment**:
- Push to your GitHub repo
- Vercel automatically detects changes
- Builds and deploys in ~2 minutes
- No manual deployment needed!

**Preview Deployments**:
- Create pull request
- Vercel creates preview URL
- Test changes before merging
- Merge → Auto-deploys to production

---

## 🔑 Optional: Add Integrations

### Email Alerts

In Vercel → Settings → Environment Variables, add:

```
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

**Gmail App Password**:
1. Google Account → Security
2. 2-Step Verification → App Passwords
3. Generate → Copy

### Telegram Bot

```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

**Create Bot**:
1. Message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow instructions
4. Copy token

**Get Chat ID**:
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
```

### Slack Webhooks

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**Create Webhook**:
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Incoming Webhooks → Activate
4. Add New Webhook → Copy URL

---

## 🏁 Alternative: Local Development

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/panopticon-engine.git
cd panopticon-engine

# Install (auto-creates .env)
npm install

# Add credentials to .env
nano .env
# Add your SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET

# Start
npm run dev
```

Access at: `http://localhost:3000/dashboard`

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Migration SQL executed successfully
- [ ] SUPABASE_URL copied
- [ ] SUPABASE_SERVICE_KEY copied
- [ ] JWT_SECRET generated
- [ ] Repository forked
- [ ] Vercel project imported
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Dashboard accessible

---

## 🆘 Troubleshooting

### "Database connection failed"

- Check `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_KEY` is the **service_role** key (not anon key)
- Verify migration ran successfully in Supabase SQL Editor

### "Authentication failed"

- Check `JWT_SECRET` is set
- Make sure it's at least 32 characters

### "Dashboard not loading"

- Check Vercel deployment logs
- Verify all 3 env vars are set
- Try redeploying from Vercel dashboard

---

## 📞 Need Help?

- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/iacosta3994/panopticon-engine/issues)
- [Full Documentation](docs/)

---

**Deployment Time**: 5 minutes  
**Complexity**: Easy  
**Cost**: Free tier available
