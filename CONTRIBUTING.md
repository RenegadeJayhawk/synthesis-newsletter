# Contributing to The Synthesis

Thanks for your interest in contributing! This document covers how to get the project running locally and common checks to run before opening a PR.

## Local setup (Windows)
1. Install Node 18+ (LTS) and Git.
2. From the repo root, run the PowerShell helper:

```powershell
./scripts/dev-setup.ps1
```

3. Start the dev server:

```powershell
npm run dev
```

4. Open http://localhost:3000 and verify the site loads.

## Checks to run before PR
- `npx tsc --noEmit` (typechecking)
- `npm run lint` (linting)

CI runs: GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm ci` and `npx tsc --noEmit` on push and PR.

If you hit TypeScript "Cannot find type definition file" errors, ensure you ran `npm ci` first and restarted the TypeScript server in VS Code (Command Palette → "TypeScript: Restart TS Server").