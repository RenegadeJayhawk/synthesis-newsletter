import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/subscribe
 * Add a new email address to the newsletter subscribers list
 */
export async function POST(request: Request) {
  const requestId = createRequestId();

  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email ? body.email.toLowerCase().trim() : '';

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required', requestId },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format', requestId },
        { status: 400 }
      );
    }

    // Apply strict rate limiting on email subscription requests to prevent bot signups
    const rateLimitResponse = applyRateLimit(request, {
      key: `subscribe-${email}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    await newsletterDb.addSubscriber(email);

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to The Synthesis!',
      requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] Subscription error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error occurred', requestId },
      { status: 500 }
    );
  }
}
