'use client';

import { NewsletterArticle } from '@/types/newsletter';
import NewsletterArticleItem from './NewsletterArticleItem';

interface NewsletterArticleListProps {
  articles: NewsletterArticle[];
  title?: string;
  description?: string;
}

export default function NewsletterArticleList({
  articles,
  title,
  description,
}: NewsletterArticleListProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No articles available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Optional Header */}
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Article List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {articles.map((article) => (
          <NewsletterArticleItem key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
