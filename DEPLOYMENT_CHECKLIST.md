# Deployment Checklist - Panopticon Engine

**Date**: March 6, 2026  
**For**: Ian's morning deployment  
**Time**: ~10 minutes

---

## ✅ Pre-Deployment Checklist

Before you start, make sure you have:

- [ ] GitHub account (with panopticon-engine repo)
- [ ] Supabase account (or can create one)
- [ ] Vercel account (or can sign in with GitHub)

---

## 📋 Deployment Steps

### Step 1: Supabase Setup (5 minutes)

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project named `panopticon-engine`
- [ ] Wait for project to provision (~2 min)
- [ ] Go to SQL Editor → New query
- [ ] Copy/paste `migrations/20260305_add_panopticon_engine_tables.sql`
- [ ] Click "Run" - should see "Success. No rows returned"
- [ ] Go to Settings → API
- [ ] Copy these 3 values:
  ```
  Project URL (supabase_url)
  anon public key (supabase_anon_key)
  service_role key (supabase_service_key)
  ```

### Step 2: Generate JWT Secret (30 seconds)

- [ ] Run in terminal: `openssl rand -base64 32`
- [ ] Copy the output (your jwt_secret)

### Step 3: Deploy to Vercel (3 minutes)

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import `panopticon-engine`
- [ ] Add environment variables:
  - [ ] `supabase_url` = (paste from Step 1)
  - [ ] `supabase_anon_key` = (paste from Step 1)
  - [ ] `supabase_service_key` = (paste from Step 1)
  - [ ] `jwt_secret` = (paste from Step 2)
- [ ] Click "Deploy"
- [ ] Wait ~2 minutes for build

### Step 4: Verify (1 minute)

- [ ] Click "Visit" on Vercel dashboard
- [ ] Go to `/dashboard` path
- [ ] Should see dashboard load successfully
- [ ] No error messages
- [ ] System status shows operational

---

## ✨ Success Indicators

You're done when you see:

✅ Vercel deployment shows "Ready"  
✅ Dashboard loads at `https://your-app.vercel.app/dashboard`  
✅ No database connection errors  
✅ System status: "All Systems Operational"  

---

## 🔧 If Something Goes Wrong

### Build Fails
- Check Vercel logs for specific error
- Verify all 4 environment variables are set
- Ensure variable names are **lowercase**

### Dashboard Won't Load
- Check browser console for errors
- Verify Supabase migration ran successfully
- Try redeploying from Vercel dashboard

### Database Connection Error
- Verify `supabase_url` is correct
- Ensure `supabase_service_key` is the service_role key (not anon)
- Check Supabase project is active

---

## 📝 Post-Deployment (Optional)

### Add Email Alerts
- [ ] Get Gmail app password
- [ ] Add to Vercel env vars: `smtp_user`, `smtp_password`
- [ ] Redeploy

### Add Telegram Alerts
- [ ] Create Telegram bot with @BotFather
- [ ] Add to Vercel env vars: `telegram_bot_token`, `telegram_chat_id`
- [ ] Redeploy

### Custom Domain
- [ ] Go to Vercel → Settings → Domains
- [ ] Add your domain
- [ ] Update DNS records as instructed

---

## 🎯 Quick Reference

### Required Variables (all lowercase)
```
supabase_url
supabase_anon_key
supabase_service_key
jwt_secret
```

### Where to Set Them
Vercel Dashboard → Your Project → Settings → Environment Variables

### After Adding/Changing Variables
Vercel Dashboard → Deployments → Redeploy (from ... menu)

---

## 📞 Need Help?

- Full guide: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)
- Troubleshooting: [VERCEL_DEPLOY.md#troubleshooting](./VERCEL_DEPLOY.md#troubleshooting)
- System docs: [README.md](./README.md)

---

**Good luck with your deployment! 🚀**

The codebase is ready, simplified, and tested.
Just follow the steps above and you'll be live in 10 minutes.
