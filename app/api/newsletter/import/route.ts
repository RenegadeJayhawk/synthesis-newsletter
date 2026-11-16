import { NextResponse } from 'next/server';
import { applyRateLimit, createRequestId, requireApiSecret } from '@/lib/apiSecurity';
import { getDatabaseHealth, newsletterDb } from '@/lib/db/newsletterDbService';
import { parseNewsletter } from '@/lib/newsletterParser';
import { addImagesToArticles } from '@/lib/imageService';
import { notificationService } from '@/lib/notificationService';
import type { NewsletterArticle, ParsedNewsletter } from '@/types/newsletter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type IngestArticleInput = {
  id?: string;
  title: string;
  summary: string;
  content?: string;
  category?: string;
  author?: string;
  publication?: string;
  imageUrl?: string;
  sourceUrl?: string;
  externalLink?: string;
  metadata?: Record<string, unknown>;
};

export type IngestNewsletterBody = {
  weekStart: string;
  weekEnd: string;
  title?: string;
  content?: string;
  overview?: string;
  model?: string;
  generatedAt?: string;
  notify?: boolean;
  articles?: IngestArticleInput[];
};

function buildMarkdownFromArticles(
  weekStart: string,
  weekEnd: string,
  overview: string | undefined,
  articles: NewsletterArticle[]
): string {
  let md = `# AI & GenAI Weekly: ${weekStart} - ${weekEnd}\n\n`;
  if (overview && overview.trim()) {
    md += `## 1. Overview\n${overview.trim()}\n\n`;
  }
  articles.forEach((art, index) => {
    md += `## ${index + 2}. ${art.title}\n`;
    if (art.category) {
      md += `**Category:** ${art.category}\n\n`;
    }
    if (art.summary) {
      md += `${art.summary}\n\n`;
    }
    if (art.content && art.content !== art.summary) {
      md += `${art.content}\n\n`;
    }
    const sourceParts = [art.author, art.metadata?.publication || art.metadata?.organization].filter(Boolean);
    if (sourceParts.length > 0) {
      md += `*Source: ${sourceParts.join(' | ')}*\n\n`;
    }
    if (art.sourceUrl) {
      md += `[Read More](${art.sourceUrl})\n\n`;
    }
  });
  return md.trim();
}

/**
 * POST /api/newsletter/import
 * Ingests a newsletter and articles from an external service.
 * Supports both raw markdown (content) and structured JSON (articles array).
 */
export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, {
    key: 'newsletter-import',
    limit: 30,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Accepts either NEWSLETTER_INGEST_TOKEN (preferred) or NEWSLETTER_ADMIN_TOKEN (fallback)
  const authResponse = requireApiSecret(request, ['NEWSLETTER_INGEST_TOKEN', 'NEWSLETTER_ADMIN_TOKEN']);
  if (authResponse) {
    return authResponse;
  }

  const requestId = createRequestId();

  let body: IngestNewsletterBody;
  try {
    body = (await request.json()) as IngestNewsletterBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON request body.',
        requestId,
      },
      { status: 400 }
    );
  }

  // Validate required date range
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Request body must be a JSON object.', requestId },
      { status: 400 }
    );
  }

  const weekStart = typeof body.weekStart === 'string' ? body.weekStart.trim() : '';
  const weekEnd = typeof body.weekEnd === 'string' ? body.weekEnd.trim() : '';

  if (!weekStart || !weekEnd) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields: 'weekStart' and 'weekEnd' are required.",
        requestId,
      },
      { status: 400 }
    );
  }

  const hasArticles = Array.isArray(body.articles) && body.articles.length > 0;
  const hasContent = typeof body.content === 'string' && body.content.trim().length > 0;

  if (!hasArticles && !hasContent) {
    return NextResponse.json(
      {
        success: false,
        error: "Either 'content' (raw markdown) or non-empty 'articles' array must be provided.",
        requestId,
      },
      { status: 400 }
    );
  }

  // Check storage readiness
  const dbHealth = getDatabaseHealth();
  if (!dbHealth.ready) {
    return NextResponse.json(
      {
        success: false,
        error: 'Newsletter persistence is not configured. Set POSTGRES_URL before importing.',
        requestId,
        health: dbHealth,
      },
      { status: 503 }
    );
  }

  try {
    const model = body.model?.trim() || 'external-service';
    const title = body.title?.trim() || `AI & GenAI Weekly: ${weekStart} - ${weekEnd}`;
    const generatedAtDate = body.generatedAt ? new Date(body.generatedAt) : new Date();
    const generatedAtIso = isNaN(generatedAtDate.getTime()) ? new Date().toISOString() : generatedAtDate.toISOString();

    let parsedNewsletter: ParsedNewsletter;

    if (hasArticles) {
      // Validate individual articles
      for (let i = 0; i < body.articles!.length; i += 1) {
        const art = body.articles![i];
        if (!art.title || typeof art.title !== 'string' || !art.title.trim()) {
          return NextResponse.json(
            { success: false, error: `Article at index ${i} is missing a valid 'title'.`, requestId },
            { status: 400 }
          );
        }
        if (!art.summary || typeof art.summary !== 'string' || !art.summary.trim()) {
          return NextResponse.json(
            { success: false, error: `Article at index ${i} ('${art.title}') is missing a valid 'summary'.`, requestId },
            { status: 400 }
          );
        }
      }

      const mappedArticles: NewsletterArticle[] = body.articles!.map((art, index) => ({
        id: art.id || `art-${index + 1}-${Math.random().toString(36).slice(2, 9)}`,
        title: art.title.trim(),
        summary: art.summary.trim(),
        content: art.content?.trim() || art.summary.trim(),
        category: art.category?.trim() || 'General',
        author: art.author?.trim(),
        imageUrl: art.imageUrl?.trim(),
        sourceUrl: art.sourceUrl?.trim() || art.externalLink?.trim(),
        metadata: {
          ...(art.metadata || {}),
          publication: art.publication?.trim() || (art.metadata?.publication as string | undefined),
        },
      }));

      // Enrich images if needed
      const articlesWithImages = await addImagesToArticles(mappedArticles);

      const content = hasContent
        ? body.content!.trim()
        : buildMarkdownFromArticles(weekStart, weekEnd, body.overview, articlesWithImages);

      parsedNewsletter = {
        id: '',
        title,
        weekStart,
        weekEnd,
        overview: body.overview?.trim() || '',
        articles: articlesWithImages,
        generatedAt: generatedAtIso,
        model,
        rawContent: content,
      };
    } else {
      // Parse markdown content
      const rawContent = body.content!.trim();
      const parsed = parseNewsletter({
        id: '',
        title,
        weekStart,
        weekEnd,
        content: rawContent,
        generatedAt: generatedAtIso,
        model,
      });

      if (body.overview?.trim()) {
        parsed.overview = body.overview.trim();
      }

      const articlesWithImages = await addImagesToArticles(parsed.articles);
      parsed.articles = articlesWithImages;
      parsedNewsletter = parsed;
    }

    // Persist newsletter and articles
    const saved = await newsletterDb.createNewsletter(
      {
        weekStart,
        weekEnd,
        content: parsedNewsletter.rawContent || '',
        model: parsedNewsletter.model,
        generatedAt: new Date(generatedAtIso),
      },
      parsedNewsletter
    );

    const completeNewsletter = await newsletterDb.getNewsletterById(saved.id);
    const apiNewsletter = completeNewsletter
      ? newsletterDb.toApiFormat(completeNewsletter)
      : {
          id: saved.id,
          title,
          weekStart: saved.weekStart,
          weekEnd: saved.weekEnd,
          overview: saved.overview || '',
          articles: parsedNewsletter.articles,
          generatedAt: saved.generatedAt.toISOString(),
          model: saved.model,
        };

    // Trigger notification unless explicitly opted out
    if (body.notify !== false) {
      try {
        await notificationService.sendSuccess(
          'Newsletter Imported Successfully',
          `Weekly newsletter for ${apiNewsletter.weekStart} - ${apiNewsletter.weekEnd} has been imported from an external service.`,
          {
            newsletterId: apiNewsletter.id,
            articleCount: apiNewsletter.articles.length,
            source: model,
          }
        );
      } catch (notifyErr) {
        console.warn(`[${requestId}] Failed to deliver import notification:`, notifyErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        newsletter: apiNewsletter,
        requestId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[${requestId}] Error importing newsletter:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import newsletter.',
        requestId,
      },
      { status: 500 }
    );
  }
}
