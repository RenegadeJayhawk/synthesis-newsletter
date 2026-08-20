# Storage recovery evidence

- Date: 2026-08-20
- Active Vercel project: `alphauzers-projects/synthesis-newsletter`.
- `POSTGRES_URL` exists as a sensitive project variable scoped to **Production and Preview**.
- The project Storage view has no connected Vercel-managed databases, so this variable points to an externally managed database (consistent with Neon).
- Public probe: `https://synthesis-newsletter.vercel.app/api/health/storage` returned HTTP 503 with `configured: true`, `reachable: true`, and `schemaReady: false`.
- Conclusion: Vercel can connect to the configured database, but one or more required tables (`newsletters`, `articles`, `subscribers`) are absent from the connected public schema. The required idempotent schema is in `db/init.sql`.

The Vercel browser session later confirmed the project variable exists and is scoped correctly. Attempts to open the Neon project console reached its sign-in page, but the session is not authenticated with Neon. A browser reset/proxy interruption occurred during navigation; retrying the Neon root now again presents its login screen.
