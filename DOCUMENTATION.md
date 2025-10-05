


# The Synthesis - AI Newsletter Website

This is the repository for "The Synthesis," a high-end AI newsletter website built with Next.js 15. The project focuses on delivering a premium digital magazine experience with a sophisticated design, rich media, and advanced animations.

## Features

- **Modern Tech Stack:** Built with Next.js 15, TypeScript, and Tailwind CSS.
- **Advanced Animations:** Smooth page transitions and interactive elements using Framer Motion.
- **Generative Art:** Dynamic 3D background animations with React Three Fiber.
- **Content-Focused Design:** A clean, professional layout that prioritizes readability and user experience.
- **Responsive Design:** Fully responsive and optimized for all screen sizes, from mobile to desktop.
- **SEO Optimized:** Comprehensive SEO and metadata for better search engine visibility.
- **Production-Ready:** Optimized for performance with a production-ready build.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- **Deployment:** Static export, deployable on any static hosting provider.

## Project Structure

```
/synthesis-newsletter
├── app/                      # Next.js App Router
│   ├── [slug]/page.tsx       # Dynamic article page
│   ├── archive/page.tsx      # Archive page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/               # Reusable components
│   ├── article/              # Article-related components
│   ├── generative/           # Generative art components
│   ├── layout/               # Layout components (Header, Footer)
│   └── ui/                   # UI components (buttons, etc.)
├── lib/                      # Library files
│   ├── analytics.ts          # Analytics and performance tracking
│   ├── data.ts               # Mock data for articles
│   └── metadata.ts           # SEO and metadata configuration
├── animations/               # Framer Motion animation variants
├── public/                   # Static assets (images, fonts)
├── next.config.js            # Next.js configuration
└── README.md                 # This file
```

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd synthesis-newsletter
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Building for Production

To create a production-ready build, run:

```bash
npm run build
```

This will create a static export in the `out` directory, which can be deployed to any static hosting service.

## Deployment

The website is deployed as a static site. You can use any static hosting provider like Vercel, Netlify, or GitHub Pages.

## License

This project is licensed under the MIT License.

## Local development notes & troubleshooting

These notes collect common issues contributors may see when opening the project locally and how to resolve them.

- Node version: Use Node 18 or Node 20 (LTS). Verify with `node -v`.
- Always install dependencies before opening the project in VS Code so the TypeScript server can find types:

```powershell
# from project root
npm ci
```

- If you open the project in VS Code before running `npm ci`, the Problems panel may show errors like:
    `Cannot find type definition file for 'babel__core'` or `Cannot find type definition file for 'node'`.
    These are caused by missing packages in `node_modules` and are resolved by running `npm ci`.

- Dev server: The project uses Next 15 with Turbopack by default. Start with:

```powershell
npm run dev
# If you run into Turbopack-specific errors, try the fallback:
npx next dev
```

- Static export: `next.config.js` sets `output: 'export'`. That means dynamic routes must either:
    - provide `generateStaticParams()` that returns all route params, or
    - have an explicit static route for paths like `/articles`.

- Fix applied: An explicit `/articles` route was added at `app/articles/page.tsx` which re-uses the archive page. This avoids a runtime error of the form:

    `Page "/[slug]/page" is missing param "/[slug]" in "generateStaticParams()", which is required with "output: export" config.`

- WebGL / Three.js: If the generative art canvas fails to render, try a modern browser (Chrome / Edge / Firefox) and check the devtools console for WebGL errors. Ensure your GPU drivers are up to date.

- Restarting TypeScript in VS Code: If Problems persist after installing dependencies, reload VS Code or run the Command Palette → "TypeScript: Restart TS Server".

- Useful commands summary (PowerShell):

```powershell
# install deps
npm ci

# start dev server
npm run dev

# build for production
npm run build

# typecheck
npx tsc --noEmit
```

### Static export toggle and CI

To make local development easier while still supporting static export in CI/production, the project uses an environment toggle around `output: 'export'` in `next.config.js`.

- Locally (default): `BUILD_EXPORT` is not set, so Next runs in normal dev/server mode and you won't see strict export-only runtime errors.
- CI / Production export: set `BUILD_EXPORT=1` to enable static export. The provided GitHub Actions workflow runs the static export build with this env var set.

Examples:

```powershell
# Local dev (no static export)
npm run dev

# Production static export (Windows PowerShell)
$env:BUILD_EXPORT = '1'; npm run build

# Or on CI (Linux/macOS):
BUILD_EXPORT=1 npm run build
```

Notes:

- When exporting statically, Next will not apply `headers`, `rewrites`, or `redirects` defined via `next.config.js` at runtime. If you rely on custom headers or server-only behavior, consider applying them at your CDN/hosting layer when deploying the exported output.
- Keep `generateStaticParams()` up to date whenever you add dynamic content so exports include all pages.

If you'd like I can also add a small `scripts/dev-setup.ps1` that runs the Node check and `npm ci` automatically for new contributors.

