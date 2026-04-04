import { runNewsletterAgent } from '@/lib/agent'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET

const DEFAULT_SYSTEM_PROMPT = `You are an expert newsletter writer specializing in technology, AI, and innovation. 
Create engaging, informative content that educates readers about the latest developments in tech.
Focus on accuracy, clarity, and practical insights.
Make sure each article is unique and brings a different perspective.`

export async function POST(request: NextRequest) {
  try {
    // Verify authorization - either CRON_SECRET for scheduled runs or authenticated user for manual triggers
    const authHeader = request.headers.get('authorization')
    const cronHeader = request.headers.get('x-vercel-cron')

    const isCronRequest = cronHeader === process.env.CRON_SECRET
    const isAuthorized =
      isCronRequest ||
      (authHeader && authHeader.startsWith('Bearer ')) ||
      (process.env.NODE_ENV === 'development')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Create a run record with status "pending"
    const { data: runRecord, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        status: 'pending',
        input: { type: 'newsletter_generation', timestamp: new Date().toISOString() },
      })
      .select()
      .single()

    if (runError) throw runError

    try {
      // Run the agent
      console.log('[Agent] Starting newsletter generation...')
      const output = await runNewsletterAgent(DEFAULT_SYSTEM_PROMPT)

      // Parse output and create newsletter + articles
      const { data: newsletter, error: newsError } = await supabase
        .from('newsletters')
        .insert({
          overview: output.overview,
          content: output.summary,
          model: 'openai/gpt-4-turbo',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (newsError) throw newsError

      // Insert articles linked to the newsletter
      const articles = output.articles.map((article) => ({
        newsletter_id: newsletter.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        author: article.author,
        keyPoints: article.keyPoints,
        created_at: new Date().toISOString(),
      }))

      const { error: articlesError } = await supabase.from('articles').insert(articles)

      if (articlesError) throw articlesError

      // Update run record with success status
      const { error: updateError } = await supabase
        .from('agent_runs')
        .update({
          status: 'completed',
          output: {
            newsletter_id: newsletter.id,
            articles_count: articles.length,
          },
          completed_at: new Date().toISOString(),
        })
        .eq('id', runRecord.id)

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        runId: runRecord.id,
        newsletterId: newsletter.id,
        articlesCount: articles.length,
      })
    } catch (agentError) {
      // Update run record with error status
      const errorMessage = agentError instanceof Error ? agentError.message : String(agentError)
      const { error: updateError } = await supabase
        .from('agent_runs')
        .update({
          status: 'failed',
          error: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', runRecord.id)

      if (updateError) console.error('Failed to update error status:', updateError)

      throw agentError
    }
  } catch (error) {
    console.error('[Agent] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
