import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateDateRange, createNewsletter } from './newsletterService';

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
});
