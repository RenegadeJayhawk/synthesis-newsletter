import { Metadata } from 'next';

export const siteConfig = {
  name: 'The Synthesis',
  description: 'Discover cutting-edge research, breakthrough innovations, and expert insights shaping the future of AI, machine learning, and intelligent systems.',
  url: 'https://synthesis-newsletter.vercel.app',
  ogImage: 'https://synthesis-newsletter.vercel.app/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/synthesis_ai',
    github: 'https://github.com/synthesis-ai',
  },
};

export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'artificial intelligence',
    'machine learning',
    'AI research',
    'technology insights',
    'neural networks',
    'deep learning',
    'AI newsletter',
    'tech analysis',
  ],
  authors: [
    {
      name: 'The Synthesis Team',
      url: siteConfig.url,
    },
  ],
  creator: 'The Synthesis',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@synthesis_ai',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export function generateArticleMetadata(article: {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
  author: string;
  date: string;
}): Metadata {
  const url = `${siteConfig.url}/${article.slug}`;
  const imageUrl = article.image || siteConfig.ogImage;

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      title: article.title,
      description: article.excerpt,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      authors: [article.author],
      publishedTime: article.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [imageUrl],
      creator: '@synthesis_ai',
    },
    alternates: {
      canonical: url,
    },
  };
}
