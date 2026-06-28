# Prioritized backlog

Ordered by impact on **ship readiness and trust** first, then **product completeness**, then **hygiene**. Items below reflect the current full-site audit and assume a **server-backed Next.js + Vercel** deployment model.

---

## P0 — Deployment and integrity blockers

| ID | Item | Notes |
|----|------|--------|
| P0-1 | Standardize on **server-backed deployment** | Remove static-export assumptions from CI and docs; production path is `npm run build` + `npm run start` on Vercel. |
| P0-2 | Keep **build, lint, and typecheck green** | Missing dependencies are restored; maintain `lint`, `tsc`, and `build` together as the release gate. |
| P0-3 | Remove or quarantine **stale `out/` validation** | Legacy export artifacts can mask broken routes; do not treat `out/` as release validation for this app. |
| P0-4 | Document required **runtime environment** | Maintain `GEMINI_API_KEY`, `POSTGRES_URL`, cron behavior, and deployment expectations in docs. |

---

## P1 — Missing pages and broken promises

| ID | Item | Notes |
|----|------|--------|
| P1-1 | Add real **Articles** page | Header/footer link exists, but no source route currently owns `/articles`. |
| P1-2 | Add real **About** page | Header/footer link exists, but no source route currently owns `/about`. |
| P1-3 | Add **Contact** page and form | Footer exposes `/contact`; implement form submission, validation, and success/error states. |
| P1-4 | Add **Privacy** and **Terms** pages | Legal/footer links currently promise content that is not defined in source routes. |
| P1-5 | Add **category archive pages** | Footer links to `/category/*`; route family and data model are missing. |

---

## P2 — Product behavior (user-visible gaps)

| ID | Item | Notes |
|----|------|--------|
| P2-1 | Implement **header search** | **Completed:** Full dynamic search querying database and mock articles, fixed Enter submit keydown navigation in header. |
| P2-2 | Wire **Subscribe** across header, footer, and CTA sections | **Completed:** Created `subscribers` DB table, POST `/api/subscribe` endpoint, and integrated unified AJAX `<SubscribeForm>` component across Footer, Homepage, Archive, and Article Sidebar. |
| P2-3 | Harden **newsletter generation UX** | Disable duplicate submits, expose clearer empty-state copy, and handle backend failures with actionable messaging. |
| P2-4 | **Analytics: integrate or delete** | If keeping: load provider script, route page views, and track newsletter/signup conversion events. |

---

## P3 — SEO and discoverability (after P0 assets)

| ID | Item | Notes |
|----|------|--------|
| P3-1 | Add **robots.txt** | Match the production domain and disallow only non-public surfaces. |
| P3-2 | Add **sitemap** | Dynamically generate `/sitemap.xml` compiling static pages, category pages, and database articles. |
| P3-3 | Verify **canonical/site identity** | Replace placeholder social links and confirm production domain in metadata. |

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
