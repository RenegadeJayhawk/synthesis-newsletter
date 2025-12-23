import { NextRequest, NextResponse } from 'next/server';
import { createNewsletter } from '@/lib/newsletterService';
import { parseNewsletter } from '@/lib/newsletterParser';
import { addImagesToArticles } from '@/lib/imageService';
import { newsletterDb } from '@/lib/db/newsletterDbService';
import { cronLogger } from '@/lib/cronLogger';
import { notificationService } from '@/lib/notificationService';

/**
 * Vercel Cron endpoint for automated newsletter generation
 * Schedule: Every Monday at 9:00 AM UTC (configured in vercel.json)
 * 
 * Security: Vercel Cron requests include a special authorization header
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      cronLogger.error('CRON_SECRET environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== expectedAuth) {
      cronLogger.error('Unauthorized cron request attempt', {
        authHeader: authHeader ? 'present' : 'missing',
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    cronLogger.info('Starting automated newsletter generation');

    // Generate newsletter content
    cronLogger.info('Generating newsletter content with AI');
    const newsletter = await createNewsletter();
    
    if (!newsletter) {
      throw new Error('Newsletter generation failed - no content returned');
    }

    cronLogger.success('Newsletter content generated', {
      weekStart: newsletter.weekStart,
      weekEnd: newsletter.weekEnd,
      model: newsletter.model,
    });

    // Parse newsletter into structured articles
    cronLogger.info('Parsing newsletter content into articles');
    const parsed = parseNewsletter(newsletter);
    cronLogger.success(`Parsed ${parsed.articles.length} articles from newsletter`);

    // Add images to articles
    cronLogger.info('Adding images to articles');
    const articlesWithImages = await addImagesToArticles(parsed.articles);
    cronLogger.success(`Images added to ${articlesWithImages.length} articles`);

    // Save to database
    cronLogger.info('Saving newsletter to database');
    const savedNewsletter = await newsletterDb.createNewsletter(
      {
        weekStart: newsletter.weekStart,
        weekEnd: newsletter.weekEnd,
        content: newsletter.content,
        model: newsletter.model,
      },
      {
        ...parsed,
        articles: articlesWithImages,
      }
    );

    const duration = Date.now() - startTime;
    
    cronLogger.success('Newsletter saved successfully', {
      id: savedNewsletter.id,
      articleCount: articlesWithImages.length,
      duration: `${duration}ms`,
    });

    // Send success notification
    await notificationService.sendSuccess(
      'Newsletter Generated Successfully',
      `Weekly newsletter for ${savedNewsletter.weekStart} - ${savedNewsletter.weekEnd} has been generated and saved.`,
      {
        newsletterId: savedNewsletter.id,
        articleCount: articlesWithImages.length,
        duration: `${duration}ms`,
        generatedAt: savedNewsletter.generatedAt,
      }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Newsletter generated and saved successfully',
      newsletter: {
        id: savedNewsletter.id,
        weekStart: savedNewsletter.weekStart,
        weekEnd: savedNewsletter.weekEnd,
        articleCount: articlesWithImages.length,
        generatedAt: savedNewsletter.generatedAt,
      },
      duration: `${duration}ms`,
      logs: cronLogger.getRecentLogs(5),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    cronLogger.error('Newsletter generation failed', {
      error: errorMessage,
      duration: `${duration}ms`,
    });

    // Send error notification
    await notificationService.sendError(
      'Newsletter Generation Failed',
      `Automated newsletter generation failed: ${errorMessage}`,
      {
        error: errorMessage,
        stack: errorStack,
        duration: `${duration}ms`,
      }
    );
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate newsletter',
        message: errorMessage,
        duration: `${duration}ms`,
        logs: cronLogger.getRecentLogs(10),
      },
      { status: 500 }
    );
  }
}
