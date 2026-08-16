import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateDateRange, createNewsletter } from './newsletterService';
import { getDatabaseHealth, withDatabaseRetry } from './db/newsletterDbService';
import { validateSecretValue } from './apiSecurity';

const dateFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
} as const;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('newsletterService', () => {
  it('calculates a seven-day lookback range from the current date', () => {
    vi.useFakeTimers();
    const now = new Date('2026-06-15T12:00:00.000Z');
    const weekStart = new Date('2026-06-08T12:00:00.000Z');

    vi.setSystemTime(now);

    expect(calculateDateRange()).toEqual({
      startDate: weekStart.toLocaleDateString('en-US', dateFormatOptions),
      endDate: now.toLocaleDateString('en-US', dateFormatOptions),
    });
  });

  it('creates a newsletter object from the mock content fallback when no Gemini key is present', async () => {
    vi.useFakeTimers();
    const now = new Date('2026-06-15T12:00:00.000Z');
    const weekStart = new Date('2026-06-08T12:00:00.000Z');

    vi.setSystemTime(now);
    vi.stubEnv('GEMINI_API_KEY', '');

    const expectedStart = weekStart.toLocaleDateString('en-US', dateFormatOptions);
    const expectedEnd = now.toLocaleDateString('en-US', dateFormatOptions);

    const newsletter = await createNewsletter();

    expect(newsletter).toMatchObject({
      title: `AI & GenAI Weekly News Summary (${expectedStart} - ${expectedEnd})`,
      weekStart: expectedStart,
      weekEnd: expectedEnd,
      model: 'gemini-2.0-flash-exp',
    });
    expect(newsletter.id).toMatch(/^newsletter-\d+$/);
    expect(newsletter.generatedAt).toBe(now.toISOString());
    expect(newsletter.content).toContain('# AI & GenAI Weekly');
  });

  it('retries transient database failures before succeeding', async () => {
    let attemptCount = 0;

    const result = await withDatabaseRetry(async () => {
      attemptCount += 1;
      if (attemptCount < 2) {
        throw new Error('transient failure');
      }
      return 'ok';
    }, { retries: 3, delayMs: 1 });

    expect(result).toBe('ok');
    expect(attemptCount).toBe(2);
  });

  it('reports a degraded database health state when Postgres is not configured', () => {
    vi.stubEnv('POSTGRES_URL', '');

    expect(getDatabaseHealth()).toMatchObject({
      mode: 'mock',
      ready: false,
      fallback: 'in-memory',
    });
  });

  it('normalizes secret comparisons and rejects whitespace-only values', () => {
    vi.stubEnv('NEWSLETTER_ADMIN_UI_PASSWORD', 'expected-password');

    expect(validateSecretValue(' expected-password ', 'NEWSLETTER_ADMIN_UI_PASSWORD')).toBe('ok');
    expect(validateSecretValue('   ', 'NEWSLETTER_ADMIN_UI_PASSWORD')).toBe('invalid');
  });
});
