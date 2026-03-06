# Vercel Deployment Guide - Panopticon Engine

**Time**: 10 minutes  
**Complexity**: Simple  
**Cost**: Free tier available

---

## Quick Start: 3 Simple Steps

### 1. Setup Supabase Database

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose:
   - Name: `panopticon-engine`
   - Database Password: (save this!)
   - Region: Closest to you
4. Click **"Create new project"** (takes ~2 minutes)

#### Run Migration
1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `migrations/20260305_add_panopticon_engine_tables.sql` from this repo
4. Copy entire content and paste into SQL Editor
5. Click **"Run"** 
6. Should see: "Success. No rows returned" ✅

#### Get Your Credentials
1. Go to **Settings → API**
2. Copy these 3 values:
   - **Project URL** → save as `supabase_url`
   - **anon public** key → save as `supabase_anon_key`
   - **service_role** key → save as `supabase_service_key`

---

### 2. Deploy to Vercel

#### Import Project
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..." → "Project"**
3. Find `panopticon-engine` in your repos
4. Click **"Import"**

#### Set Environment Variables

Click **"Environment Variables"** and add these **4 required variables**:

```
supabase_url = https://your-project.supabase.co
supabase_anon_key = your-anon-key-here
supabase_service_key = your-service-role-key-here
jwt_secret = your-random-32-char-string
```

**Generate jwt_secret**:
```bash
# Mac/Linux:
openssl rand -base64 32

# Or just make up a random string (32+ characters)
```

**Important**: Use lowercase variable names exactly as shown above!

#### Deploy
1. Click **"Deploy"**
2. Wait ~2 minutes for build
3. Click **"Visit"** when complete

---

### 3. Verify Deployment

Your app is live at: `https://your-app-name.vercel.app`

1. Go to: `https://your-app-name.vercel.app/dashboard`
2. Should see:
   - ✅ Dashboard loads
   - ✅ System status visible
   - ✅ No error messages

**Success!** 🎉

---

## Optional: Add Integrations

Only add these if you need them. The system works fine without them!

### Email Alerts

Add to Vercel environment variables:
```
smtp_user = your-email@gmail.com
smtp_password = your-gmail-app-password
smtp_host = smtp.gmail.com
email_from = panopticon@example.com
```

### Telegram Alerts

```
telegram_bot_token = your-bot-token
telegram_chat_id = your-chat-id
```

### Slack Alerts

```
slack_webhook_url = https://hooks.slack.com/services/...
```

---

## Troubleshooting

### "Database connection failed"
- ✓ Check `supabase_url` is correct
- ✓ Check `supabase_service_key` is the **service_role** key (not anon key)
- ✓ Verify migration ran successfully in Supabase SQL Editor

### "Authentication failed"
- ✓ Check `jwt_secret` is set and at least 32 characters

### "Dashboard not loading"
- ✓ Check all 4 required variables are set in Vercel
- ✓ Variable names are **lowercase**
- ✓ Redeploy from Vercel dashboard

### Still Having Issues?
1. Go to Vercel dashboard → Your Project → Deployments
2. Click latest deployment → View Function Logs
3. Look for error messages

---

## Important Notes

### Environment Variables
- **Use lowercase**: `supabase_url` not `SUPABASE_URL`
- **Set in Vercel dashboard**: Don't use vercel.json for secrets
- **Redeploy after changes**: Settings → Deployments → Redeploy

### Updating Code
- Push to GitHub main branch → Vercel auto-deploys
- Takes ~2 minutes per deployment

### Domains
- Free subdomain: `your-app.vercel.app`
- Custom domain: Settings → Domains → Add

---

## Quick Reference

### Required Variables (4)
```
supabase_url
supabase_anon_key
supabase_service_key
jwt_secret
```

### Optional Variables
```
# Email
smtp_user
smtp_password
smtp_host
email_from

# Telegram
telegram_bot_token
telegram_chat_id

# Slack
slack_webhook_url

# Notion
notion_api_key
notion_database_id

# Atlas
atlas_db_connection
atlas_api_key
```

### Deployment URLs
- **Production**: `https://your-app.vercel.app`
- **Dashboard**: `https://your-app.vercel.app/dashboard`
- **API Health**: `https://your-app.vercel.app/api/health`

---

## That's It!

Simple deployment, no complex secret management, no confusing configurations.

Just set your environment variables in the Vercel dashboard and deploy.

**Questions?** Check the main [README.md](./README.md) or open an issue.
