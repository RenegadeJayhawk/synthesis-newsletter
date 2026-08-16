# Prioritized backlog

Ordered by impact on **ship readiness and trust** first, then **product completeness**, then **hygiene**. Items below reflect the current full-site audit and assume a **server-backed Next.js + Vercel** deployment model.

---

## P0 — Deployment and integrity blockers

| ID | Item | Notes |
|----|------|--------|
| P0-1 | Standardize on **server-backed deployment** | **Completed:** Production path is `npm run build` + `npm run start` on Vercel; docs and CI now reflect the supported server-backed model. |
| P0-2 | Keep **build, lint, and typecheck green** | **Completed:** Release gate remains `lint`, `tsc`, and `build`; all three currently pass. |
| P0-3 | Remove or quarantine **stale `out/` validation** | **Completed:** Release validation now checks source routes directly; `out/` is no longer part of the gate. |
| P0-4 | Document required **runtime environment** | **Completed:** `README.md` now lists `GEMINI_API_KEY`, `POSTGRES_URL`, and `CRON_SECRET` alongside the deployment path. |

---

## P1 — Missing pages and broken promises

| ID | Item | Notes |
|----|------|--------|
| P1-1 | Add real **Articles** page | **Completed:** `/articles` now exists in source and ships in the current app. |
| P1-2 | Add real **About** page | **Completed:** `/about` now exists in source and ships in the current app. |
| P1-3 | Add **Contact** page and form | **Completed:** `/contact` exists; form flow is implemented in the current project. |
| P1-4 | Add **Privacy** and **Terms** pages | **Completed:** `/privacy` and `/terms` now exist in source. |
| P1-5 | Add **category archive pages** | **Completed:** `/category/*` routes now exist in source. |

---

## P2 — Product behavior (user-visible gaps)

| ID | Item | Notes |
|----|------|--------|
| P2-1 | Implement **header search** | **Completed:** Full dynamic search querying database and mock articles, fixed Enter submit keydown navigation in header. |
| P2-2 | Wire **Subscribe** across header, footer, and CTA sections | **Completed:** Created `subscribers` DB table, POST `/api/subscribe` endpoint, and integrated unified AJAX `<SubscribeForm>` component across Footer, Homepage, Archive, and Article Sidebar. |
| P2-3 | Harden **newsletter generation UX** | **Completed:** Refresh and admin generation now guard duplicate submits, preserve the current issue during refresh, and surface actionable empty-state and failure messaging. |
| P2-4 | **Analytics: integrate or delete** | If keeping: load provider script, route page views, and track newsletter/signup conversion events. |

---

## P3 — SEO and discoverability (after P0 assets)

| ID | Item | Notes |
|----|------|--------|
| P3-1 | Add **robots.txt** | **Completed:** `app/robots.ts` is present and serves the site robots file. |
| P3-2 | Add **sitemap** | **Completed:** `app/sitemap.ts` is present and serves the site sitemap. |
| P3-3 | Verify **canonical/site identity** | Replace placeholder social links and confirm production domain in metadata. |

---

## P5 — Consolidated future work

| ID | Item | Notes |
|----|------|--------|
| P5-1 | Add durable **newsletter persistence and data hardening** | Replace in-memory fallback with persistent storage, add health checks/retry handling, and consider Redis/cache support. Sources: `PROJECT_RESTORATION_SUMMARY.md`, `DATABASE_IMPLEMENTATION.md`, `DATABASE_TECHNICAL_OVERVIEW.md`. |
| P5-2 | Add **generation protection and operational controls** | Restrict newsletter/admin generation with auth, add API rate limiting, and harden cron behavior. Sources: `PROJECT_RESTORATION_SUMMARY.md`, `DATABASE_TECHNICAL_OVERVIEW.md`, `AUTOMATED_GENERATION.md`. |
| P5-3 | Add **email delivery and notification channels** | Send newsletters and operational alerts via email, Slack, or webhooks. Sources: `PROJECT_RESTORATION_SUMMARY.md`, `AUTOMATED_GENERATION.md`, `DEPLOYMENT_SUCCESS.md`. |
| P5-4 | Add **analytics and usage tracking** | Track views, engagement, and operational cost/usage signals. Sources: `PROJECT_RESTORATION_SUMMARY.md`, `DEPLOYMENT_SUCCESS.md`, `DATABASE_TECHNICAL_OVERVIEW.md`. |
| P5-5 | Add **discovery and content tooling** | Full-text search, category/date filters, bookmarking, trending/related articles, and social sharing. Sources: `DATABASE_IMPLEMENTATION.md`, `MSNOW_SUCCESS_FINAL.md`. |
| P5-6 | Improve **image pipeline and visual polish** | Unsplash integration, AI image generation, image caching, and category color treatments. Source: `MSNOW_SUCCESS_FINAL.md`. |

---

## P4 — Hygiene and maintainability

| ID | Item | Notes |
|----|------|--------|
| P4-1 | Relocate or remove **`app/page-animated-backup.tsx`** | Keep out of App Router tree if retained. |
| P4-2 | Fix **`PageWrapper` props typing** | e.g. `children: ReactNode` on the interface. |
| P4-3 | Add **`LICENSE`** | If repo is or will be shared/open. |
| P4-4 | Enable **Dependabot or Renovate** | Scheduled dependency PRs. |
| P4-5 | Add **smoke E2E** | Cover home, one article, newsletter, and one real top-level info page against a running Next server. |
| P4-6 | **CSP** (when adding third-party scripts) | Tighten `next.config.js` headers after analytics/embeds exist. |
| P4-7 | Resolve **React 19 peer warnings** | `react-spring` transitive peers still target React 18. Audit before upgrading UI/runtime dependencies further. |

---

## Suggested next sprint

1. P1-1 through P1-4  
2. P2-2  
3. P2-4  
4. P3-1 through P3-3  

---

*Updated from the full-site audit; revise statuses as pages and integrations land.*
