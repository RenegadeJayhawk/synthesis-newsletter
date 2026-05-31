import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/list
 * Get a list of all newsletters (paginated)
 */
export async function GET(request: Request) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'newsletter-list',
    limit: 120,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = createRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const requestedOffset = Number.parseInt(searchParams.get('offset') || '0', 10);

    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;
    
    const newsletters = await newsletterDb.listNewsletters(limit, offset);
    const totalCount = await newsletterDb.getNewsletterCount();
    
    return NextResponse.json({
      success: true,
      newsletters,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Error fetching newsletters:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch newsletters',
      requestId,
    }, { status: 500 });
  }
}
