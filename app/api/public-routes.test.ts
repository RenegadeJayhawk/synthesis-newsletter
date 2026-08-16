import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as subscribePOST } from './subscribe/route';
import { POST as contactPOST } from './contact/route';
import { GET as searchGET } from './search/route';
import { GET as latestGET } from './newsletter/latest/route';
import { GET as listGET } from './newsletter/list/route';
import { GET as newsletterIdGET } from './newsletter/[id]/route';
import { GET as categoryGET } from './category/[slug]/route';

const routeMocks = vi.hoisted(() => ({
  newsletterDb: {
    addSubscriber: vi.fn(),
    searchArticles: vi.fn(),
    getLatestNewsletter: vi.fn(),
    toApiFormat: vi.fn(),
    listNewsletters: vi.fn(),
    getNewsletterCount: vi.fn(),
    getNewsletterById: vi.fn(),
    getArticlesByCategories: vi.fn(),
  },
  data: {
    articles: [
      {
        slug: 'static-ai-insight',
        title: 'Static AI Insight',
        excerpt: 'A static editorial deep dive into alignment and deployment.',
        author: 'Editorial Desk',
        date: 'June 1, 2026',
        readTime: '4 min read',
        category: 'Artificial Intelligence',
        tags: ['AI', 'Editorial'],
        image: '/images/static-ai.jpg',
      },
    ],
  },
  categories: [
    { slug: 'ai', name: 'Artificial Intelligence' },
    { slug: 'ml', name: 'Machine Learning' },
    { slug: 'robotics', name: 'Robotics' },
    { slug: 'ethics', name: 'AI Ethics' },
  ],
}));

vi.mock('@/lib/db/newsletterDbService', () => ({ newsletterDb: routeMocks.newsletterDb }));
vi.mock('@/lib/data', () => routeMocks.data);
vi.mock('@/lib/categories', () => ({ categories: routeMocks.categories }));

function jsonRequest(url: string, body: unknown, ip = '203.0.113.10'): Request {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

function getRequest(url: string, ip = '203.0.113.10'): Request {
  return new Request(url, {
    headers: {
      'x-forwarded-for': ip,
    },
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('public API routes', () => {
  describe('subscribe route', () => {
    it('rejects a missing email address', async () => {
      const response = await subscribePOST(jsonRequest('http://localhost/api/subscribe', {}));
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(body).toEqual(
        expect.objectContaining({
          success: false,
          error: 'Email address is required',
        })
      );
      expect(routeMocks.newsletterDb.addSubscriber).not.toHaveBeenCalled();
    });

    it('rejects an invalid email format', async () => {
      const response = await subscribePOST(
        jsonRequest('http://localhost/api/subscribe', { email: 'not-an-email' }, '203.0.113.11')
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid email address format');
      expect(routeMocks.newsletterDb.addSubscriber).not.toHaveBeenCalled();
    });

    it('subscribes normalized email addresses', async () => {
      routeMocks.newsletterDb.addSubscriber.mockResolvedValue(true);

      const response = await subscribePOST(
        jsonRequest('http://localhost/api/subscribe', { email: '  TEST@Example.com ' }, '203.0.113.12')
      );
      const body = (await response.json()) as { success: boolean; message: string; requestId: string };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterDb.addSubscriber).toHaveBeenCalledWith('test@example.com');
      expect(body.success).toBe(true);
      expect(body.message).toContain('Thank you for subscribing');
      expect(body.requestId).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  describe('contact route', () => {
    it('rejects a submission without a name', async () => {
      const response = await contactPOST(
        jsonRequest('http://localhost/api/contact', {
          name: '',
          email: 'reader@example.com',
          message: 'This is a detailed message that is long enough.',
        }, '203.0.113.13')
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(body.error).toBe('Name is required.');
    });

    it('rejects an invalid email address', async () => {
      const response = await contactPOST(
        jsonRequest('http://localhost/api/contact', {
          name: 'Reader',
          email: 'invalid-email',
          message: 'This is a detailed message that is long enough.',
        }, '203.0.113.14')
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(body.error).toBe('A valid email is required.');
    });

    it('rejects a short message', async () => {
      const response = await contactPOST(
        jsonRequest('http://localhost/api/contact', {
          name: 'Reader',
          email: 'reader@example.com',
          message: 'Too short',
        }, '203.0.113.15')
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(body.error).toBe('Please provide a message with at least 20 characters.');
    });

    it('accepts a valid contact submission', async () => {
      const response = await contactPOST(
        jsonRequest('http://localhost/api/contact', {
          name: 'Reader',
          email: 'reader@example.com',
          topic: 'Coverage idea',
          message: 'This is a detailed message that is long enough.',
        }, '203.0.113.16')
      );
      const body = (await response.json()) as { success: boolean; message: string };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Thanks for reaching out');
    });
  });

  describe('search route', () => {
    it('returns mapped article results and falls back to editorial defaults', async () => {
      routeMocks.newsletterDb.searchArticles.mockResolvedValue([
        {
          id: 'db-article-1',
          title: 'Transformer Safety Update',
          summary: 'A review of new evaluation work.',
          category: 'Research',
          author: null,
          publication: null,
          imageUrl: null,
          newsletterId: 'newsletter-1',
          createdAt: new Date('2026-06-09T00:00:00.000Z'),
        },
      ]);

      const response = await searchGET(getRequest('http://localhost/api/search?q=safety', '203.0.113.17'));
      const body = (await response.json()) as {
        success: boolean;
        query: string;
        articles: Array<{ id: string; author: string; sourceUrl: string; createdAt: string }>;
      };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterDb.searchArticles).toHaveBeenCalledWith('safety', 50);
      expect(body.success).toBe(true);
      expect(body.query).toBe('safety');
      expect(body.articles).toHaveLength(1);
      expect(body.articles[0]).toMatchObject({
        id: 'db-article-1',
        author: 'The Synthesis Editorial',
        sourceUrl: '/archive/newsletter-1',
      });
    });
  });

  describe('newsletter latest route', () => {
    it('returns 404 when no newsletter exists', async () => {
      routeMocks.newsletterDb.getLatestNewsletter.mockResolvedValue(null);

      const response = await latestGET(getRequest('http://localhost/api/newsletter/latest', '203.0.113.18'));
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(404);
      expect(body.error).toBe('No newsletters found');
    });

    it('returns the transformed latest newsletter when one exists', async () => {
      const latestNewsletter = {
        id: 'newsletter-1',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        overview: 'Weekly overview',
        generatedAt: new Date('2026-06-08T09:00:00.000Z'),
        model: 'gemini-2.0-flash-exp',
        articles: [],
      };
      const apiPayload = {
        id: 'newsletter-1',
        title: 'AI & GenAI Weekly: June 1, 2026 - June 8, 2026',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        overview: 'Weekly overview',
        articles: [],
        generatedAt: '2026-06-08T09:00:00.000Z',
        model: 'gemini-2.0-flash-exp',
      };

      routeMocks.newsletterDb.getLatestNewsletter.mockResolvedValue(latestNewsletter);
      routeMocks.newsletterDb.toApiFormat.mockReturnValue(apiPayload);

      const response = await latestGET(getRequest('http://localhost/api/newsletter/latest', '203.0.113.19'));
      const body = (await response.json()) as { success: boolean; newsletter: typeof apiPayload };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterDb.toApiFormat).toHaveBeenCalledWith(latestNewsletter);
      expect(body.success).toBe(true);
      expect(body.newsletter).toEqual(apiPayload);
    });
  });

  describe('newsletter list route', () => {
    it('clamps pagination values and returns paging metadata', async () => {
      routeMocks.newsletterDb.listNewsletters.mockResolvedValue([{ id: 'newsletter-1' }]);
      routeMocks.newsletterDb.getNewsletterCount.mockResolvedValue(3);

      const response = await listGET(
        getRequest('http://localhost/api/newsletter/list?limit=250&offset=-4', '203.0.113.20')
      );
      const body = (await response.json()) as {
        success: boolean;
        newsletters: Array<{ id: string }>;
        pagination: { limit: number; offset: number; total: number; hasMore: boolean };
      };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterDb.listNewsletters).toHaveBeenCalledWith(100, 0);
      expect(routeMocks.newsletterDb.getNewsletterCount).toHaveBeenCalled();
      expect(body.success).toBe(true);
      expect(body.newsletters).toEqual([{ id: 'newsletter-1' }]);
      expect(body.pagination).toEqual({
        limit: 100,
        offset: 0,
        total: 3,
        hasMore: false,
      });
    });
  });

  describe('newsletter by id route', () => {
    it('returns 404 when the newsletter is missing', async () => {
      routeMocks.newsletterDb.getNewsletterById.mockResolvedValue(null);

      const response = await newsletterIdGET(getRequest('http://localhost/api/newsletter/newsletter-1', '203.0.113.21'), {
        params: Promise.resolve({ id: 'newsletter-1' }),
      });
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(404);
      expect(body.error).toBe('Newsletter not found');
    });

    it('returns the transformed newsletter when the id exists', async () => {
      const newsletterRecord = {
        id: 'newsletter-1',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        overview: 'Weekly overview',
        generatedAt: new Date('2026-06-08T09:00:00.000Z'),
        model: 'gemini-2.0-flash-exp',
        articles: [],
      };
      const apiPayload = {
        id: 'newsletter-1',
        title: 'AI & GenAI Weekly: June 1, 2026 - June 8, 2026',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        overview: 'Weekly overview',
        articles: [],
        generatedAt: '2026-06-08T09:00:00.000Z',
        model: 'gemini-2.0-flash-exp',
      };

      routeMocks.newsletterDb.getNewsletterById.mockResolvedValue(newsletterRecord);
      routeMocks.newsletterDb.toApiFormat.mockReturnValue(apiPayload);

      const response = await newsletterIdGET(getRequest('http://localhost/api/newsletter/newsletter-1', '203.0.113.22'), {
        params: Promise.resolve({ id: 'newsletter-1' }),
      });
      const body = (await response.json()) as { success: boolean; newsletter: typeof apiPayload };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterDb.toApiFormat).toHaveBeenCalledWith(newsletterRecord);
      expect(body.newsletter).toEqual(apiPayload);
    });
  });

  describe('category route', () => {
    it('returns 404 for an unknown category slug', async () => {
      const response = await categoryGET(getRequest('http://localhost/api/category/unknown', '203.0.113.23'), {
        params: Promise.resolve({ slug: 'unknown' }),
      });
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(404);
      expect(body.error).toBe('Category not found');
    });

    it('merges dynamic and static articles for a known category', async () => {
      routeMocks.newsletterDb.getArticlesByCategories.mockResolvedValue([
        {
          id: 'db-article-1',
          title: 'Dynamic AI Update',
          summary: 'A new model release landed this week.',
          category: 'Major Breakthroughs & Research',
          author: 'Editorial Team',
          publication: 'The Synthesis',
          imageUrl: '/images/dynamic-ai.jpg',
          externalLink: '/archive/newsletter-1',
          createdAt: new Date('2026-06-09T00:00:00.000Z'),
        },
      ]);

      const response = await categoryGET(getRequest('http://localhost/api/category/ai', '203.0.113.24'), {
        params: Promise.resolve({ slug: 'ai' }),
      });
      const body = (await response.json()) as {
        success: boolean;
        category: string;
        articles: Array<{ id: string; createdAt: string }>;
      };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterDb.getArticlesByCategories).toHaveBeenCalledWith(
        [
          'Major Breakthroughs & Research',
          'New Applications & Use Cases',
          'Emerging Trends & Future Outlook',
          'Tools & Resources',
          'Artificial Intelligence',
        ],
        50
      );
      expect(body.success).toBe(true);
      expect(body.category).toBe('Artificial Intelligence');
      expect(body.articles).toHaveLength(2);
      expect(body.articles[0].id).toBe('db-article-1');
      expect(body.articles[1].id).toBe('static-static-ai-insight');
    });
  });
});
