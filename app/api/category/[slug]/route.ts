import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { articles as staticArticles } from '@/lib/data';
import { applyRateLimit, createRequestId } from '@/lib/apiSecurity';
import { categories } from '@/lib/categories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const categorySlugs = categories.map((c) => c.slug);

function mapSlugToDbCategories(slug: string): string[] {
  switch (slug) {
    case 'ai':
      return [
        'Major Breakthroughs & Research',
        'New Applications & Use Cases',
        'Emerging Trends & Future Outlook',
        'Tools & Resources',
        'Artificial Intelligence',
      ];
    case 'ml':
      return ['Open Source Developments', 'Machine Learning'];
    case 'robotics':
      return ['Robotics'];
    case 'ethics':
      return ['Ethical Considerations & Societal Impact', 'AI Ethics', 'Ethics'];
    default:
      return [];
  }
}

function getStaticArticlesForSlug(slug: string) {
  return staticArticles
    .filter((art) => {
      const cat = art.category.toLowerCase();
      if (slug === 'ai') return cat.includes('intelligence') || cat.includes('technology');
      if (slug === 'ml') return cat.includes('learning') || cat.includes('machine');
      if (slug === 'robotics') return cat.includes('robot');
      if (slug === 'ethics') return cat.includes('ethics') || cat.includes('ethical');
      return false;
    })
    .map((art) => {
      // Parse date to ISO string safely, fallback to now if invalid
      let dateIso = new Date().toISOString();
      try {
        if (art.date) {
          const parsed = new Date(art.date);
          if (!Number.isNaN(parsed.getTime())) {
            dateIso = parsed.toISOString();
          }
        }
      } catch (e) {
        console.error('Error parsing static article date:', e);
      }

      return {
        id: `static-${art.slug}`,
        title: art.title,
        summary: art.excerpt,
        category: art.category,
        author: art.author,
        publication: 'The Synthesis Editorial',
        imageUrl: art.image,
        sourceUrl: `/${art.slug}`,
        createdAt: dateIso,
      };
    });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const rateLimitResponse = applyRateLimit(request, {
    key: `category-${slug}`,
    limit: 120,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = createRequestId();

  if (!categorySlugs.includes(slug)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Category not found',
        requestId,
      },
      { status: 404 }
    );
  }

  try {
    const dbCategories = mapSlugToDbCategories(slug);
    const dbArticles = await newsletterDb.getArticlesByCategories(dbCategories, 50);

    const formattedDbArticles = dbArticles.map((art) => ({
      id: art.id,
      title: art.title,
      summary: art.summary,
      category: art.category,
      author: art.author || undefined,
      publication: art.publication || undefined,
      imageUrl: art.imageUrl || undefined,
      sourceUrl: `/archive/${art.newsletterId}`,
      createdAt: art.createdAt.toISOString(),
    }));

    const staticArticlesData = getStaticArticlesForSlug(slug);

    // Combine both static editorial articles and dynamic newsletter articles
    const combinedArticles = [...formattedDbArticles, ...staticArticlesData];

    // Sort by date descending
    combinedArticles.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Get matching category name
    const categoryName = categories.find((c) => c.slug === slug)?.name || slug;

    return NextResponse.json({
      success: true,
      category: categoryName,
      articles: combinedArticles,
    });
  } catch (error) {
    console.error(`[${requestId}] Error fetching articles for category ${slug}:`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category articles',
        requestId,
      },
      { status: 500 }
    );
  }
}
