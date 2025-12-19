import { db, schema } from '@/db';
import { eq, desc } from 'drizzle-orm';
import type { Newsletter, NewNewsletter, Article, NewArticle } from '@/db/schema/newsletters';
import type { ParsedNewsletter, NewsletterArticle } from '@/types/newsletter';

/**
 * Database service for newsletter operations
 * Provides CRUD operations for newsletters and articles
 */
export class NewsletterDbService {
  /**
   * Create a new newsletter with articles
   */
  async createNewsletter(
    newsletterData: Omit<NewNewsletter, 'id' | 'createdAt' | 'updatedAt'>,
    parsedData?: ParsedNewsletter
  ): Promise<Newsletter> {
    // Insert newsletter
    const [newsletter] = await db
      .insert(schema.newsletters)
      .values({
        ...newsletterData,
        overview: parsedData?.overview || null,
      })
      .returning();

    // Insert articles if provided
    if (parsedData?.articles && parsedData.articles.length > 0) {
      const articlesData: NewArticle[] = parsedData.articles.map((article, index) => ({
        newsletterId: newsletter.id,
        title: article.title,
        summary: article.summary,
        content: article.content || article.summary,
        category: article.category || 'General',
        author: article.author || null,
        publication: article.metadata?.publication || null,
        imageUrl: article.imageUrl || null,
        externalLink: article.sourceUrl || null,
        position: index,
        metadata: article.metadata ? JSON.parse(JSON.stringify(article.metadata)) : null,
      }));

      await db.insert(schema.articles).values(articlesData);
    }

    return newsletter;
  }

  /**
   * Get the latest newsletter with articles
   */
  async getLatestNewsletter(): Promise<(Newsletter & { articles: Article[] }) | null> {
    const newsletters = await db
      .select()
      .from(schema.newsletters)
      .orderBy(desc(schema.newsletters.generatedAt))
      .limit(1);

    if (newsletters.length === 0) {
      return null;
    }

    const newsletter = newsletters[0];
    const articles = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.newsletterId, newsletter.id))
      .orderBy(schema.articles.position);

    return {
      ...newsletter,
      articles,
    };
  }

  /**
   * Get newsletter by ID with articles
   */
  async getNewsletterById(id: string): Promise<(Newsletter & { articles: Article[] }) | null> {
    const newsletters = await db
      .select()
      .from(schema.newsletters)
      .where(eq(schema.newsletters.id, id))
      .limit(1);

    if (newsletters.length === 0) {
      return null;
    }

    const newsletter = newsletters[0];
    const articles = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.newsletterId, newsletter.id))
      .orderBy(schema.articles.position);

    return {
      ...newsletter,
      articles,
    };
  }

  /**
   * List all newsletters (without articles)
   */
  async listNewsletters(limit: number = 50, offset: number = 0): Promise<Newsletter[]> {
    return await db
      .select()
      .from(schema.newsletters)
      .orderBy(desc(schema.newsletters.generatedAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get articles by category across all newsletters
   */
  async getArticlesByCategory(category: string, limit: number = 20): Promise<Article[]> {
    return await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.category, category))
      .orderBy(desc(schema.articles.createdAt))
      .limit(limit);
  }

  /**
   * Delete newsletter and all associated articles
   */
  async deleteNewsletter(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.newsletters)
      .where(eq(schema.newsletters.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get total count of newsletters
   */
  async getNewsletterCount(): Promise<number> {
    const result = await db
      .select({ count: schema.newsletters.id })
      .from(schema.newsletters);

    return result.length;
  }

  /**
   * Get total count of articles
   */
  async getArticleCount(): Promise<number> {
    const result = await db
      .select({ count: schema.articles.id })
      .from(schema.articles);

    return result.length;
  }

  /**
   * Convert database newsletter to API format
   */
  toApiFormat(newsletter: Newsletter & { articles: Article[] }): ParsedNewsletter & {
    id: string;
    generatedAt: string;
    model: string;
  } {
    return {
      id: newsletter.id,
      title: `AI & GenAI Weekly: ${newsletter.weekStart} - ${newsletter.weekEnd}`,
      weekStart: newsletter.weekStart,
      weekEnd: newsletter.weekEnd,
      overview: newsletter.overview || '',
      articles: newsletter.articles.map((article) => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        author: article.author || undefined,
        publication: article.publication || undefined,
        imageUrl: article.imageUrl || undefined,
        externalLink: article.externalLink || undefined,
        metadata: article.metadata as Record<string, unknown> | undefined,
      })),
      generatedAt: newsletter.generatedAt.toISOString(),
      model: newsletter.model,
    };
  }
}

// Export singleton instance
export const newsletterDb = new NewsletterDbService();
