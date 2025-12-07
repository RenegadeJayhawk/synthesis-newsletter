import { GoogleGenerativeAI } from '@google/generative-ai';
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
 * Generate newsletter content using Google Gemini API
 */
export async function generateNewsletterContent(): Promise<string> {
  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const { startDate, endDate } = calculateDateRange();

  // Build the prompt from the template
  const userPrompt = newsletterPromptConfig.userPromptTemplate
    .replace(/{startDate}/g, startDate)
    .replace(/{endDate}/g, endDate);

  // Combine system and user prompts for Gemini
  const fullPrompt = `${newsletterPromptConfig.systemPrompt}\n\n${userPrompt}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      },
    });

    const response = result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No content generated from Gemini');
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
    model: 'gemini-2.0-flash-exp'
  };

  return newsletter;
}
