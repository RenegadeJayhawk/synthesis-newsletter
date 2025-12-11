'use client';

import { NewsletterArticle } from '@/types/newsletter';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface NewsletterArticleItemProps {
  article: NewsletterArticle;
}

export default function NewsletterArticleItem({ article }: NewsletterArticleItemProps) {
  const {
    title,
    summary,
    author,
    category,
    imageUrl,
    sourceUrl,
  } = article;

  // Placeholder image if none provided
  const displayImage = imageUrl || '/images/placeholder-article.jpg';

  const ArticleContent = () => (
    <>
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        {/* Category Badge */}
        {category && (
          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-base text-gray-600 dark:text-gray-400 mb-3 leading-relaxed line-clamp-3">
          {summary}
        </p>

        {/* Author/Metadata */}
        {author && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <span className="font-medium">{author}</span>
            {sourceUrl && (
              <>
                <span className="text-gray-400">•</span>
                <ExternalLink className="h-3 w-3" />
              </>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Image */}
      <div className="flex-shrink-0 w-full sm:w-48 md:w-56 lg:w-64 h-40 sm:h-32 md:h-36 relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
        <Image
          src={displayImage}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 224px, 256px"
        />
      </div>
    </>
  );

  // Wrap in link if sourceUrl provided
  if (sourceUrl) {
    return (
      <article className="group">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 -mx-4 px-4 rounded-lg transition-colors"
        >
          <ArticleContent />
        </a>
      </article>
    );
  }

  // No link, just display
  return (
    <article className="group flex flex-col sm:flex-row gap-4 sm:gap-6 py-6">
      <ArticleContent />
    </article>
  );
}
