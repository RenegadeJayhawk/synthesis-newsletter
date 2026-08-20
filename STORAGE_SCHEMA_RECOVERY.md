# Newsletter Storage Schema Recovery

## Confirmed diagnosis

The live probe at `https://synthesis-newsletter.vercel.app/api/health/storage` returns the following safe status:

```json
{
  "success": false,
  "component": "newsletter-storage",
  "storage": {
    "configured": true,
    "reachable": true,
    "schemaReady": false
  }
}
```

This confirms that Vercel has a usable `POSTGRES_URL` and can reach the configured Postgres database. The outage is therefore **not** a missing environment variable, invalid network path, or application build problem. At least one required table is missing from the target database’s `public` schema.

## Safe recovery procedure

Use the **Neon SQL Editor** for the same database named in Vercel’s `POSTGRES_URL`, or any trusted PostgreSQL client with that connection string. The migration is idempotent: it uses `CREATE ... IF NOT EXISTS` and does not delete, truncate, alter, or overwrite newsletter data.

1. Open the `db/init.sql` file from this repository at the `main` branch.
2. In the Neon SQL Editor, confirm that the selected database is the one connected to the **synthesis-newsletter** Vercel project.
3. Paste the entire contents of `db/init.sql` and execute it once.
4. Run the verification query below. All three `exists` values must be `true`.
5. Open `https://synthesis-newsletter.vercel.app/api/health/storage`. A successful recovery returns HTTP 200 and `"ready": true`.
6. Open `https://synthesis-newsletter.vercel.app/api/newsletter/latest`. A correctly initialized but empty database returns HTTP 404 with `"No newsletters found"`; a previously populated database returns HTTP 200 with the current newsletter. Neither response should be HTTP 500 or 503.

```sql
SELECT
  to_regclass('public.newsletters') IS NOT NULL AS newsletters_exists,
  to_regclass('public.articles') IS NOT NULL AS articles_exists,
  to_regclass('public.subscribers') IS NOT NULL AS subscribers_exists;
```

## Expected outcomes

| Health result | Meaning | Next step |
|---|---|---|
| `200`, `ready: true` | Schema and connection are healthy. | Validate newsletter generation and subscription. |
| `503`, `configured: false` | `POSTGRES_URL` is absent in the deployed environment. | Add it to Vercel Production and redeploy. |
| `503`, `configured: true`, `reachable: false` | The URL is present but its database is inaccessible. | Check Neon project status, connection string, branch, and credentials. |
| `503`, `configured: true`, `reachable: true`, `schemaReady: false` | The target database is reachable but tables are missing. | Apply `db/init.sql` as described above. |
| `500` from `/api/newsletter/latest` after health is ready | The data path is failing despite a healthy schema. | Capture the returned request ID and inspect the server log; do not expose credentials. |

> **Do not create a new Vercel database or replace `POSTGRES_URL` while recovering this instance.** The existing URL already connects successfully; creating a replacement database risks pointing the app at a separate empty store instead of repairing the intended one.

## Exact migration source

The authoritative migration is [`db/init.sql`](./db/init.sql). It creates `newsletters`, `articles`, and `subscribers`; supporting indexes; the timestamp trigger function; and update triggers. The file is safe to run once on an empty database or re-run on an existing database, subject to normal PostgreSQL permissions.
