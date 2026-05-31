import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/[id]
 * Get a specific newsletter by ID with all articles
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'newsletter-id',
    limit: 120,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = createRequestId();

  try {
    const { id } = await params;
    const newsletter = await newsletterDb.getNewsletterById(id);
    
    if (!newsletter) {
      return NextResponse.json({
        success: false,
        error: 'Newsletter not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      newsletter: newsletterDb.toApiFormat(newsletter)
    });
    
  } catch (error) {
    console.error(`[${requestId}] Error fetching newsletter:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch newsletter',
      requestId,
    }, { status: 500 });
  }
}
