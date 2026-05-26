# Deployment Guide - AI & GenAI Weekly Newsletter

## Overview

This guide covers the supported production model for this repository: a **server-backed Next.js deployment on Vercel**. Newsletter generation, cron execution, archive APIs, and database access do not work as a static export.

---

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier works)
2. **GitHub Account** - Your code repository
3. **Gemini API key** for newsletter generation
4. **Postgres connection string** for newsletter storage

---

## Step 1: Push Code to GitHub

The project is already in your GitHub repository at:
`https://github.com/RenegadeJayhawk/synthesis-newsletter`

To push the latest changes:

```bash
cd /path/to/ai-newsletter
git add .
git commit -m "Add backend infrastructure for newsletter generation"
git push origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"

2. **Import GitHub Repository**
   - Select "Import Git Repository"
   - Choose `RenegadeJayhawk/synthesis-newsletter`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following:
       - **Name**: `GEMINI_API_KEY`
       - **Value**: Your Gemini API key
       - **Environment**: Production, Preview, Development (select all)
    - Add the following:
       - **Name**: `POSTGRES_URL`
       - **Value**: Your Postgres connection string
     - **Environment**: Production, Preview, Development (select all)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment to complete
   - Your site will be live at `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /path/to/ai-newsletter
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? synthesis-newsletter (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add GEMINI_API_KEY
vercel env add POSTGRES_URL

# Deploy to production
vercel --prod
```

---

## Step 3: Verify Deployment

1. **Visit Your Site**
   - Go to `https://your-project-name.vercel.app`
   - Navigate to `/newsletter`

2. **Test Newsletter Generation**
   - Click "Refresh Newsletter" button
   - Wait 15-30 seconds for AI generation
   - Verify newsletter content appears

3. **Check API Routes**
   - Test: `https://your-project-name.vercel.app/api/newsletter/latest`
   - Should return JSON with newsletter data

---

## Step 4: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

---

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Gemini API key for newsletter generation | Yes | `AIza...` |
| `POSTGRES_URL` | Postgres connection string for newsletters and articles | Yes | `postgres://...` |

---

## Database Configuration

The current code path expects a Postgres-backed newsletter store via Drizzle. Configure the database before enabling newsletter generation in production.

### 1. Enable Vercel Postgres

```bash
# In your Vercel project dashboard
# Go to Storage → Create Database → Postgres
# Follow the setup wizard
```

### 2. Update Database Service

Replace the in-memory storage in `lib/database.ts` with Vercel Postgres queries:

```typescript
import { sql } from '@vercel/postgres';

export async function saveNewsletter(newsletter: Newsletter) {
  const result = await sql`
    INSERT INTO newsletters (id, title, week_start, week_end, content, generated_at, model)
    VALUES (${newsletter.id}, ${newsletter.title}, ${newsletter.weekStart}, 
            ${newsletter.weekEnd}, ${newsletter.content}, ${newsletter.generatedAt}, ${newsletter.model})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getLatestNewsletter() {
  const result = await sql`
    SELECT * FROM newsletters 
    ORDER BY generated_at DESC 
    LIMIT 1
  `;
  return result.rows[0] || null;
}
```

### 3. Create Database Schema

```sql
CREATE TABLE newsletters (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  week_start VARCHAR(50) NOT NULL,
  week_end VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletters_generated_at ON newsletters(generated_at DESC);
```

---

## Troubleshooting

### Issue: "GEMINI_API_KEY is not set"

**Solution**: 
- Verify environment variable is added in Vercel dashboard
- Redeploy the project after adding the variable

### Issue: Newsletter generation times out

**Solution**:
- Vercel serverless functions have a 10-second timeout on Hobby plan
- Upgrade to Pro plan for 60-second timeout
- Or optimize the prompt to generate shorter content

### Issue: Build fails with TypeScript errors

**Solution**:
```bash
# Run locally to check errors
npm run build

# Fix any TypeScript errors
# Push changes and redeploy
```

### Issue: API routes return 404

**Solution**:
- Ensure `output: 'export'` is NOT in next.config.js
- API routes don't work with static export
- Current config is correct for Vercel

---

## Monitoring & Analytics

1. **Vercel Analytics**
   - Automatically enabled
   - View in Vercel dashboard

2. **Function Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - View real-time logs for API routes

3. **Error Tracking**
   - Consider adding Sentry or similar
   - Add to `next.config.js` and install SDK

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Automatic preview deployments

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use Vercel dashboard to manage secrets

2. **API Rate Limiting**
   - Consider adding rate limiting to `/api/newsletter/generate`
   - Use Vercel Edge Middleware or Upstash Redis

3. **CORS Configuration**
   - Current setup restricts to same origin
   - Modify if you need external API access

---

## Cost Considerations

### Vercel Hobby Plan (Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless function executions
- ⚠️ 10-second function timeout
- ⚠️ 12 serverless function invocations per hour (may need upgrade for heavy use)

### OpenAI API Costs
- GPT-4.1-mini: ~$0.15 per newsletter generation
- Estimate: $4.50/month for 30 newsletters
- Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)

---

## Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **OpenAI API Reference**: [platform.openai.com/docs](https://platform.openai.com/docs)

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# View deployment logs
vercel logs

# Add environment variable
vercel env add OPENAI_API_KEY

# Pull environment variables locally
vercel env pull
```

---

## Next Steps After Deployment

1. ✅ Test newsletter generation in production
2. ✅ Set up custom domain (optional)
3. ✅ Configure Vercel Postgres for persistent storage
4. ✅ Add monitoring and error tracking
5. ✅ Set up automated newsletter scheduling (optional)
6. ✅ Add user authentication (if needed)
7. ✅ Implement newsletter email distribution (optional)

---

**Your AI Newsletter application is now ready for production deployment! 🚀**
