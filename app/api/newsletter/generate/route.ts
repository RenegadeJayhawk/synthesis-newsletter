import { NextResponse } from 'next/server';
import { createNewsletter } from '@/lib/newsletterService';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { parseNewsletter } from '@/lib/newsletterParser';
import { addImagesToArticles } from '@/lib/imageService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/newsletter/generate
 * Generate a new newsletter, parse it, and save to database
 */
export async function POST() {
  try {
    console.log('Starting newsletter generation...');
    
    // Generate the newsletter content using Gemini
    const newsletter = await createNewsletter();
    
    console.log('Newsletter generated, parsing content...');
    
    // Parse the newsletter to extract articles
    const parsedNewsletter = parseNewsletter(newsletter);
    
    console.log(`Parsed ${parsedNewsletter.articles.length} articles from newsletter`);
    
    // Assign images to articles
    const articlesWithImages = await addImagesToArticles(parsedNewsletter.articles);
    parsedNewsletter.articles = articlesWithImages;
    
    console.log('Images assigned, saving to database...');
    
    // Save to database
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
    
    console.log('Newsletter saved successfully');
    
    // Fetch the complete newsletter with articles
    const completeNewsletter = await newsletterDb.getNewsletterById(savedNewsletter.id);
    
    if (!completeNewsletter) {
      throw new Error('Failed to retrieve saved newsletter');
    }
    
    return NextResponse.json({
      success: true,
      newsletter: newsletterDb.toApiFormat(completeNewsletter)
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error generating newsletter:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate newsletter'
    }, { status: 500 });
  }
}
