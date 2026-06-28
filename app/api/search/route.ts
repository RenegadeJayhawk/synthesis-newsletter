import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/search
 * Search articles across all newsletters
 */
export async function GET(request: Request) {
  // Extract query parameters from request URL
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  // Apply rate limiting based on the search query prefix to prevent API abuse
  const rateLimitResponse = applyRateLimit(request, {
    key: `search-${query.substring(0, 10)}`,
    limit: 100,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = createRequestId();

  try {
    // Fetch matching dynamic articles from PostgreSQL database or local mock fallback
    const dbArticles = await newsletterDb.searchArticles(query, 50);

    // Map database articles to the layout model format expected by the frontend search cards
    const formattedArticles = dbArticles.map((art) => ({
      id: art.id,
      title: art.title,
      summary: art.summary,
      category: art.category,
      author: art.author || 'The Synthesis Editorial',
      publication: art.publication || undefined,
      imageUrl: art.imageUrl || undefined,
      sourceUrl: `/archive/${art.newsletterId}`,
      createdAt: art.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      query,
      articles: formattedArticles,
    });
  } catch (error) {
    console.error(`[${requestId}] Error searching articles for query "${query}":`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search articles',
        requestId,
      },
      { status: 500 }
    );
  }
}
