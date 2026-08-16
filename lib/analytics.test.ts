import { beforeEach, describe, expect, it, vi } from 'vitest';
import { trackEvent, trackNewsletterSignup, trackPageView } from './analytics';

describe('analytics helpers', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: { pathname: '/newsletter' },
        gtag: vi.fn(),
      },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'document', {
      value: { title: 'Newsletter' },
      configurable: true,
    });
  });

  it('fires page_view tracking with the current page URL', () => {
    const gtagSpy = vi.fn();
    Object.defineProperty(window, 'gtag', {
      value: gtagSpy,
      configurable: true,
    });

    trackPageView('/newsletter');

    expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', {
      page_location: '/newsletter',
      page_title: 'Newsletter',
    });
  });

  it('fires newsletter signup conversion tracking', () => {
    const gtagSpy = vi.fn();
    Object.defineProperty(window, 'gtag', {
      value: gtagSpy,
      configurable: true,
    });

    trackNewsletterSignup('homepage_cta');

    expect(gtagSpy).toHaveBeenCalledWith('event', 'newsletter_signup', {
      source: 'homepage_cta',
    });
  });

  it('tracks arbitrary events with properties', () => {
    const gtagSpy = vi.fn();
    Object.defineProperty(window, 'gtag', {
      value: gtagSpy,
      configurable: true,
    });

    trackEvent('article_view', { article_slug: 'test-slug' });

    expect(gtagSpy).toHaveBeenCalledWith('event', 'article_view', { article_slug: 'test-slug' });
  });
});
