import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/metadata';
import { categories } from '@/lib/categories';
import { articles as staticArticles } from '@/lib/data';
import { newsletterDb } from '@/lib/db/newsletterDbService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // 1. Static pages
  const staticPaths = [
    '',
    '/articles',
    '/archive',
    '/about',
    '/newsletter',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const staticSitemaps = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }));

  // 2. Category pages
  const categorySitemaps = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Static article pages
  const articleSitemaps = staticArticles.map((art) => {
    let lastMod = new Date();
    try {
      if (art.date) {
        const parsed = new Date(art.date);
        if (!Number.isNaN(parsed.getTime())) {
          lastMod = parsed;
        }
      }
    } catch (error) {
      console.error('Error parsing static article date for sitemap:', error);
    }

    return {
      url: `${baseUrl}/${art.slug}`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    };
  });

  // 4. Dynamic newsletters (archives)
  let newsletterSitemaps: MetadataRoute.Sitemap = [];
  try {
    const dbNewsletters = await newsletterDb.listNewsletters(1000);
    newsletterSitemaps = dbNewsletters.map((n) => ({
      url: `${baseUrl}/archive/${n.id}`,
      lastModified: new Date(n.generatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Error generating dynamic sitemap newsletter entries:', error);
  }

  return [
    ...staticSitemaps,
    ...categorySitemaps,
    ...articleSitemaps,
    ...newsletterSitemaps,
  ];
}
