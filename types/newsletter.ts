/**
 * Newsletter Article Type Definitions
 * Structured data model for individual articles within newsletters
 */

export interface NewsletterArticle {
  /** Unique identifier for the article */
  id: string;
  
  /** Article title */
  title: string;
  
  /** Brief summary or subtitle */
  summary: string;
  
  /** Author name (optional) */
  author?: string;
  
  /** Publication date (optional) */
  date?: string;
  
  /** Article category or section */
  category?: string;
  
  /** Source URL for the article (optional) */
  sourceUrl?: string;
  
  /** Thumbnail image URL */
  imageUrl?: string;
  
  /** Full article content (optional) */
  content?: string;
  
  /** Additional metadata */
  metadata?: {
    organization?: string;
    publication?: string;
    tags?: string[];
  };
}

/**
 * Parsed Newsletter Structure
 * Extends the base Newsletter interface with structured article data
 */
export interface ParsedNewsletter {
  /** Unique identifier */
  id: string;
  
  /** Newsletter title */
  title: string;
  
  /** Week start date */
  weekStart: string;
  
  /** Week end date */
  weekEnd: string;
  
  /** Overview/introduction section */
  overview: string;
  
  /** Structured array of articles */
  articles: NewsletterArticle[];
  
  /** Generation timestamp */
  generatedAt: string;
  
  /** AI model used for generation */
  model: string;
  
  /** Raw markdown content (for backward compatibility) */
  rawContent?: string;
}

/**
 * Newsletter Section
 * Represents a major section in the newsletter
 */
export interface NewsletterSection {
  /** Section identifier */
  id: string;
  
  /** Section title */
  title: string;
  
  /** Section content or introduction */
  content: string;
  
  /** Articles within this section */
  articles: NewsletterArticle[];
}
