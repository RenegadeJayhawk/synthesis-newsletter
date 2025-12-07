import { NextResponse } from 'next/server';
import { createNewsletter } from '@/lib/newsletterService';
import { saveNewsletter } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/newsletter/generate
 * Generate a new newsletter and save it to the database
 */
export async function POST() {
  try {
    console.log('Starting newsletter generation...');
    
    // Generate the newsletter content
    const newsletter = await createNewsletter();
    
    console.log('Newsletter generated, saving to database...');
    
    // Save to database
    const savedNewsletter = await saveNewsletter(newsletter);
    
    console.log('Newsletter saved successfully');
    
    return NextResponse.json({
      success: true,
      newsletter: savedNewsletter
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error generating newsletter:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate newsletter'
    }, { status: 500 });
  }
}
