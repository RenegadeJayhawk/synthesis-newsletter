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

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production Next.js build |
| `npm run lint` | ESLint |
| `npm run start` | Serve production build (non-export) |

`npm install` / `npm ci` runs **postinstall**, which executes `scripts/write-icons.js` and writes raster icons under `public/` (`favicon.ico`, PNG favicons, `apple-touch-icon.png`, `og-image.png`). Those files are required for metadata and social previews; do not delete the script without replacing the assets.

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
