'use client'

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export function ClientAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = pathname || window.location.pathname;
      trackPageView(currentPath);
    }
  }, [pathname]);

  return null;
}
