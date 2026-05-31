import { NextResponse } from 'next/server';
import { applyRateLimit, createRequestId, requireBearerToken } from '@/lib/apiSecurity';
import { generateAndPersistNewsletter } from '@/lib/newsletterGeneration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/newsletter/generate
 * Generate a new newsletter, parse it, and save to database
 */
export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'newsletter-generate',
    limit: 6,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const authResponse = requireBearerToken(request, 'NEWSLETTER_ADMIN_TOKEN');
  if (authResponse) {
    return authResponse;
  }

  const requestId = createRequestId();

  try {
    const completeNewsletter = await generateAndPersistNewsletter();
    
    return NextResponse.json({
      success: true,
      newsletter: completeNewsletter,
    }, { status: 201 });
    
  } catch (error) {
    console.error(`[${requestId}] Error generating newsletter:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate newsletter',
      requestId,
    }, { status: 500 });
  }
}
