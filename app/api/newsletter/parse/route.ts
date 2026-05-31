import { NextRequest, NextResponse } from 'next/server';
import { parseNewsletter } from '@/lib/newsletterParser';
import { addImagesToArticles } from '@/lib/imageService';
import { Newsletter } from '@/lib/newsletterService';
import { applyRateLimit, createRequestId, requireBearerToken } from '@/lib/apiSecurity';

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'newsletter-parse',
    limit: 15,
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
    const body = await request.json();
    const { newsletter } = body as { newsletter: Newsletter };

    if (!newsletter || !newsletter.content) {
      return NextResponse.json(
        { success: false, error: 'Invalid newsletter data' },
        { status: 400 }
      );
    }

    // Parse the newsletter content into structured articles
    const parsed = parseNewsletter(newsletter);

    // Add images to articles
    const articlesWithImages = await addImagesToArticles(parsed.articles);

    // Return parsed newsletter with images
    return NextResponse.json({
      success: true,
      parsed: {
        ...parsed,
        articles: articlesWithImages,
      },
    });
  } catch (error) {
    console.error(`[${requestId}] Error parsing newsletter:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to parse newsletter',
        requestId,
      },
      { status: 500 }
    );
  }
}
