import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all runs ordered by created_at descending (newest first)
    const { data: runs, error } = await supabase
      .from('agent_runs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(runs)
  } catch (error) {
    console.error('[Agent] Error fetching runs:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
