/**
 * Newsletter Parser
 * Parses markdown newsletter content into structured article objects
 * Handles both ## N. Title and **N. Title** section formats
 */

import { NewsletterArticle, ParsedNewsletter, NewsletterSection } from '@/types/newsletter';
import { Newsletter } from './newsletterService';

/**
 * Parse markdown newsletter content into structured data
 */
export function parseNewsletter(newsletter: Newsletter): ParsedNewsletter {
  const { content, id, title, weekStart, weekEnd, generatedAt, model } = newsletter;
  
  // Extract overview section (section 1)
  const overview = extractOverview(content);
  
  // Parse all articles from the newsletter content
  const articles = parseArticles(content);
  console.log(`[Parser] Extracted ${articles.length} articles from newsletter`);
  
  return {
    id,
    title,
    weekStart,
    weekEnd,
    overview,
    articles,
    generatedAt,
    model,
    rawContent: content,
  };
}

/**
 * Extract the overview section from newsletter content
 * Handles both ## 1. Overview and **1. Overview** formats
 */
function extractOverview(content: string): string {
  // Try markdown header format first: ## 1. Overview
  let overviewMatch = content.match(/##\s*1\.\s*Overview\s*\n([\s\S]*?)(?=\n##\s*\d+\.|\n#\s|$)/i);
  
  if (overviewMatch && overviewMatch[1]) {
    return overviewMatch[1].trim();
  }
  
  // Try bold format: **1. Overview**
  overviewMatch = content.match(/\*\*1\.\s*Overview\*\*\s*\n([\s\S]*?)(?=\n\*\*\d+\.|$)/i);
  
  if (overviewMatch && overviewMatch[1]) {
    return overviewMatch[1].trim();
  }
  
  return '';
}

/**
 * Parse individual articles from newsletter content
 * Handles both ## N. Title and **N. Title** section formats
 */
function parseArticles(content: string): NewsletterArticle[] {
  const articles: NewsletterArticle[] = [];
  
  // Try to detect which format is used
  const hasMarkdownHeaders = /##\s*\d+\.\s*[^\n]+/g.test(content);
  const hasBoldHeaders = /\*\*\d+\.\s*[^*\n]+\*\*/g.test(content);
  
  console.log(`[Parser] Format detection: markdown=${hasMarkdownHeaders}, bold=${hasBoldHeaders}`);
  
  let sections: Array<{number: string, title: string, content: string}> = [];
  
  if (hasMarkdownHeaders) {
    sections = extractMarkdownSections(content);
  } else if (hasBoldHeaders) {
    sections = extractBoldSections(content);
  }
  
  console.log(`[Parser] Found ${sections.length} sections`);
  
  // Process each section (skip section 1 which is overview)
  for (const section of sections) {
    if (section.number === '1') continue; // Skip overview
    
    const sectionArticles = parseSectionArticles(
      section.content,
      section.title,
      section.number
    );
    console.log(`[Parser] Section ${section.number} (${section.title}): found ${sectionArticles.length} articles`);
    
    articles.push(...sectionArticles);
  }
  
  return articles;
}

/**
 * Extract sections using markdown header format (## N. Title)
 */
function extractMarkdownSections(content: string): Array<{number: string, title: string, content: string}> {
  const sections: Array<{number: string, title: string, content: string}> = [];
  const sectionPattern = /##\s*(\d+)\.\s*([^\n]+)\n/g;
  const matches: Array<{number: string, title: string, index: number}> = [];
  
  let match;
  while ((match = sectionPattern.exec(content)) !== null) {
    matches.push({
      number: match[1],
      title: match[2].trim(),
      index: match.index,
    });
  }
  
  // Extract content for each section
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const endIndex = next ? next.index : content.length;
    const sectionContent = content.substring(current.index, endIndex);
    
    sections.push({
      number: current.number,
      title: current.title,
      content: sectionContent,
    });
  }
  
  return sections;
}

/**
 * Extract sections using bold text format (**N. Title**)
 */
function extractBoldSections(content: string): Array<{number: string, title: string, content: string}> {
  const sections: Array<{number: string, title: string, content: string}> = [];
  const sectionPattern = /\*\*(\d+)\.\s*([^*\n]+)\*\*/g;
  const matches: Array<{number: string, title: string, index: number}> = [];
  
  let match;
  while ((match = sectionPattern.exec(content)) !== null) {
    matches.push({
      number: match[1],
      title: match[2].trim(),
      index: match.index,
    });
  }
  
  // Extract content for each section
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const endIndex = next ? next.index : content.length;
    const sectionContent = content.substring(current.index, endIndex);
    
    sections.push({
      number: current.number,
      title: current.title,
      content: sectionContent,
    });
  }
  
  return sections;
}

/**
 * Parse articles within a specific section
 */
function parseSectionArticles(
  sectionContent: string,
  category: string,
  sectionNumber: string
): NewsletterArticle[] {
  const articles: NewsletterArticle[] = [];
  
  // Pattern to match bullet points with bold titles
  // Matches: *   **Title (Organization):** Content or * **Title:** Content
  const articlePattern = /^\s*\*+\s*\*\*([^*:]+?)(?:\s*\(([^)]+)\))?\s*:\*\*\s*([\s\S]*?)(?=^\s*\*+\s*\*\*[^*:]+?(?:\s*\([^)]+\))?\s*:\*\*|##\s*\d+\.|\*\*\d+\.|$)/gm;
  
  let match;
  let articleIndex = 0;
  
  while ((match = articlePattern.exec(sectionContent)) !== null) {
    const title = match[1].trim();
    const organization = match[2] ? match[2].trim() : undefined;
    const content = match[3].trim();
    
    // Skip if title is too short or looks like a header
    if (title.length < 10) continue;
    
    // Extract summary (first 1-2 sentences or first paragraph)
    const summary = extractSummary(content);
    
    // Extract additional metadata if not already captured
    const metadata = extractMetadata(content);
    const author = organization || metadata.organization;
    
    // Only add if we have meaningful content
    if (summary.length > 20) {
      articles.push({
        id: `article-${sectionNumber}-${articleIndex++}`,
        title: cleanTitle(title),
        summary,
        category,
        author,
        metadata: {
          ...metadata,
          organization: author,
        },
        content,
      });
    }
  }
  
  return articles;
}

/**
 * Extract a brief summary from article content (first 1-2 sentences)
 */
function extractSummary(content: string): string {
  // Remove markdown formatting
  const cleanContent = content
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*-\s*/gm, '') // Remove bullet points
    .trim();
  
  // Split into lines and get first non-empty paragraph
  const lines = cleanContent.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return '';
  
  const firstParagraph = lines[0];
  
  // Extract first 2 sentences
  const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g);
  
  if (sentences && sentences.length > 0) {
    const summary = sentences.slice(0, 2).join(' ').trim();
    return summary.length > 300 ? summary.substring(0, 297) + '...' : summary;
  }
  
  // Fallback: first 250 characters
  return firstParagraph.length > 250 
    ? firstParagraph.substring(0, 247) + '...' 
    : firstParagraph;
}

/**
 * Extract metadata (organization, publication, etc.) from content
 */
function extractMetadata(content: string): {
  organization?: string;
  publication?: string;
  tags?: string[];
} {
  const metadata: {
    organization?: string;
    publication?: string;
    tags?: string[];
  } = {};
  
  // Extract organization names (e.g., "MIT", "Stanford University", "Google AI")
  // Look for **Organization Name** pattern
  const orgPattern = /\*\*([A-Z][A-Za-z\s&]+(?:University|Institute|Lab|Research|AI|Inc|Corp|Company|Systems|Medicine|Academy|Dynamics|Mind|Google|Microsoft|Meta|IBM|OpenAI|Anthropic))\*\*/;
  const orgMatch = content.match(orgPattern);
  if (orgMatch) {
    metadata.organization = orgMatch[1].trim();
  }
  
  // Extract publication names (e.g., "Nature", "IEEE Robotics")
  const pubPattern = /\*([A-Z][A-Za-z\s&]+(?:Medicine|Science|Journal|Letters|Review|Biotechnology))\*/;
  const pubMatch = content.match(pubPattern);
  if (pubMatch) {
    metadata.publication = pubMatch[1].trim();
  }
  
  return metadata;
}

/**
 * Clean article title (remove markdown, extra whitespace)
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse newsletter into sections (alternative parsing approach)
 */
export function parseNewsletterSections(content: string): NewsletterSection[] {
  const sections: NewsletterSection[] = [];
  
  // Try both formats
  const hasMarkdownHeaders = /##\s*\d+\.\s*[^\n]+/g.test(content);
  
  if (hasMarkdownHeaders) {
    const sectionPattern = /##\s*(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=##\s*\d+\.|$)/g;
    let match;
    
    while ((match = sectionPattern.exec(content)) !== null) {
      const sectionNumber = match[1];
      const sectionTitle = match[2].trim();
      const sectionContent = match[3].trim();
      
      const articles = parseSectionArticles(sectionContent, sectionTitle, sectionNumber);
      
      sections.push({
        id: `section-${sectionNumber}`,
        title: sectionTitle,
        content: sectionContent.substring(0, 500),
        articles,
      });
    }
  } else {
    const sectionPattern = /\*\*(\d+)\.\s*([^*\n]+)\*\*\s*([\s\S]*?)(?=\*\*\d+\.|$)/g;
    let match;
    
    while ((match = sectionPattern.exec(content)) !== null) {
      const sectionNumber = match[1];
      const sectionTitle = match[2].trim();
      const sectionContent = match[3].trim();
      
      const articles = parseSectionArticles(sectionContent, sectionTitle, sectionNumber);
      
      sections.push({
        id: `section-${sectionNumber}`,
        title: sectionTitle,
        content: sectionContent.substring(0, 500),
        articles,
      });
    }
  }
  
  return sections;
}
