import { createNewsletter } from '@/lib/newsletterService';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { parseNewsletter } from '@/lib/newsletterParser';
import { addImagesToArticles } from '@/lib/imageService';

export async function generateAndPersistNewsletter() {
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

  return newsletterDb.toApiFormat(completeNewsletter);
}
