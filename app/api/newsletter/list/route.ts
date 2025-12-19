import { NextResponse } from 'next/server';
import { newsletterDb } from '@/lib/db/newsletterDbService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/list
 * Get a list of all newsletters (paginated)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    const newsletters = await newsletterDb.listNewsletters(limit, offset);
    const totalCount = await newsletterDb.getNewsletterCount();
    
    return NextResponse.json({
      success: true,
      newsletters,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });
    
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch newsletters'
    }, { status: 500 });
  }
}
