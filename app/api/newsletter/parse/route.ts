import { NextRequest, NextResponse } from 'next/server';
import { parseNewsletter } from '@/lib/newsletterParser';
import { addImagesToArticles } from '@/lib/imageService';
import { Newsletter } from '@/lib/newsletterService';

export async function POST(request: NextRequest) {
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
    console.error('Error parsing newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse newsletter' 
      },
      { status: 500 }
    );
  }
}
