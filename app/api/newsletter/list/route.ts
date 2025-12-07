import { NextResponse } from 'next/server';
import { getAllNewsletters } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/list
 * Get all newsletters, sorted by date descending
 */
export async function GET() {
  try {
    const newsletters = await getAllNewsletters();
    
    return NextResponse.json({
      success: true,
      newsletters,
      count: newsletters.length
    });
    
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch newsletters'
    }, { status: 500 });
  }
}
