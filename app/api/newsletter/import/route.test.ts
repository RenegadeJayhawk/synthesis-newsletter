import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as importPOST } from './route';
import { POST as ingestPOST } from '@/app/api/ingest/route';

const routeMocks = vi.hoisted(() => ({
  newsletterParser: {
    parseNewsletter: vi.fn(),
  },
  imageService: {
    addImagesToArticles: vi.fn(),
  },
  newsletterDb: {
    createNewsletter: vi.fn(),
    getNewsletterById: vi.fn(),
    toApiFormat: vi.fn(),
    isPersistenceReady: vi.fn(() => true),
  },
  databaseHealth: {
    mode: 'postgres',
    ready: true,
    fallback: 'postgres',
    configured: true,
    checkedAt: new Date().toISOString(),
  },
  notificationService: {
    sendSuccess: vi.fn(),
    sendError: vi.fn(),
  },
}));

vi.mock('@/lib/newsletterParser', () => routeMocks.newsletterParser);
vi.mock('@/lib/imageService', () => routeMocks.imageService);
vi.mock('@/lib/db/newsletterDbService', () => ({
  newsletterDb: routeMocks.newsletterDb,
  getDatabaseHealth: vi.fn(() => routeMocks.databaseHealth),
}));
vi.mock('@/lib/notificationService', () => ({ notificationService: routeMocks.notificationService }));

function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  routeMocks.databaseHealth.ready = true;
});

describe('Newsletter import and ingest routes', () => {
  const ingestToken = 'test-ingest-token';

  describe('Security and Authorization', () => {
    it('returns 503 when no secret token is configured in environment', async () => {
      vi.unstubAllEnvs();

      const response = await importPOST(
        jsonRequest('http://localhost/api/newsletter/import', { weekStart: 'Nov 1', weekEnd: 'Nov 8' }, {
          authorization: 'Bearer test-ingest-token',
        })
      );

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toBe('Service unavailable.');
    });

    it('returns 401 when authorization header is missing', async () => {
      vi.stubEnv('NEWSLETTER_INGEST_TOKEN', ingestToken);

      const response = await importPOST(
        jsonRequest('http://localhost/api/newsletter/import', { weekStart: 'Nov 1', weekEnd: 'Nov 8' })
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized.');
    });

    it('returns 401 when bearer token is invalid', async () => {
      vi.stubEnv('NEWSLETTER_INGEST_TOKEN', ingestToken);

      const response = await importPOST(
        jsonRequest('http://localhost/api/newsletter/import', { weekStart: 'Nov 1', weekEnd: 'Nov 8' }, {
          authorization: 'Bearer wrong-token',
        })
      );

      expect(response.status).toBe(401);
    });

    it('authorizes when x-api-key matches NEWSLETTER_INGEST_TOKEN', async () => {
      vi.stubEnv('NEWSLETTER_INGEST_TOKEN', ingestToken);
      routeMocks.imageService.addImagesToArticles.mockImplementation(async (arts) => arts);
      routeMocks.newsletterDb.createNewsletter.mockResolvedValue({
        id: 'new-id-1',
        weekStart: 'Nov 1, 2026',
        weekEnd: 'Nov 8, 2026',
        content: '# News',
        model: 'test-model',
        generatedAt: new Date(),
      });

      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          {
            weekStart: 'Nov 1, 2026',
            weekEnd: 'Nov 8, 2026',
            articles: [{ title: 'Art 1', summary: 'Summary 1' }],
          },
          { 'x-api-key': ingestToken }
        )
      );

      expect(response.status).toBe(201);
    });

    it('authorizes with fallback NEWSLETTER_ADMIN_TOKEN when INGEST token is unset', async () => {
      vi.stubEnv('NEWSLETTER_ADMIN_TOKEN', 'admin-token-backup');
      routeMocks.imageService.addImagesToArticles.mockImplementation(async (arts) => arts);
      routeMocks.newsletterDb.createNewsletter.mockResolvedValue({
        id: 'new-id-2',
        weekStart: 'Nov 1, 2026',
        weekEnd: 'Nov 8, 2026',
        content: '# News',
        model: 'test-model',
        generatedAt: new Date(),
      });

      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          {
            weekStart: 'Nov 1, 2026',
            weekEnd: 'Nov 8, 2026',
            articles: [{ title: 'Art 1', summary: 'Summary 1' }],
          },
          { authorization: 'Bearer admin-token-backup' }
        )
      );

      expect(response.status).toBe(201);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      vi.stubEnv('NEWSLETTER_INGEST_TOKEN', ingestToken);
    });

    it('returns 400 for invalid JSON body', async () => {
      const response = await importPOST(
        jsonRequest('http://localhost/api/newsletter/import', '{ invalid json', {
          authorization: `Bearer ${ingestToken}`,
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid JSON request body.');
    });

    it('returns 400 when weekStart or weekEnd is missing', async () => {
      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          { weekStart: 'Nov 1, 2026' },
          { authorization: `Bearer ${ingestToken}` }
        )
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("'weekStart' and 'weekEnd' are required");
    });

    it('returns 400 when neither content nor articles is provided', async () => {
      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          { weekStart: 'Nov 1, 2026', weekEnd: 'Nov 8, 2026' },
          { authorization: `Bearer ${ingestToken}` }
        )
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Either 'content' (raw markdown) or non-empty 'articles' array must be provided.");
    });

    it('returns 400 when article in articles array is missing title or summary', async () => {
      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          {
            weekStart: 'Nov 1, 2026',
            weekEnd: 'Nov 8, 2026',
            articles: [{ title: '', summary: 'some summary' }],
          },
          { authorization: `Bearer ${ingestToken}` }
        )
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("missing a valid 'title'");
    });

    it('returns 503 when database health is not ready', async () => {
      routeMocks.databaseHealth.ready = false;

      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          {
            weekStart: 'Nov 1, 2026',
            weekEnd: 'Nov 8, 2026',
            content: '# AI News',
          },
          { authorization: `Bearer ${ingestToken}` }
        )
      );

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toContain('Newsletter persistence is not configured');
    });
  });

  describe('Import Execution', () => {
    beforeEach(() => {
      vi.stubEnv('NEWSLETTER_INGEST_TOKEN', ingestToken);
      routeMocks.imageService.addImagesToArticles.mockImplementation(async (arts) => arts);
    });

    it('successfully imports markdown content, parses articles, enriches images, and notifies', async () => {
      const rawMarkdown = '# AI & GenAI Weekly\n\n## 1. Overview\nOverview text\n\n## 2. Gemini 2.5\nSummary of Gemini';
      routeMocks.newsletterParser.parseNewsletter.mockReturnValue({
        id: '',
        title: 'AI & GenAI Weekly: Nov 1, 2026 - Nov 8, 2026',
        weekStart: 'Nov 1, 2026',
        weekEnd: 'Nov 8, 2026',
        overview: 'Overview text',
        articles: [
          {
            id: 'art-1',
            title: 'Gemini 2.5',
            summary: 'Summary of Gemini',
            content: 'Summary of Gemini',
            category: 'Major Breakthroughs & Research',
          },
        ],
        generatedAt: '2026-11-08T09:00:00.000Z',
        model: 'custom-importer',
        rawContent: rawMarkdown,
      });

      routeMocks.newsletterDb.createNewsletter.mockResolvedValue({
        id: 'imported-id-123',
        weekStart: 'Nov 1, 2026',
        weekEnd: 'Nov 8, 2026',
        content: rawMarkdown,
        model: 'custom-importer',
        overview: 'Overview text',
        generatedAt: new Date('2026-11-08T09:00:00.000Z'),
      });

      routeMocks.newsletterDb.getNewsletterById.mockResolvedValue({
        id: 'imported-id-123',
        weekStart: 'Nov 1, 2026',
        weekEnd: 'Nov 8, 2026',
        content: rawMarkdown,
        model: 'custom-importer',
        overview: 'Overview text',
        generatedAt: new Date('2026-11-08T09:00:00.000Z'),
        articles: [],
      });

      routeMocks.newsletterDb.toApiFormat.mockReturnValue({
        id: 'imported-id-123',
        title: 'AI & GenAI Weekly: Nov 1, 2026 - Nov 8, 2026',
        weekStart: 'Nov 1, 2026',
        weekEnd: 'Nov 8, 2026',
        overview: 'Overview text',
        articles: [
          {
            id: 'art-1',
            title: 'Gemini 2.5',
            summary: 'Summary of Gemini',
            category: 'Major Breakthroughs & Research',
          },
        ],
        generatedAt: '2026-11-08T09:00:00.000Z',
        model: 'custom-importer',
      });

      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          {
            weekStart: 'Nov 1, 2026',
            weekEnd: 'Nov 8, 2026',
            content: rawMarkdown,
            model: 'custom-importer',
          },
          { authorization: `Bearer ${ingestToken}` }
        )
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.newsletter.id).toBe('imported-id-123');
      expect(routeMocks.newsletterParser.parseNewsletter).toHaveBeenCalled();
      expect(routeMocks.imageService.addImagesToArticles).toHaveBeenCalled();
      expect(routeMocks.notificationService.sendSuccess).toHaveBeenCalled();
    });

    it('successfully imports structured articles JSON and generates markdown content', async () => {
      routeMocks.newsletterDb.createNewsletter.mockImplementation(async (data) => ({
        id: 'structured-123',
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        content: data.content,
        model: data.model,
        generatedAt: new Date(),
      }));

      routeMocks.newsletterDb.getNewsletterById.mockResolvedValue(null);

      const response = await importPOST(
        jsonRequest(
          'http://localhost/api/newsletter/import',
          {
            weekStart: 'Nov 1, 2026',
            weekEnd: 'Nov 8, 2026',
            overview: 'Custom overview',
            notify: false,
            articles: [
              {
                title: 'Quantum Advantage with AI',
                summary: 'New quantum machine learning benchmark published.',
                category: 'Major Breakthroughs & Research',
                author: 'Dr. Jane Smith',
                sourceUrl: 'https://example.com/quantum',
              },
            ],
          },
          { authorization: `Bearer ${ingestToken}` }
        )
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(routeMocks.newsletterDb.createNewsletter).toHaveBeenCalled();
      const calledArgs = routeMocks.newsletterDb.createNewsletter.mock.calls[0];
      // Verifies markdown content was auto-generated
      expect(calledArgs[0].content).toContain('Quantum Advantage with AI');
      expect(calledArgs[0].content).toContain('## 1. Overview');
      // Verifies notify: false suppressed notification
      expect(routeMocks.notificationService.sendSuccess).not.toHaveBeenCalled();
    });

    it('works via the /api/ingest alias route', async () => {
      routeMocks.newsletterDb.createNewsletter.mockResolvedValue({
        id: 'alias-123',
        weekStart: 'Nov 1, 2026',
        weekEnd: 'Nov 8, 2026',
        content: '# Test',
        model: 'alias-test',
        generatedAt: new Date(),
      });

      const response = await ingestPOST(
        jsonRequest(
          'http://localhost/api/ingest',
          {
            weekStart: 'Nov 1, 2026',
            weekEnd: 'Nov 8, 2026',
            articles: [{ title: 'Alias Title', summary: 'Alias summary' }],
            notify: false,
          },
          { authorization: `Bearer ${ingestToken}` }
        )
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.newsletter.id).toBe('alias-123');
    });
  });
});
