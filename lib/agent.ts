import { generateText, Output } from 'ai'
import { z } from 'zod'

// Define the newsletter content schema matching our database structure
const newsletterSchema = z.object({
  overview: z.string().describe('2-3 sentence overview of the newsletter'),
  articles: z.array(
    z.object({
      title: z.string().describe('Article title'),
      summary: z.string().describe('2-3 sentence summary'),
      content: z.string().describe('Full article content (300-500 words)'),
      category: z.string().describe('Category slug (e.g., "artificial-intelligence", "ethics")'),
      author: z.string().describe('Author name'),
      keyPoints: z.array(z.string()).describe('3-5 key takeaways'),
    })
  ).describe('Array of articles for the newsletter (3-5 articles)'),
  summary: z.string().describe('Brief summary of the entire newsletter'),
})

export async function runNewsletterAgent(
  systemPrompt: string,
  userPrompt: string = 'Generate a comprehensive tech newsletter covering recent developments in AI, machine learning, and robotics.'
) {
  const result = await generateText({
    model: 'openai/gpt-4-turbo',
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({ schema: newsletterSchema }),
  })

  return result.object
}

export type NewsletterOutput = z.infer<typeof newsletterSchema>
