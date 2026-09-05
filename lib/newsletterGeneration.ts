import { createNewsletter } from '@/lib/newsletterService';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { parseNewsletter } from '@/lib/newsletterParser';
import { addImagesToArticles } from '@/lib/imageService';
import { notificationService } from '@/lib/notificationService';

export async function generateAndPersistNewsletter() {
  const persistenceReady = typeof newsletterDb.isPersistenceReady === 'function'
    ? newsletterDb.isPersistenceReady()
    : Boolean(process.env.POSTGRES_URL && process.env.POSTGRES_URL.trim());

  if (!persistenceReady) {
    throw new Error('Newsletter persistence is not configured. Set POSTGRES_URL to enable durable database storage.');
  }

  try {
    const newsletter = await createNewsletter();
    const parsedNewsletter = parseNewsletter(newsletter);
    const articlesWithImages = await addImagesToArticles(parsedNewsletter.articles);
    parsedNewsletter.articles = articlesWithImages;

    const savedNewsletter = await newsletterDb.createNewsletter(
      {
        weekStart: newsletter.weekStart,
        weekEnd: newsletter.weekEnd,
        content: newsletter.content,
        model: newsletter.model,
        generatedAt: new Date(newsletter.generatedAt),
      },
      parsedNewsletter
    );

    const completeNewsletter = await newsletterDb.getNewsletterById(savedNewsletter.id);
    if (!completeNewsletter) {
      throw new Error('Failed to retrieve saved newsletter');
    }

    const apiNewsletter = newsletterDb.toApiFormat(completeNewsletter);

    await notificationService.sendSuccess(
      'Newsletter Generated Successfully',
      `Weekly newsletter for ${apiNewsletter.weekStart} - ${apiNewsletter.weekEnd} has been generated and saved.`,
      {
        newsletterId: apiNewsletter.id,
        articleCount: apiNewsletter.articles.length,
        generatedAt: apiNewsletter.generatedAt,
      }
    );

    return apiNewsletter;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await notificationService.sendError(
      'Newsletter Generation Failed',
      `Newsletter generation failed: ${errorMessage}`,
      {
        error: errorMessage,
        stack: errorStack,
      }
    );

    throw error;
  }
}
