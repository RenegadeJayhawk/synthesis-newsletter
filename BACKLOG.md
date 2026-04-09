# Prioritized backlog

Ordered by impact on **trust (SEO, assets, CI)** first, then **product completeness**, then **hygiene**. Within a tier, smaller items are listed before larger ones.

---

## P0 — Fix broken or misleading surfaces (do first) — **done**

| ID | Item | Notes |
|----|------|--------|
| P0-1 | Align **public assets** with `lib/metadata.ts` and `site.webmanifest` | `scripts/write-icons.js` now emits `apple-touch-icon.png` and `og-image.png`; metadata + manifest point at committed/generated PNGs, ICO, and SVG. |
| P0-2 | Remove or replace **placeholder verification** in `lib/metadata.ts` | Placeholder `verification` block removed; add real keys when you have them. |
| P0-3 | **Rewrite root `README.md`** | Replaced boilerplate; links `DOCUMENTATION.md`, scripts, export toggle, CI. |

---

## P1 — Quality gates and CI correctness — **done**

| ID | Item | Notes |
|----|------|--------|
| P1-1 | Run **`npm run lint` in CI** | Lint step after `npm ci`; ESLint clean (scripts CJS override, `catch {}`, config/types fixes). |
| P1-2 | Run **`scripts/test/categories.test.js` in CI** | Runs after export + manifest + link check; test reads `lib/categories.ts` via regex (no broken `require` of `.ts`). |
| P1-3 | **Deduplicate export build** in `.github/workflows/ci.yml` | Single `npm run build:export`; manifest + `check:export` reuse that `out/`. |
| P1-4 | Align **Node version** | `engines.node` `>=18.18.0` in `package.json`; CI matrix `20.x`; `setup-node` npm cache enabled. |

---

## P2 — Product behavior (user-visible gaps)

| ID | Item | Notes |
|----|------|--------|
| P2-1 | Implement **header search** | Client filter, dedicated search page, or external search—pick one and document. |
| P2-2 | Wire **Subscribe** (header + newsletter flow) | Form action, email provider, or static-friendly service (e.g. embed). |
| P2-3 | Wire **contact form** | Same pattern as subscribe; include validation and success/error UX. |
| P2-4 | **Analytics: integrate or delete** | If keeping: `next/script`, env-based measurement ID, call `trackPageView` / events from the app. If not: remove unused `lib/analytics.ts` or stub clearly. |

---

## P3 — SEO and discoverability (after P0 assets)

| ID | Item | Notes |
|----|------|--------|
| P3-1 | Add **`public/robots.txt`** | Match production domain when known. |
| P3-2 | Add **sitemap** | Static `public/sitemap.xml` or build step from article slugs + static routes. |

---

## P4 — Hygiene and maintainability

| ID | Item | Notes |
|----|------|--------|
| P4-1 | Relocate or remove **`app/page-animated-backup.tsx`** | Keep out of App Router tree if retained. |
| P4-2 | Fix **`PageWrapper` props typing** | e.g. `children: ReactNode` on the interface. |
| P4-3 | Add **`LICENSE`** | If repo is or will be shared/open. |
| P4-4 | Enable **Dependabot or Renovate** | Scheduled dependency PRs. |
| P4-5 | Add **smoke E2E** (optional) | e.g. Playwright: home, one article, one category, against dev or `out/`. |
| P4-6 | **CSP** (when adding third-party scripts) | Tighten `next.config.js` headers after analytics/embeds exist. |

---

## Suggested first sprint (minimal path to “credible ship”)

1. P0-1, P0-2, P0-3  
2. P1-1, P1-2, P1-3  
3. P2-2 or P2-3 (whichever matters more for launch)  
4. P3-1, P3-2  

---

*Derived from codebase review; update IDs and order as items complete.*
