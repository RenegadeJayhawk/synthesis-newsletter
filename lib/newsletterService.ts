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
    console.warn('GEMINI_API_KEY is not set. Generating mock newsletter content instead.');
    return `
# AI & GenAI Weekly: June 8, 2026 - June 15, 2026

## 1. Overview
This week witnessed prominent advancements in agentic workflows, hardware accelerator optimization, and consensus on artificial general intelligence safety standards.

## 2. Major Breakthroughs & Research
* **Agentic Architectures in Practice (Stanford AI Lab):** A new framework details routing protocols for multi-agent systems, improving task execution accuracy by 24%.
* **Liquid Neural Networks Scale (MIT):** Researchers showcase continuous-time neural networks controlling small autonomous aerial vehicles with significantly smaller footprints.

## 3. New Applications & Use Cases
* **Medical Co-Pilot Deployment (Epic Systems):** Over 150 healthcare networks deploy ambient AI voice capturing tools, cutting charting times by 3.5 hours daily per clinician.

## 4. Ethical Considerations & Societal Impact
* **Synthetic Data Audits (Anthropic):** Guidelines published on identifying bias leakage when training frontier models using synthetic generation inputs.

## 5. Open Source Developments
* **Instruct-12B Scaling (OpenLM):** The open-source community releases a highly optimized instruct-tuned model showing outstanding mathematical reasoning.
    `;
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
