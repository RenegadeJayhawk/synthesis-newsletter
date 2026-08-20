import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as generatePOST } from './newsletter/generate/route';
import { POST as adminGeneratePOST } from './newsletter/admin-generate/route';
import { POST as parsePOST } from './newsletter/parse/route';
import { GET as cronGET } from './cron/generate-newsletter/route';

const routeMocks = vi.hoisted(() => ({
  newsletterGeneration: {
    generateAndPersistNewsletter: vi.fn(),
  },
  newsletterParser: {
    parseNewsletter: vi.fn(),
  },
  imageService: {
    addImagesToArticles: vi.fn(),
  },
  newsletterService: {
    createNewsletter: vi.fn(),
  },
  newsletterDb: {
    createNewsletter: vi.fn(),
    isPersistenceReady: vi.fn(() => true),
  },
  databaseHealth: {
    mode: 'postgres',
    ready: true,
    fallback: 'postgres',
    configured: true,
    checkedAt: new Date().toISOString(),
  },
  cronLogger: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    getRecentLogs: vi.fn(),
  },
  notificationService: {
    sendSuccess: vi.fn(),
    sendError: vi.fn(),
  },
}));

vi.mock('@/lib/newsletterGeneration', () => routeMocks.newsletterGeneration);
vi.mock('@/lib/newsletterParser', () => routeMocks.newsletterParser);
vi.mock('@/lib/imageService', () => routeMocks.imageService);
vi.mock('@/lib/newsletterService', () => routeMocks.newsletterService);
vi.mock('@/lib/db/newsletterDbService', () => ({
  newsletterDb: routeMocks.newsletterDb,
  getDatabaseHealth: vi.fn(() => routeMocks.databaseHealth),
}));
vi.mock('@/lib/cronLogger', () => ({ cronLogger: routeMocks.cronLogger }));
vi.mock('@/lib/notificationService', () => ({ notificationService: routeMocks.notificationService }));

function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function getRequest(url: string, headers: Record<string, string> = {}): NextRequest {
  return new Request(url, {
    headers,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('protected API routes', () => {
  describe('newsletter generate route', () => {
    it('rejects an invalid bearer token', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_TOKEN', 'expected-token');

      const response = await generatePOST(
        jsonRequest('http://localhost/api/newsletter/generate', {}, { authorization: 'Bearer wrong-token' })
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(401);
      expect(body.error).toBe('Unauthorized.');
      expect(routeMocks.newsletterGeneration.generateAndPersistNewsletter).not.toHaveBeenCalled();
    });

    it('returns a generated newsletter when authorized', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_TOKEN', 'expected-token');
      routeMocks.newsletterGeneration.generateAndPersistNewsletter.mockResolvedValue({
        id: 'newsletter-1',
        title: 'AI & GenAI Weekly News Summary (June 1, 2026 - June 8, 2026)',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        content: '# Mock newsletter',
        generatedAt: '2026-06-08T09:00:00.000Z',
        model: 'gemini-2.0-flash-exp',
        overview: '',
        articles: [],
      });

      const response = await generatePOST(
        jsonRequest('http://localhost/api/newsletter/generate', {}, { authorization: 'Bearer expected-token' })
      );
      const body = (await response.json()) as { success: boolean; newsletter: { id: string } };

      expect(response.status).toBe(201);
      expect(routeMocks.newsletterGeneration.generateAndPersistNewsletter).toHaveBeenCalledTimes(1);
      expect(body.success).toBe(true);
      expect(body.newsletter.id).toBe('newsletter-1');
    });
  });

  describe('admin generate route', () => {
    it('returns 503 when the admin password is not configured', async () => {
      const response = await adminGeneratePOST(
        jsonRequest('http://localhost/api/newsletter/admin-generate', { adminPassword: 'anything' })
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(503);
      expect(body.error).toBe('Admin generation is not configured.');
    });

    it('returns 401 when the admin password is invalid', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_UI_PASSWORD', 'expected-password');

      const response = await adminGeneratePOST(
        jsonRequest('http://localhost/api/newsletter/admin-generate', { adminPassword: 'wrong-password' })
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(401);
      expect(body.error).toBe('Unauthorized.');
      expect(routeMocks.newsletterGeneration.generateAndPersistNewsletter).not.toHaveBeenCalled();
    });

    it('returns a generated newsletter when the admin password matches', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_UI_PASSWORD', 'expected-password');
      routeMocks.newsletterGeneration.generateAndPersistNewsletter.mockResolvedValue({
        id: 'newsletter-2',
        title: 'AI & GenAI Weekly News Summary (June 1, 2026 - June 8, 2026)',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        content: '# Mock newsletter',
        generatedAt: '2026-06-08T09:00:00.000Z',
        model: 'gemini-2.0-flash-exp',
        overview: '',
        articles: [],
      });

      const response = await adminGeneratePOST(
        jsonRequest('http://localhost/api/newsletter/admin-generate', { adminPassword: 'expected-password' })
      );
      const body = (await response.json()) as { success: boolean; newsletter: { id: string } };

      expect(response.status).toBe(201);
      expect(routeMocks.newsletterGeneration.generateAndPersistNewsletter).toHaveBeenCalledTimes(1);
      expect(body.success).toBe(true);
      expect(body.newsletter.id).toBe('newsletter-2');
    });
  });

  describe('newsletter parse route', () => {
    it('returns 401 when the bearer token is invalid', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_TOKEN', 'expected-token');

      const response = await parsePOST(
        jsonRequest('http://localhost/api/newsletter/parse', { newsletter: { content: '# Content' } }, { authorization: 'Bearer wrong-token' })
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(401);
      expect(body.error).toBe('Unauthorized.');
    });

    it('returns 400 for invalid newsletter payloads', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_TOKEN', 'expected-token');

      const response = await parsePOST(
        jsonRequest('http://localhost/api/newsletter/parse', { newsletter: { content: '' } }, { authorization: 'Bearer expected-token' })
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid newsletter data');
    });

    it('returns parsed articles with added images when authorized', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_TOKEN', 'expected-token');
      routeMocks.newsletterParser.parseNewsletter.mockReturnValue({
        id: 'newsletter-1',
        title: 'AI & GenAI Weekly',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        overview: 'Overview',
        generatedAt: '2026-06-08T09:00:00.000Z',
        model: 'gemini-2.0-flash-exp',
        articles: [
          {
            id: 'article-1',
            title: 'Original title',
            summary: 'Original summary',
            content: 'Original content',
            category: 'Research',
          },
        ],
      });
      routeMocks.imageService.addImagesToArticles.mockResolvedValue([
        {
          id: 'article-1',
          title: 'Original title',
          summary: 'Original summary',
          content: 'Original content',
          category: 'Research',
          imageUrl: '/images/article-1.jpg',
        },
      ]);

      const response = await parsePOST(
        jsonRequest('http://localhost/api/newsletter/parse', {
          newsletter: {
            id: 'newsletter-1',
            title: 'AI & GenAI Weekly',
            weekStart: 'June 1, 2026',
            weekEnd: 'June 8, 2026',
            content: '# Content',
            generatedAt: '2026-06-08T09:00:00.000Z',
            model: 'gemini-2.0-flash-exp',
          },
        }, { authorization: 'Bearer expected-token' })
      );
      const body = (await response.json()) as { success: boolean; parsed: { articles: Array<{ imageUrl: string }> } };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterParser.parseNewsletter).toHaveBeenCalledTimes(1);
      expect(routeMocks.imageService.addImagesToArticles).toHaveBeenCalledWith(routeMocks.newsletterParser.parseNewsletter.mock.results[0].value.articles);
      expect(body.success).toBe(true);
      expect(body.parsed.articles[0].imageUrl).toBe('/images/article-1.jpg');
    });
  });

  describe('cron newsletter generation route', () => {
    it('returns 503 when the cron secret is not configured', async () => {
      const response = await cronGET(getRequest('http://localhost/api/cron/generate-newsletter'));
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(503);
      expect(body.error).toBe('Service unavailable.');
      expect(routeMocks.notificationService.sendError).not.toHaveBeenCalled();
    });

    it('returns 401 when the cron authorization header is wrong', async () => {
      vi.stubEnv('CRON_SECRET', 'expected-cron-secret');

      const response = await cronGET(
        getRequest('http://localhost/api/cron/generate-newsletter', { authorization: 'Bearer wrong-secret' })
      );
      const body = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(401);
      expect(body.error).toBe('Unauthorized.');
    });

    it('generates, stores, and reports a newsletter when authorized', async () => {
      vi.stubEnv('CRON_SECRET', 'expected-cron-secret');
      routeMocks.cronLogger.getRecentLogs.mockReturnValue(['log-1', 'log-2']);
      routeMocks.newsletterService.createNewsletter.mockResolvedValue({
        id: 'newsletter-3',
        title: 'AI & GenAI Weekly News Summary (June 1, 2026 - June 8, 2026)',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        content: '# Generated newsletter',
        generatedAt: '2026-06-08T09:00:00.000Z',
        model: 'gemini-2.0-flash-exp',
      });
      routeMocks.newsletterParser.parseNewsletter.mockReturnValue({
        id: 'newsletter-3',
        title: 'AI & GenAI Weekly',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        overview: 'Overview',
        generatedAt: '2026-06-08T09:00:00.000Z',
        model: 'gemini-2.0-flash-exp',
        articles: [{ id: 'article-1', title: 'Parsed', summary: 'Summary', content: 'Content', category: 'Research' }],
      });
      routeMocks.imageService.addImagesToArticles.mockResolvedValue([
        { id: 'article-1', title: 'Parsed', summary: 'Summary', content: 'Content', category: 'Research', imageUrl: '/images/parsed.jpg' },
      ]);
      routeMocks.newsletterDb.createNewsletter.mockResolvedValue({
        id: 'saved-newsletter-1',
        weekStart: 'June 1, 2026',
        weekEnd: 'June 8, 2026',
        overview: 'Overview',
        generatedAt: new Date('2026-06-08T09:00:00.000Z'),
        model: 'gemini-2.0-flash-exp',
        articles: [],
      });
      routeMocks.notificationService.sendSuccess.mockResolvedValue(undefined);

      const response = await cronGET(
        getRequest('http://localhost/api/cron/generate-newsletter', { authorization: 'Bearer expected-cron-secret' })
      );
      const body = (await response.json()) as {
        success: boolean;
        newsletter: { id: string; articleCount: number };
        duration: string;
      };

      expect(response.status).toBe(200);
      expect(routeMocks.newsletterService.createNewsletter).toHaveBeenCalledTimes(1);
      expect(routeMocks.newsletterDb.createNewsletter).toHaveBeenCalledTimes(1);
      expect(routeMocks.notificationService.sendSuccess).toHaveBeenCalledTimes(1);
      expect(body.success).toBe(true);
      expect(body.newsletter.id).toBe('saved-newsletter-1');
      expect(body.newsletter.articleCount).toBe(1);
      expect(body.duration).toMatch(/^\d+ms$/);
      expect(body).not.toHaveProperty('logs');
    });
  });
});
