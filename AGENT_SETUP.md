# AI Newsletter Agent Setup Guide

This document outlines the complete setup for the AI-powered newsletter generation agent.

## Overview

The agent system consists of:
- **AI Agent Core**: Uses AI SDK 6 with OpenAI's GPT-4 Turbo to generate structured newsletter content
- **API Endpoint**: Handles on-demand and scheduled runs with authentication
- **Supabase Database**: Persists newsletters, articles, and execution history
- **Admin Dashboard**: View run history and trigger manual generations
- **Vercel Cron Jobs**: Automatically run the agent on a schedule (default: Mondays at 9 AM UTC)

## Database Schema

### agent_runs Table
Tracks all agent executions with:
- `id`: UUID primary key
- `status`: 'pending' | 'completed' | 'failed'
- `input`: JSON of run parameters
- `output`: JSON with generated content IDs and metadata
- `error`: Error message if failed
- `created_at`: Timestamp
- `completed_at`: When run finished
- `newsletter_id`: FK to newsletters table

### newsletters Table (existing)
Stores newsletter metadata:
- `overview`: Summary of newsletter
- `content`: Full newsletter content
- `model`: AI model used
- `created_at`: Timestamp

### articles Table (existing)
Individual articles within newsletters:
- `title`, `summary`, `content`
- `category`, `author`, `keyPoints`
- `newsletter_id`: FK to newsletters
- `created_at`: Timestamp

## Running the Agent

### Scheduled Runs
The agent runs automatically every Monday at 9 AM UTC via Vercel Cron Jobs (configured in `vercel.json`).

To change the schedule, edit the `crons` array in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/agent/run",
      "schedule": "0 9 * * 1"  // Cron expression (minute hour day month weekday)
    }
  ]
}
```

### Manual Triggers
Access the admin dashboard at `/admin` to:
1. View all historical runs
2. Check individual run details (output, errors)
3. Manually trigger a new run

The dashboard requires no authentication in development but should be protected in production.

## API Endpoint

### POST /api/agent/run
Triggers the newsletter generation.

**Headers:**
- `x-vercel-cron`: Secret value for scheduled runs (auto-verified by Vercel)
- `Authorization`: Bearer token for manual triggers (optional in development)

**Response:**
```json
{
  "success": true,
  "runId": "uuid",
  "newsletterId": "uuid",
  "articlesCount": 5
}
```

### GET /api/agent/runs
Fetches execution history (used by dashboard).

**Response:**
```json
[
  {
    "id": "uuid",
    "status": "completed",
    "created_at": "2024-01-15T09:00:00Z",
    "completed_at": "2024-01-15T09:05:00Z",
    "output": { "articles_count": 5 },
    "error": null
  }
]
```

## Configuration

### Environment Variables
Ensure these are set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
CRON_SECRET=your_cron_secret  # For verifying scheduled runs
NEXT_PUBLIC_AGENT_TOKEN=optional_token  # For manual trigger authentication
```

### AI Provider
The agent uses the Vercel AI Gateway with OpenAI's GPT-4 Turbo.

No additional API keys needed - authentication flows through the AI Gateway with your Vercel project.

## Customization

### System Prompt
Edit `lib/agent.ts` to change the system prompt:

```typescript
const DEFAULT_SYSTEM_PROMPT = `Your custom prompt here...`
```

### Newsletter Structure
Modify the `newsletterSchema` in `lib/agent.ts` to change the output format.

The schema must align with your `newsletters` and `articles` table structure.

### AI Model
Change the model in `lib/agent.ts`:

```typescript
model: 'openai/gpt-4-turbo'  // Change to another model supported by AI Gateway
```

## Monitoring

The admin dashboard shows:
- Run status (pending, completed, failed)
- Execution timestamps
- Error messages for failed runs
- Generated newsletter and article counts

For production, consider adding:
- Email alerts for failed runs
- Run duration monitoring
- Success rate tracking

## Security

**Development:**
- No authentication required for `/admin` and `/api/agent/run`
- CRON_SECRET auto-verified by Vercel for scheduled runs

**Production:**
1. Add authentication middleware to `/app/admin`
2. Implement bearer token validation in `/api/agent/run`
3. Enable RLS policies on agent_runs table
4. Rotate CRON_SECRET regularly

## Troubleshooting

**Scheduled runs not executing:**
- Verify `CRON_SECRET` is set in Vercel environment variables
- Check Vercel deployment logs for cron execution status
- Ensure `vercel.json` is included in deployment

**Agent failures:**
- Check error message in admin dashboard
- Verify Supabase connection and table structure
- Check AI Gateway API limits and quotas
- Review console logs in Vercel function logs

**Dashboard not loading:**
- Verify Supabase client setup in `lib/supabase/client.ts`
- Check that agent_runs table has correct schema
- Ensure API endpoint `/api/agent/runs` is accessible

## File Structure

```
app/
  admin/
    page.tsx              # Dashboard page
  api/
    agent/
      run/route.ts        # Main agent execution endpoint
      runs/route.ts       # Fetch run history
components/
  admin/
    RunHistory.tsx        # Run history table
    TriggerAgent.tsx      # Manual trigger form
lib/
  agent.ts                # Agent core logic
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server Supabase client
scripts/
  001_create_agent_runs.sql  # Database migration
vercel.json               # Cron job configuration
```
