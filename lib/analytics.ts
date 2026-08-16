// Analytics and performance monitoring utilities

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    if (window.gtag) {
      window.gtag('event', eventName, properties ?? {});
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('Event tracked:', eventName, properties);
    }
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined') {
    const pathname = url || window.location.pathname;
    const pageTitle = typeof document !== 'undefined' && document.title
      ? document.title
      : pathname.split('/').filter(Boolean).pop() || 'Home';

    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: pathname,
        page_title: pageTitle,
      });
    }
  }
};

export const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Core Web Vitals tracking
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          trackEvent('web_vital_lcp', { value: entry.startTime });
        }
        if (entry.entryType === 'first-input') {
          const firstInputEntry = entry as PerformanceEventTiming;
          trackEvent('web_vital_fid', { value: firstInputEntry.processingStart - firstInputEntry.startTime });
        }
        if (entry.entryType === 'layout-shift') {
          const layoutShiftEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!layoutShiftEntry.hadRecentInput) {
            trackEvent('web_vital_cls', { value: layoutShiftEntry.value });
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }
  }
};

// Article engagement tracking
export const trackArticleView = (articleSlug: string, articleTitle: string) => {
  trackEvent('article_view', {
    article_slug: articleSlug,
    article_title: articleTitle,
  });
};

export const trackArticleShare = (articleSlug: string, platform: string) => {
  trackEvent('article_share', {
    article_slug: articleSlug,
    platform,
  });
};

export const trackNewsletterSignup = (source: string) => {
  trackEvent('newsletter_signup', {
    source,
  });
};

export const trackNewsletterCTA = (source: string) => {
  trackEvent('newsletter_cta_click', {
    source,
  });
};

// Declare global gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}
