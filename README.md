# The Synthesis — newsletter site

Server-backed [Next.js 15](https://nextjs.org/) site for **The Synthesis**, combining an editorial frontend with newsletter APIs, scheduled generation, and persistent storage surfaces. Full product notes, structure, and troubleshooting live in **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

## Requirements

- **Node.js** 18.18+ or 20.x (LTS recommended; CI uses **20.x**)

## Quick start

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows you can use `./scripts/dev-setup.ps1` after cloning to install dependencies and prepare the tree.

To bind a port explicitly, use the Next.js CLI directly:

```bash
npx next dev -p 3000
```

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production Next.js build |
| `npm run lint` | ESLint |
| `npm run start` | Serve production build (non-export) |

For explicit port in production mode:

```bash
npx next start -p 3000
```

## Admin generation security

Newsletter generation endpoints are protected. Configure these environment variables before using admin generation flows:

- `NEWSLETTER_ADMIN_TOKEN`: bearer token for privileged API calls to `/api/newsletter/generate`.
- `NEWSLETTER_INGEST_TOKEN`: bearer token or API key for external service ingestion via `/api/newsletter/import` or `/api/ingest`.
- `NEWSLETTER_ADMIN_UI_PASSWORD`: password required by `/api/newsletter/admin-generate` and the Admin Tools panel in `/newsletter`.
- `CRON_SECRET`: authorization secret for `/api/cron/generate-newsletter`.

`npm install` / `npm ci` runs **postinstall**, which executes `scripts/write-icons.js` and writes raster icons under `public/` (`favicon.ico`, PNG favicons, `apple-touch-icon.png`, `og-image.png`). Those files are required for metadata and social previews; do not delete the script without replacing the assets.

## Runtime environment

The production app is a server-backed Next.js deployment. Configure these environment variables in Vercel and in local development when using the associated features:

- `GEMINI_API_KEY`: required for newsletter generation and admin generation flows.
- `POSTGRES_URL`: required for the newsletter and content persistence layer; this project is now configured for Neon Postgres in Vercel.
- `CRON_SECRET`: required by the scheduled newsletter generation endpoint.

## External ingestion API

External services, scripts, and content pipelines can populate the database via `POST /api/newsletter/import` (or alias `POST /api/ingest`).

### Authentication
Include either a Bearer token or `x-api-key` header:
- `NEWSLETTER_INGEST_TOKEN`: dedicated token for external service ingestion (recommended).
- `NEWSLETTER_ADMIN_TOKEN`: accepted as fallback secret.

```http
Authorization: Bearer <NEWSLETTER_INGEST_TOKEN>
# or
x-api-key: <NEWSLETTER_INGEST_TOKEN>
```

### Ingestion formats

1. **Structured JSON with articles:**
```json
{
  "weekStart": "November 7, 2026",
  "weekEnd": "November 14, 2026",
  "overview": "Summary of breakthroughs this week...",
  "model": "external-crawler",
  "articles": [
    {
      "title": "Breakthrough in Multimodal Reasoning",
      "summary": "Key summary points...",
      "content": "Full article content...",
      "category": "Major Breakthroughs & Research",
      "author": "Research Team",
      "publication": "Tech Daily",
      "imageUrl": "https://example.com/image.jpg",
      "sourceUrl": "https://example.com/article"
    }
  ]
}
```

2. **Raw markdown content:**
```json
{
  "weekStart": "November 7, 2026",
  "weekEnd": "November 14, 2026",
  "content": "# AI & GenAI Weekly\n\n## 1. Overview\n...\n\n## 2. Article Title\n..."
}
```

Missing thumbnail images are automatically populated using Unsplash or site fallbacks. Successful ingestion triggers operational and subscriber notifications unless disabled with `"notify": false`.

## Notification channels

Newsletter generation (cron, admin, and token-triggered) sends operational alerts through any configured channel. All channels are optional; if none are set, notifications are logged to the console (visible in Vercel logs).

- `RESEND_API_KEY`: enables email alerts via the Resend HTTP API.
- `NOTIFICATION_EMAIL_FROM`: sender address for email alerts (e.g. `The Synthesis <no-reply@example.com>`).
- `NOTIFICATION_EMAIL_TO`: recipient address for email alerts.
- `SLACK_WEBHOOK_URL`: incoming webhook URL for Slack alerts.
- `WEBHOOK_URL`: generic webhook URL that receives the full notification payload as JSON.

The deployment path used in CI and production is `npm run build` followed by `npm run start` on a running Next.js server. This repository no longer treats `out/` as a release artifact for validation.

## Deployment model and CI

The repository is standardized on **server-backed Next.js deployment**. API routes under `app/api/`, scheduled generation in `vercel.json`, and the Drizzle/Postgres data layer all require a running Next.js server.

The [GitHub Actions workflow](.github/workflows/ci.yml) validates the same path used in production: lint, typecheck, `npm run build`, boot the app with `npm run start`, then run HTTP smoke and accessibility checks against the live server.

## Repo map

- `app/` — routes and layouts  
- `components/` — UI and layout  
- `lib/` — data, metadata, utilities  
- `public/` — static assets (SVG icons committed; PNG/ICO from postinstall)  
- `scripts/` — smoke checks, local utilities, icon generation  

## Contributing

See **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

## License

MIT — described in **[DOCUMENTATION.md](./DOCUMENTATION.md)**.
