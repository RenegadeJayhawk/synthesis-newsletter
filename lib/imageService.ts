/**
 * Image Service
 * Handles sourcing and generation of article thumbnail images
 */

import { NewsletterArticle } from '@/types/newsletter';

/**
 * Get or generate an image for an article
 * 1. Try to search for relevant image from Unsplash
 * 2. If no suitable image found, generate using AI
 * 3. Cache the result in the article object
 */
export async function getArticleImage(
  article: NewsletterArticle
): Promise<string> {
  const { title, summary, category, imageUrl } = article;

  // Return existing image if already set
  if (imageUrl) {
    return imageUrl;
  }

  try {
    // Try to find image from Unsplash
    const searchImage = await searchUnsplashImage(title, category);
    if (searchImage) {
      return searchImage;
    }

    // Fallback: Generate AI image
    const generatedImage = await generateArticleImage(title, summary, category);
    return generatedImage;
  } catch (error) {
    console.error('Error getting article image:', error);
    // Return placeholder on error
    return getPlaceholderImage(category);
  }
}

/**
 * Search for relevant images on Unsplash
 */
async function searchUnsplashImage(
  title: string,
  category?: string
): Promise<string | null> {
  // Check if Unsplash API key is available
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log('Unsplash API key not configured, skipping image search');
    return null;
  }

  try {
    // Build search query from title and category
    const searchQuery = buildSearchQuery(title, category);

    // Search Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Return the first result's regular-sized image
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return null;
  }
}

/**
 * Generate an AI image for the article
 */
async function generateArticleImage(
  title: string,
  summary: string,
  category?: string
): Promise<string> {
  // Build a descriptive prompt for image generation
  const prompt = buildImagePrompt(title, summary, category);

  try {
    // Call image generation API
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Image generation failed');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    // Return category-specific placeholder
    return getPlaceholderImage(category);
  }
}

/**
 * Build search query from title and category
 */
function buildSearchQuery(title: string, category?: string): string {
  // Extract key terms from title
  const keywords = extractKeywords(title);

  // Add category-specific terms
  const categoryTerms = getCategorySearchTerms(category);

  // Combine and limit to 3-4 terms
  const terms = [...categoryTerms, ...keywords].slice(0, 4);

  return terms.join(' ');
}

/**
 * Extract key terms from title
 */
function extractKeywords(title: string): string[] {
  // Remove common words and extract meaningful terms
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  ]);

  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 3);
}

/**
 * Get search terms based on category
 */
function getCategorySearchTerms(category?: string): string[] {
  if (!category) return ['technology', 'artificial intelligence'];

  const categoryMap: Record<string, string[]> = {
    'Major Breakthroughs & Research': ['research', 'laboratory', 'science'],
    'New Applications & Use Cases': ['technology', 'innovation', 'digital'],
    'Industry News & Market Trends': ['business', 'corporate', 'industry'],
    'Ethical Considerations & Societal Impact': ['society', 'ethics', 'people'],
    'Open Source Developments': ['code', 'programming', 'developer'],
    'Emerging Trends & Future Outlook': ['future', 'innovation', 'technology'],
    'Tools & Resources': ['tools', 'software', 'technology'],
  };

  return categoryMap[category] || ['artificial intelligence', 'technology'];
}

/**
 * Build image generation prompt
 */
function buildImagePrompt(
  title: string,
  summary: string,
  category?: string
): string {
  const keywords = extractKeywords(title);
  const categoryStyle = getCategoryImageStyle(category);

  return `${categoryStyle}, ${keywords.join(', ')}, professional, high-quality, modern, clean composition, 16:9 aspect ratio`;
}

/**
 * Get image style based on category
 */
function getCategoryImageStyle(category?: string): string {
  const styleMap: Record<string, string> = {
    'Major Breakthroughs & Research': 'scientific laboratory, researchers, advanced technology',
    'New Applications & Use Cases': 'modern technology in use, practical application, real-world setting',
    'Industry News & Market Trends': 'corporate office, business meeting, professional environment',
    'Ethical Considerations & Societal Impact': 'diverse group of people, community, social interaction',
    'Open Source Developments': 'computer code, developer workspace, open collaboration',
    'Emerging Trends & Future Outlook': 'futuristic technology, innovation concept, forward-thinking',
    'Tools & Resources': 'software interface, digital tools, technology workspace',
  };

  return (category && styleMap[category]) || 'artificial intelligence concept, modern technology';
}

/**
 * Get placeholder image based on category
 */
function getPlaceholderImage(category?: string): string {
  // Map categories to placeholder images
  const placeholderMap: Record<string, string> = {
    'Major Breakthroughs & Research': '/images/placeholders/research.jpg',
    'New Applications & Use Cases': '/images/placeholders/applications.jpg',
    'Industry News & Market Trends': '/images/placeholders/industry.jpg',
    'Ethical Considerations & Societal Impact': '/images/placeholders/ethics.jpg',
    'Open Source Developments': '/images/placeholders/opensource.jpg',
    'Emerging Trends & Future Outlook': '/images/placeholders/future.jpg',
    'Tools & Resources': '/images/placeholders/tools.jpg',
  };

  return (category && placeholderMap[category]) || '/images/placeholders/default.jpg';
}

/**
 * Process all articles and add images
 */
export async function addImagesToArticles(
  articles: NewsletterArticle[]
): Promise<NewsletterArticle[]> {
  const processedArticles = await Promise.all(
    articles.map(async (article) => {
      if (!article.imageUrl) {
        const imageUrl = await getArticleImage(article);
        return { ...article, imageUrl };
      }
      return article;
    })
  );

  return processedArticles;
}
