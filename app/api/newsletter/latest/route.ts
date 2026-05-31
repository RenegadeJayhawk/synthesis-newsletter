import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/latest
 * Get the most recently generated newsletter with articles
 */
export async function GET(request: Request) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'newsletter-latest',
    limit: 120,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = createRequestId();

  try {
    const newsletter = await newsletterDb.getLatestNewsletter();
    
    if (!newsletter) {
      return NextResponse.json({
        success: false,
        error: 'No newsletters found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      newsletter: newsletterDb.toApiFormat(newsletter)
    });
    
  } catch (error) {
    console.error(`[${requestId}] Error fetching latest newsletter:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch newsletter',
      requestId,
    }, { status: 500 });
  }
}
