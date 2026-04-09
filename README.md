# The Synthesis — newsletter site

Static-exported [Next.js 15](https://nextjs.org/) site for **The Synthesis**, an AI newsletter experience (App Router, TypeScript, Tailwind CSS). Full product notes, structure, and troubleshooting live in **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

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
| `npm run build` | Production build (static export only if `BUILD_EXPORT=1`) |
| `npm run build:export` | Static export build (`out/`) |
| `npm run lint` | ESLint |
| `npm run check:export` | Validate links in exported HTML |
| `npm run start` | Serve production build (non-export) |

`npm install` / `npm ci` runs **postinstall**, which executes `scripts/write-icons.js` and writes raster icons under `public/` (`favicon.ico`, PNG favicons, `apple-touch-icon.png`, `og-image.png`). Those files are required for metadata and social previews; do not delete the script without replacing the assets.

## Static export and CI

Local dev normally runs **without** `output: 'export'`. For CI and static hosting, set `BUILD_EXPORT=1` so `next.config.js` enables static export.

**Windows (PowerShell):**

```powershell
$env:BUILD_EXPORT = '1'
npm run build
```

**macOS / Linux:**

```bash
BUILD_EXPORT=1 npm run build
```

The [GitHub Actions workflow](.github/workflows/ci.yml) typechecks, runs a static export, checks links, runs manifest tests, HTTP probes, and accessibility checks. Custom headers from `next.config.js` are not applied by static hosts; configure them at your CDN if needed.

## Repo map

- `app/` — routes and layouts  
- `components/` — UI and layout  
- `lib/` — data, metadata, utilities  
- `public/` — static assets (SVG icons committed; PNG/ICO from postinstall)  
- `scripts/` — export checks, local server, icon generation  

## Contributing

See **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

## License

MIT — described in **[DOCUMENTATION.md](./DOCUMENTATION.md)**.
