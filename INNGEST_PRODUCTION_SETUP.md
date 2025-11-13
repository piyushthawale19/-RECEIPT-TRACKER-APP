# Inngest Production Setup Guide

## Overview

Inngest needs to connect to your Vercel deployment to run background jobs for PDF processing.

## Step-by-Step Setup

### 1. Get Your Production URL

Your Vercel production URL is:

```
https://receipt-tracker-oy3veuiin-piyushthawale19s-projects.vercel.app
```

### 2. Set Up Inngest Cloud Account

1. Go to [https://www.inngest.com/](https://www.inngest.com/)
2. Sign up or log in to your account
3. Create a new app called "Receipt Tracker" (or use existing)

### 3. Configure Inngest Environment in Production

#### Get Your Signing Key:

1. In Inngest Dashboard, go to **Settings** → **Keys**
2. Copy your **Signing Key** (starts with `signkey_prod_...`)
3. Copy your **Event Key** (starts with `inngest_...`)

#### Add to Vercel Environment Variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```env
INNGEST_SIGNING_KEY=signkey_prod_YOUR_KEY_HERE
INNGEST_EVENT_KEY=inngest_YOUR_KEY_HERE
```

4. Make sure these are set for **Production**, **Preview**, and **Development** environments
5. Click **Save**

### 4. Sync Your App with Inngest

#### Option A: Using Inngest Dashboard (Recommended)

1. In Inngest Dashboard, go to **Apps** → **Syncs**
2. Click **"Create Sync"** or **"Sync App"**
3. Enter your production URL with the Inngest endpoint:
   ```
   https://receipt-tracker-oy3veuiin-piyushthawale19s-projects.vercel.app/api/inngest
   ```
4. Click **"Sync"** or **"Create"**
5. Inngest will verify the connection and register your functions

#### Option B: Using Inngest CLI

```bash
# Install Inngest CLI globally
npm install -g inngest-cli

# Sync your production deployment
npx inngest-cli sync --url https://receipt-tracker-oy3veuiin-piyushthawale19s-projects.vercel.app/api/inngest
```

### 5. Verify the Connection

1. In Inngest Dashboard, go to **Functions**
2. You should see your function: **"Extract PDF and Save in Database"**
3. Check the status - it should show as **"Active"** or **"Synced"**

### 6. Redeploy Your Vercel App

After adding environment variables:

```bash
git commit -m "chore: update inngest configuration"
git push origin main
```

Or trigger a manual redeploy in Vercel dashboard.

### 7. Test the Integration

1. Go to your production app
2. Upload a PDF receipt
3. Check Inngest Dashboard → **Runs** to see the function execution
4. The status should change from **"Error"** to **"Running"** or **"Completed"**

## Troubleshooting

### Error: "We could not reach your URL"

**Causes:**

- Missing `INNGEST_SIGNING_KEY` in Vercel environment variables
- Incorrect URL in Inngest sync
- Vercel deployment not complete

**Solutions:**

1. Double-check environment variables in Vercel
2. Ensure URL ends with `/api/inngest`
3. Redeploy after adding environment variables
4. Check Vercel deployment logs for errors

### Error: "Invalid signature"

**Cause:** Wrong signing key or key not set

**Solution:**

1. Copy the correct signing key from Inngest Dashboard
2. Update `INNGEST_SIGNING_KEY` in Vercel
3. Redeploy

### Function not appearing in Inngest Dashboard

**Solution:**

1. Force a sync from Inngest Dashboard
2. Check that your Vercel deployment is live
3. Visit `https://your-app.vercel.app/api/inngest` - should return JSON
4. Check Vercel logs for any errors

## Current Configuration

Your Inngest setup includes:

- **Function**: Extract PDF and Save in Database
- **Trigger**: Event `"receipt/extract-data-from-pdf"`
- **Features**:
  - PDF fetching and processing
  - Google Gemini AI integration
  - Convex database storage
  - Schematic feature flags
  - Retry logic with exponential backoff

## Local Development

For local testing:

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Inngest Dev Server
npm run dev:inngest
# or
npx inngest-cli dev -u http://localhost:3000/api/inngest
```

The Inngest dev server will be available at: `http://localhost:8288`

## Important Notes

1. **Always sync after deployment** - Any code changes to Inngest functions require a re-sync
2. **Environment variables** - Must be set in Vercel for production to work
3. **URL format** - Must be the full URL including `/api/inngest`
4. **Signing key** - Keep this secret and never commit it to git

## Need Help?

- Inngest Documentation: https://www.inngest.com/docs
- Inngest Discord: https://www.inngest.com/discord
- Check Vercel logs: `vercel logs --prod`
