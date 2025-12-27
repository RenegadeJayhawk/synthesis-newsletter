# GitHub Actions Setup for Automated Newsletter Generation

**Alternative to Vercel Cron (Free!)**

Since Vercel Cron requires a paid plan, we use **GitHub Actions** instead, which is completely free and works just as well.

---

## Overview

GitHub Actions will automatically call your newsletter generation endpoint every Monday at 9:00 AM UTC, triggering the same workflow as Vercel Cron would.

---

## Setup Instructions

### Step 1: Add GitHub Secrets

You need to add two secrets to your GitHub repository:

1. Go to your GitHub repository: https://github.com/RenegadeJayhawk/synthesis-newsletter
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**Add these two secrets:**

#### Secret 1: CRON_SECRET
- **Name:** `CRON_SECRET`
- **Value:** `RKpqbEKZ5zKpq5NNZ5S6bkwbBQawwgRHyCvpWezn6B0=`
- Click **Add secret**

#### Secret 2: VERCEL_DEPLOYMENT_URL
- **Name:** `VERCEL_DEPLOYMENT_URL`
- **Value:** `https://ai-newsletter-9qb4vfgvd-brads-projects-acb7cbba.vercel.app`
- Click **Add secret**

### Step 2: Add CRON_SECRET to Vercel (Important!)

The cron endpoint still needs the secret to authorize requests:

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **ai-newsletter**
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `CRON_SECRET`
   - **Value:** `RKpqbEKZ5zKpq5NNZ5S6bkwbBQawwgRHyCvpWezn6B0=`
   - **Environment:** All (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project (Settings → Deployments → Redeploy latest)

### Step 3: Push Workflow to GitHub

The workflow file is already created at `.github/workflows/generate-newsletter.yml`.

Push it to GitHub:
```bash
git add .github/workflows/generate-newsletter.yml
git commit -m "Add GitHub Actions workflow for automated newsletter generation"
git push origin main
```

### Step 4: Verify Setup

1. Go to your GitHub repository
2. Click the **Actions** tab
3. You should see "Generate Weekly Newsletter" workflow listed
4. The workflow will run automatically every Monday at 9:00 AM UTC

---

## Manual Testing

You can manually trigger the workflow to test it:

1. Go to **Actions** tab in GitHub
2. Click **Generate Weekly Newsletter** workflow
3. Click **Run workflow** button
4. Select branch: `main`
5. Click **Run workflow**
6. Watch the execution in real-time

---

## Schedule

**Default:** Every Monday at 9:00 AM UTC

**Cron Syntax:** `0 9 * * 1`

### Change Schedule

Edit `.github/workflows/generate-newsletter.yml`:

```yaml
on:
  schedule:
    - cron: '0 10 * * 2'  # Tuesday at 10:00 AM UTC
```

**Examples:**
- `0 9 * * 1` - Monday at 9:00 AM UTC
- `0 10 * * 1` - Monday at 10:00 AM UTC
- `0 9 * * 2` - Tuesday at 9:00 AM UTC
- `0 9 1 * *` - First day of every month at 9:00 AM UTC
- `0 9 * * 1,3,5` - Monday, Wednesday, Friday at 9:00 AM UTC

---

## How It Works

1. **GitHub Actions triggers** on schedule (every Monday 9 AM UTC)
2. **Workflow runs** on GitHub's servers
3. **Calls Vercel endpoint** with CRON_SECRET authorization
4. **Newsletter generates** using Gemini AI
5. **Saves to database** (Vercel Postgres)
6. **Logs results** visible in GitHub Actions

---

## Monitoring

### View Execution Logs

1. Go to **Actions** tab in GitHub repository
2. Click on a workflow run
3. Click on the job name
4. View detailed logs with timestamps

### Successful Run Example

```
🚀 Starting automated newsletter generation...
📊 HTTP Status: 200
📄 Response:
{
  "success": true,
  "message": "Newsletter generated and saved successfully",
  "newsletter": {
    "id": "newsletter-1766431712475",
    "weekStart": "December 15, 2025",
    "weekEnd": "December 22, 2025",
    "articleCount": 40,
    "generatedAt": "2025-12-22T..."
  },
  "duration": "32451ms"
}
✅ Newsletter generated successfully!
```

### Failed Run Example

```
🚀 Starting automated newsletter generation...
📊 HTTP Status: 401
📄 Response:
{
  "success": false,
  "error": "Unauthorized"
}
❌ Newsletter generation failed with status 401
```

---

## Troubleshooting

### Workflow Not Running

**Check:**
- Workflow file is in `.github/workflows/` directory
- File is pushed to `main` branch
- Repository has Actions enabled (Settings → Actions → Allow all actions)

### 401 Unauthorized Error

**Cause:** CRON_SECRET mismatch

**Fix:**
1. Verify CRON_SECRET is set in **both** GitHub Secrets and Vercel Environment Variables
2. Ensure they match exactly
3. Redeploy Vercel after adding environment variable

### 500 Internal Server Error

**Common Causes:**
- Gemini API quota exceeded
- Database connection issues
- Invalid environment variables

**Debug:**
1. Check Vercel logs for detailed error
2. Verify GEMINI_API_KEY is valid
3. Test manual generation: `/api/newsletter/generate`

### Workflow Runs But Newsletter Not Generated

**Check:**
1. Workflow execution logs in GitHub Actions
2. Vercel function logs
3. Database connection (verify newsletters are being saved)

---

## Cost

**GitHub Actions:** ✅ **FREE**
- Public repositories: Unlimited minutes
- Private repositories: 2,000 minutes/month free

**This workflow uses:** ~1 minute per run
- Weekly runs: 4 minutes/month
- Well within free tier limits!

---

## Comparison: GitHub Actions vs Vercel Cron

| Feature | GitHub Actions | Vercel Cron |
|---------|----------------|-------------|
| **Cost** | ✅ Free | ❌ Requires Pro plan ($20/month) |
| **Reliability** | ✅ High | ✅ High |
| **Setup** | ✅ Simple | ✅ Simple |
| **Monitoring** | ✅ GitHub Actions UI | ✅ Vercel Dashboard |
| **Manual Trigger** | ✅ Yes | ✅ Yes |
| **Flexibility** | ✅ High | ✅ High |

**Recommendation:** Use GitHub Actions unless you're already on Vercel Pro plan.

---

## Next Steps

After setup is complete:

1. **Test manually** - Run workflow from GitHub Actions UI
2. **Wait for Monday** - Let it run automatically
3. **Check results** - Verify newsletter appears in database
4. **Monitor logs** - Review GitHub Actions execution logs

---

## Additional Features

### Email Notifications

Add email notification on failure:

```yaml
- name: Send Email on Failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Newsletter Generation Failed
    body: Check GitHub Actions logs for details
    to: your-email@example.com
    from: GitHub Actions
```

### Slack Notifications

Add Slack notification:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    text: Newsletter generation ${{ job.status }}
```

---

## Summary

✅ **GitHub Actions provides free, reliable automated newsletter generation!**

- Runs every Monday at 9:00 AM UTC
- Calls your Vercel deployment
- Generates newsletter with Gemini AI
- Saves to database
- Logs visible in GitHub Actions

**No cost, no limits, works perfectly!**

---

**Last Updated:** December 22, 2025  
**Version:** 1.0.0
