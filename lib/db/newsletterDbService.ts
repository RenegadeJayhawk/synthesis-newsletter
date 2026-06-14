import { db, schema } from '@/db';
import { eq, desc, inArray } from 'drizzle-orm';
import type { Newsletter, NewNewsletter, Article, NewArticle } from '@/db/schema/newsletters';
import type { ParsedNewsletter } from '@/types/newsletter';

/**
 * Database service for newsletter operations
 * Provides CRUD operations for newsletters and articles
 */
export class NewsletterDbService {
  private isLocalMock = !process.env.POSTGRES_URL;
  private mockNewsletters: Newsletter[] = [];
  private mockArticles: Article[] = [];

  constructor() {
    if (this.isLocalMock) {
      console.warn('[Database] POSTGRES_URL is missing. Operating in local in-memory mock mode.');
      
      // Seed with a default mock newsletter for local preview
      const mockId = '6a2b8e8f-8d9e-4b2a-a5c8-1c3d5e7f9a0b';
      this.mockNewsletters.push({
        id: mockId,
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        content: '# AI & GenAI Weekly: June 1, 2026 - June 8, 2026\n\n## 1. Overview\nAI continues to advance...',
        model: 'gemini-2.0-flash-exp',
        overview: 'Welcome to this week\'s local mock AI Newsletter. We highlight breakthroughs in multimodal models, edge computing, and AI watermarking standards.',
        generatedAt: new Date('2026-06-08T09:00:00.000Z'),
        createdAt: new Date('2026-06-08T09:00:00.000Z'),
        updatedAt: new Date('2026-06-08T09:00:00.000Z'),
      });

      this.mockArticles.push(
        {
          id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
          newsletterId: mockId,
          title: 'Gemini 2.5 Architecture and Innovations',
          summary: 'Google DeepMind shares deep architectural insights into the Gemini 2.5 multimodal routing engine.',
          content: 'Full details on the mixture-of-experts model routing.',
          category: 'Major Breakthroughs & Research',
          author: 'DeepMind Team',
          publication: 'Google AI Blog',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
          externalLink: 'https://ai.google/blog',
          position: 0,
          metadata: null,
          createdAt: new Date('2026-06-08T09:00:00.000Z'),
          updatedAt: new Date('2026-06-08T09:00:00.000Z'),
        },
        {
          id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
          newsletterId: mockId,
          title: 'Llama-edge: Highly Compressed LLMs for Consumer Hardware',
          summary: 'Meta releases a new suite of compressed models optimized specifically for mobile NPU units.',
          content: 'Analysis of quantization techniques used.',
          category: 'Open Source Developments',
          author: 'Meta AI',
          publication: 'GitHub',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
          externalLink: 'https://github.com/meta-llama',
          position: 1,
          metadata: null,
          createdAt: new Date('2026-06-08T09:00:00.000Z'),
          updatedAt: new Date('2026-06-08T09:00:00.000Z'),
        }
      );
    }
  }

  /**
   * Create a new newsletter with articles
   */
  async createNewsletter(
    newsletterData: Omit<NewNewsletter, 'id' | 'createdAt' | 'updatedAt'>,
    parsedData?: ParsedNewsletter
  ): Promise<Newsletter> {
    if (this.isLocalMock) {
      const newsletter: Newsletter = {
        id: 'mock-' + Math.random().toString(36).substring(2, 11),
        weekStart: newsletterData.weekStart,
        weekEnd: newsletterData.weekEnd,
        content: newsletterData.content,
        model: newsletterData.model || 'gemini-2.0-flash-exp',
        overview: parsedData?.overview || null,
        generatedAt: newsletterData.generatedAt instanceof Date ? newsletterData.generatedAt : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.mockNewsletters.push(newsletter);

      if (parsedData?.articles && parsedData.articles.length > 0) {
        const articlesData: Article[] = parsedData.articles.map((article, index) => ({
          id: article.id || 'mock-art-' + Math.random().toString(36).substring(2, 11),
          newsletterId: newsletter.id,
          title: article.title,
          summary: article.summary,
          content: article.content || article.summary,
          category: article.category || 'General',
          author: article.author || null,
          publication: (article.metadata?.publication as string) || null,
          imageUrl: article.imageUrl || null,
          externalLink: article.sourceUrl || null,
          position: index,
          metadata: article.metadata ? JSON.parse(JSON.stringify(article.metadata)) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        this.mockArticles.push(...articlesData);
      }

      return newsletter;
    }

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
        publication: (article.metadata?.publication as string) || null,
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
    if (this.isLocalMock) {
      if (this.mockNewsletters.length === 0) {
        return null;
      }
      const sorted = [...this.mockNewsletters].sort(
        (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()
      );
      const newsletter = sorted[0];
      const articles = this.mockArticles
        .filter((art) => art.newsletterId === newsletter.id)
        .sort((a, b) => a.position - b.position);

      return {
        ...newsletter,
        articles,
      };
    }

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
    if (this.isLocalMock) {
      const newsletter = this.mockNewsletters.find((n) => n.id === id);
      if (!newsletter) {
        return null;
      }
      const articles = this.mockArticles
        .filter((art) => art.newsletterId === newsletter.id)
        .sort((a, b) => a.position - b.position);

      return {
        ...newsletter,
        articles,
      };
    }

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
    if (this.isLocalMock) {
      const sorted = [...this.mockNewsletters].sort(
        (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()
      );
      return sorted.slice(offset, offset + limit);
    }

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
    if (this.isLocalMock) {
      return this.mockArticles
        .filter((art) => art.category === category)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }

    return await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.category, category))
      .orderBy(desc(schema.articles.createdAt))
      .limit(limit);
  }

  /**
   * Get articles matching any of the specified categories
   */
  async getArticlesByCategories(categoriesList: string[], limit: number = 20): Promise<Article[]> {
    if (this.isLocalMock) {
      return this.mockArticles
        .filter((art) => categoriesList.includes(art.category))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }

    return await db
      .select()
      .from(schema.articles)
      .where(inArray(schema.articles.category, categoriesList))
      .orderBy(desc(schema.articles.createdAt))
      .limit(limit);
  }

  /**
   * Delete newsletter and all associated articles
   */
  async deleteNewsletter(id: string): Promise<boolean> {
    if (this.isLocalMock) {
      const initialLength = this.mockNewsletters.length;
      this.mockNewsletters = this.mockNewsletters.filter((n) => n.id !== id);
      this.mockArticles = this.mockArticles.filter((art) => art.newsletterId !== id);
      return this.mockNewsletters.length < initialLength;
    }

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
    if (this.isLocalMock) {
      return this.mockNewsletters.length;
    }

    const result = await db
      .select({ count: schema.newsletters.id })
      .from(schema.newsletters);

    return result.length;
  }

  /**
   * Get total count of articles
   */
  async getArticleCount(): Promise<number> {
    if (this.isLocalMock) {
      return this.mockArticles.length;
    }

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
