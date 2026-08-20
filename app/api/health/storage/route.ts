import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health/storage
 * Provides safe operational status for newsletter persistence. It deliberately
 * excludes database URLs, driver errors, credentials, table data, and row counts.
 */
export async function GET(request: Request) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'storage-health',
    limit: 30,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = createRequestId();
  const storage = await newsletterDb.probePersistence();

  return NextResponse.json(
    {
      success: storage.ready,
      component: 'newsletter-storage',
      storage,
      requestId,
    },
    {
      status: storage.ready ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
