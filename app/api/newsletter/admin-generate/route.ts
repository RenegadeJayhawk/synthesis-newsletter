import { NextResponse } from 'next/server';
import { applyRateLimit, createRequestId, validateSecretValue } from '@/lib/apiSecurity';
import { generateAndPersistNewsletter } from '@/lib/newsletterGeneration';

type AdminGenerateBody = {
  adminPassword?: string;
};

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'newsletter-admin-generate',
    limit: 6,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = createRequestId();

  try {
    const body = (await request.json()) as AdminGenerateBody;
    const authState = validateSecretValue(body.adminPassword || '', 'NEWSLETTER_ADMIN_UI_PASSWORD');

    if (authState === 'missing') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin generation is not configured.',
          requestId,
        },
        { status: 503 }
      );
    }

    if (authState === 'invalid') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized.',
          requestId,
        },
        { status: 401 }
      );
    }

    const newsletter = await generateAndPersistNewsletter();

    return NextResponse.json(
      {
        success: true,
        newsletter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[${requestId}] Error in admin newsletter generation:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate newsletter.',
        requestId,
      },
      { status: 500 }
    );
  }
}
