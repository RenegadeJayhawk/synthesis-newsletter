import OpenAI from 'openai';
import newsletterPromptConfig from './newsletterPrompt.json';

export interface Newsletter {
  id: string;
  title: string;
  weekStart: string;
  weekEnd: string;
  content: string;
  generatedAt: string;
  model: string;
}

/**
 * Calculate the date range for the newsletter (7-day lookback)
 */
export function calculateDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

/**
 * Generate newsletter content using OpenAI API
 */
export async function generateNewsletterContent(): Promise<string> {
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { startDate, endDate } = calculateDateRange();

  // Build the prompt from the template
  const userPrompt = newsletterPromptConfig.userPromptTemplate
    .replace(/{startDate}/g, startDate)
    .replace(/{endDate}/g, endDate);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: newsletterPromptConfig.systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('Error generating newsletter:', error);
    throw new Error(`Failed to generate newsletter: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new newsletter
 */
export async function createNewsletter(): Promise<Newsletter> {
  const { startDate, endDate } = calculateDateRange();
  const content = await generateNewsletterContent();

  const newsletter: Newsletter = {
    id: `newsletter-${Date.now()}`,
    title: `AI & GenAI Weekly News Summary (${startDate} - ${endDate})`,
    weekStart: startDate,
    weekEnd: endDate,
    content,
    generatedAt: new Date().toISOString(),
    model: 'gpt-4.1-mini'
  };

  return newsletter;
}
