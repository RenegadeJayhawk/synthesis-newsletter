import { NextResponse } from 'next/server';
import { getLatestNewsletter } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/latest
 * Get the most recently generated newsletter
 */
export async function GET() {
  try {
    const newsletter = await getLatestNewsletter();
    
    if (!newsletter) {
      return NextResponse.json({
        success: false,
        error: 'No newsletters found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      newsletter
    });
    
  } catch (error) {
    console.error('Error fetching latest newsletter:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch newsletter'
    }, { status: 500 });
  }
}
