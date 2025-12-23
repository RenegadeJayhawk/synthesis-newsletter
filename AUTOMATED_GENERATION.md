# Automated Newsletter Generation

**Status:** ✅ Implemented and Ready for Production

This document describes the automated weekly newsletter generation system using Vercel Cron.

---

## Overview

The AI newsletter now supports **automated weekly generation** using Vercel's built-in cron job functionality. Newsletters are automatically generated, parsed, saved to the database, and logged without any manual intervention.

---

## Features

✅ **Scheduled Generation** - Automatically runs every Monday at 9:00 AM UTC  
✅ **Database Persistence** - Saves newsletters and articles to Vercel Postgres  
✅ **Comprehensive Logging** - Tracks all steps with structured logging  
✅ **Error Handling** - Graceful error handling with notifications  
✅ **Security** - Protected with CRON_SECRET authorization  
✅ **Notifications** - Success/error notifications (extensible to email/Slack)

---

## Schedule

**Default Schedule:** Every Monday at 9:00 AM UTC

Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-newsletter",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

### Cron Schedule Format

The schedule uses standard cron syntax: `minute hour day month weekday`

**Examples:**
- `0 9 * * 1` - Every Monday at 9:00 AM UTC
- `0 10 * * 1` - Every Monday at 10:00 AM UTC
- `0 9 * * 2` - Every Tuesday at 9:00 AM UTC
- `0 9 1 * *` - First day of every month at 9:00 AM UTC
- `0 9 * * 1,3,5` - Monday, Wednesday, Friday at 9:00 AM UTC

---

## How It Works

### Workflow

1. **Vercel Cron Triggers** - Sends authenticated request to `/api/cron/generate-newsletter`
2. **Authorization Check** - Verifies CRON_SECRET matches
3. **Newsletter Generation** - Calls Gemini API to generate content
4. **Content Parsing** - Extracts articles and metadata
5. **Image Assignment** - Adds images to each article
6. **Database Save** - Stores newsletter and articles in Postgres
7. **Logging** - Records all steps with timestamps
8. **Notification** - Sends success/error notification

### Processing Time

- **Average:** 30-40 seconds
- **Steps:**
  - AI Generation: ~25-30 seconds
  - Parsing: <1 second
  - Image Assignment: ~2-3 seconds
  - Database Save: <1 second

---

## Security

### Authorization

The cron endpoint is protected with a secret token to prevent unauthorized access.

**Environment Variable Required:**
```bash
CRON_SECRET=your_secure_random_string_here
```

**How It Works:**
- Vercel Cron automatically includes: `Authorization: Bearer ${CRON_SECRET}`
- Endpoint validates the header matches the environment variable
- Unauthorized requests return 401 error

**Generating a Secure Secret:**
```bash
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Setup Instructions

### 1. Set Environment Variable

Add `CRON_SECRET` to your Vercel project:

**Via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** `[your secure random string]`
   - **Environment:** Production, Preview, Development
3. Save

**Via Vercel CLI:**
```bash
vercel env add CRON_SECRET
```

### 2. Deploy to Production

```bash
git push origin main
```

Vercel will automatically:
- Deploy the new code
- Register the cron job
- Start running on the configured schedule

### 3. Verify Setup

Check that the cron job is registered:

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see: `/api/cron/generate-newsletter` with schedule `0 9 * * 1`

---

## Monitoring

### View Cron Logs

**Via Vercel Dashboard:**
1. Go to Project → Deployments → Select deployment
2. Click "Functions" tab
3. Find `/api/cron/generate-newsletter`
4. View execution logs

**Via Vercel CLI:**
```bash
vercel logs --follow
```

### Log Structure

Each cron execution logs:
```
[Cron INFO] Starting automated newsletter generation
[Cron INFO] Generating newsletter content with AI
[Cron SUCCESS] Newsletter content generated
[Cron INFO] Parsing newsletter content into articles
[Cron SUCCESS] Parsed 40 articles from newsletter
[Cron INFO] Adding images to articles
[Cron SUCCESS] Images added to 40 articles
[Cron INFO] Saving newsletter to database
[Cron SUCCESS] Newsletter saved successfully
[Notification SUCCESS] Newsletter Generated Successfully
```

### Error Logs

If generation fails:
```
[Cron ERROR] Newsletter generation failed
[Notification ERROR] Newsletter Generation Failed
```

---

## Manual Triggering

You can manually trigger newsletter generation for testing:

**Via API (requires CRON_SECRET):**
```bash
curl -X GET "https://your-domain.vercel.app/api/cron/generate-newsletter" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response (Success):**
```json
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
  "duration": "32451ms",
  "logs": [...]
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "error": "Failed to generate newsletter",
  "message": "Error details...",
  "duration": "5234ms",
  "logs": [...]
}
```

---

## Notifications

### Current Implementation

Notifications are logged to console and visible in Vercel logs.

### Future Enhancements

The notification system is extensible and can be enhanced to send:

**Email Notifications** (via SendGrid/Resend):
```typescript
// In lib/notificationService.ts
async send(payload: NotificationPayload) {
  // Send email to admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: payload.subject,
    body: payload.message,
  });
}
```

**Slack Notifications:**
```typescript
// Post to Slack channel
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    text: `${payload.subject}: ${payload.message}`,
  }),
});
```

**Webhook Notifications:**
```typescript
// Trigger external webhook
await fetch(process.env.WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

---

## Customization

### Change Schedule

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-newsletter",
      "schedule": "0 10 * * 2"  // Tuesday at 10:00 AM UTC
    }
  ]
}
```

Then redeploy:
```bash
git add vercel.json
git commit -m "Update cron schedule"
git push origin main
```

### Disable Automated Generation

**Option 1:** Remove from `vercel.json`
```json
{
  "crons": []
}
```

**Option 2:** Delete `CRON_SECRET` environment variable (will cause 401 errors)

---

## Troubleshooting

### Cron Job Not Running

**Check:**
1. Cron job is registered in Vercel Dashboard
2. `CRON_SECRET` environment variable is set
3. Deployment is successful
4. Check Vercel logs for errors

### Authorization Errors (401)

**Cause:** `CRON_SECRET` mismatch or not set

**Fix:**
1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Ensure it matches the value used in manual testing
3. Redeploy after setting the variable

### Generation Failures (500)

**Common Causes:**
- Gemini API quota exceeded
- Database connection issues
- Invalid environment variables

**Debug:**
1. Check Vercel logs for detailed error messages
2. Verify `GEMINI_API_KEY` is valid
3. Verify database connection (check Postgres environment variables)
4. Test manual generation via `/api/newsletter/generate`

### No Newsletters in Database

**Check:**
1. Cron job executed successfully (check logs)
2. Database connection is working
3. No errors in cron execution logs

---

## Files Created/Modified

### New Files

- `app/api/cron/generate-newsletter/route.ts` - Cron endpoint
- `lib/cronLogger.ts` - Logging utility
- `lib/notificationService.ts` - Notification service

### Modified Files

- `vercel.json` - Added cron configuration
- `.env.example` - Added CRON_SECRET

---

## API Reference

### Endpoint

```
GET /api/cron/generate-newsletter
```

### Headers

```
Authorization: Bearer ${CRON_SECRET}
```

### Response

**Success (200):**
```typescript
{
  success: true;
  message: string;
  newsletter: {
    id: string;
    weekStart: string;
    weekEnd: string;
    articleCount: number;
    generatedAt: string;
  };
  duration: string;
  logs: CronLogEntry[];
}
```

**Unauthorized (401):**
```typescript
{
  success: false;
  error: "Unauthorized";
}
```

**Error (500):**
```typescript
{
  success: false;
  error: string;
  message: string;
  duration: string;
  logs: CronLogEntry[];
}
```

---

## Next Steps

**Recommended Enhancements:**

1. **Email Notifications** - Send admin email when newsletter is generated
2. **Email Distribution** - Auto-send newsletter to subscribers
3. **Retry Logic** - Retry failed generations automatically
4. **Health Checks** - Monitor cron job health
5. **Analytics** - Track generation success rate and performance

---

## Summary

✅ **Automated weekly newsletter generation is now live!**

- Runs every Monday at 9:00 AM UTC
- Generates newsletter with Gemini AI
- Saves to Vercel Postgres database
- Logs all steps for monitoring
- Secured with CRON_SECRET authorization

**No manual intervention required** - newsletters will be generated automatically every week!

---

**Last Updated:** December 22, 2025  
**Version:** 1.0.0
