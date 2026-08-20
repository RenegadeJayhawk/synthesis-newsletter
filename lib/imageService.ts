/**
 * Image Service
 * Handles sourcing and generation of article thumbnail images
 */

import { NewsletterArticle } from '@/types/newsletter';

/**
 * Get or generate an image for an article
 * 1. Try to search for relevant image from Unsplash
 * 2. Fall back to a committed site image when no approved external image is available
 * 3. Cache the result in the article object
 */
export async function getArticleImage(
  article: NewsletterArticle
): Promise<string> {
  const { title, category, imageUrl } = article;

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

    // Keep server-side generation deterministic: the former relative /api/generate-image
    // call could not resolve from a server route and pointed at no implemented endpoint.
    return getFallbackImage();
  } catch (error) {
    console.error('Error getting article image:', error);
    return getFallbackImage();
  }
}

/**
 * Search for relevant images on Unsplash
 */
async function searchUnsplashImage(
  title: string,
  category?: string
): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
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
      const imageUrl = data.results[0]?.urls?.regular;
      return typeof imageUrl === 'string' && imageUrl.length > 0 ? imageUrl : null;
    }

    return null;
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return null;
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
 * Get placeholder image based on category
 */
function getFallbackImage(): string {
  // Generated during postinstall and committed for use in every deployment.
  return '/og-image.png';
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
