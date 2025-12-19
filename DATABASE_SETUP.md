# Database Setup Instructions

## Vercel Postgres Setup

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `ai-newsletter`
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a database name (e.g., `ai-newsletter-db`)
7. Select a region (choose closest to your users)
8. Click **Create**

### Step 2: Get Database Connection String

After creating the database, Vercel will provide environment variables:

```
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### Step 3: Add Environment Variables

The database connection will be automatically added to your Vercel project's environment variables. For local development:

1. Copy `.env.example` to `.env.local`
2. Add the `POSTGRES_URL` from Vercel dashboard
3. The format will be: `postgresql://user:password@host/database`

### Step 4: Initialize Database Schema

Once the database is created and environment variables are set:

**Option A: Using Vercel Postgres Dashboard**
1. Go to Storage → Your Database → Query
2. Copy and paste the contents of `db/init.sql`
3. Click **Run Query**

**Option B: Using Drizzle Kit (Recommended)**
```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

### Step 5: Verify Database Connection

Test the connection by running:
```bash
npm run db:studio
```

This will open Drizzle Studio where you can view and manage your database.

---

## Local Development (Optional)

If you want to test locally without Vercel Postgres:

### Using Docker Postgres

```bash
# Start local Postgres
docker run --name ai-newsletter-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_newsletter \
  -p 5432:5432 \
  -d postgres:16

# Add to .env.local
POSTGRES_URL="postgresql://postgres:password@localhost:5432/ai_newsletter"

# Initialize schema
npm run db:push
```

---

## Environment Variables

### Required for Production (Vercel)
- `POSTGRES_URL` - Automatically set by Vercel Postgres
- `GEMINI_API_KEY` - Already configured

### Required for Local Development
Create `.env.local`:
```
POSTGRES_URL="postgresql://..."
GEMINI_API_KEY="your-key-here"
```

---

## Database Schema

### Tables

**newsletters**
- `id` (UUID, Primary Key)
- `week_start` (TEXT)
- `week_end` (TEXT)
- `content` (TEXT) - Raw markdown
- `model` (TEXT)
- `overview` (TEXT)
- `generated_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**articles**
- `id` (UUID, Primary Key)
- `newsletter_id` (UUID, Foreign Key → newsletters.id)
- `title` (TEXT)
- `summary` (TEXT)
- `content` (TEXT)
- `category` (TEXT)
- `author` (TEXT)
- `publication` (TEXT)
- `image_url` (TEXT)
- `external_link` (TEXT)
- `position` (INTEGER)
- `metadata` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Indexes
- `idx_articles_newsletter_id` - Fast lookups by newsletter
- `idx_articles_category` - Fast filtering by category
- `idx_newsletters_generated_at` - Fast sorting by date

---

## Next Steps

After database setup:
1. ✅ Database schema created
2. ⬜ Database configured in Vercel
3. ⬜ Environment variables set
4. ⬜ Database service layer implemented
5. ⬜ API routes updated to use database
6. ⬜ Archive page created
7. ⬜ Testing and deployment

---

## Troubleshooting

### Connection Errors
- Verify `POSTGRES_URL` is set correctly
- Check Vercel dashboard for database status
- Ensure database region matches your deployment region

### Migration Errors
- Run `npm run db:generate` to regenerate migrations
- Check `db/migrations` folder for generated SQL
- Manually run SQL in Vercel dashboard if needed

### Permission Errors
- Ensure database user has CREATE, INSERT, UPDATE, DELETE permissions
- Check Vercel Postgres settings for user permissions
