'use client';

import ReactMarkdown from 'react-markdown';

interface NewsletterOverviewProps {
  content: string;
  weekStart: string;
  weekEnd: string;
}

export default function NewsletterOverview({
  content,
  weekStart,
  weekEnd,
}: NewsletterOverviewProps) {
  return (
    <div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
      {/* Week Range */}
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          Weekly Summary
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
          {weekStart} - {weekEnd}
        </p>
      </div>

      {/* Overview Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
