import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/[id]
 * Get a specific newsletter by ID with all articles
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsletter = await newsletterDb.getNewsletterById(id);
    
    if (!newsletter) {
      return NextResponse.json({
        success: false,
        error: 'Newsletter not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      newsletter: newsletterDb.toApiFormat(newsletter)
    });
    
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch newsletter'
    }, { status: 500 });
  }
}
