'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/ui/PageTransition';
import { NewsletterOverview, NewsletterArticleList } from '@/components/newsletter';
import type { ParsedNewsletter } from '@/types/newsletter';

interface NewsletterData extends ParsedNewsletter {
  id: string;
  generatedAt: string;
  model: string;
}

export default function NewsletterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newsletter, setNewsletter] = useState<NewsletterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchNewsletter(params.id as string);
    }
  }, [params.id]);

  const fetchNewsletter = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/newsletter/${id}`);
      const data = await response.json();

      if (data.success) {
        setNewsletter(data.newsletter);
      } else {
        setError(data.error || 'Newsletter not found');
      }
    } catch (err) {
      setError('Failed to fetch newsletter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Newsletter not found'}
          </h1>
          <Link
            href="/archive"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/archive"
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Archive
              </Link>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                AI & GenAI Weekly Newsletter
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {newsletter.weekStart} - {newsletter.weekEnd}
                  </span>
                </div>
                <span>•</span>
                <span>
                  Generated {new Date(newsletter.generatedAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="px-2 py-1 bg-white/20 rounded text-sm">
                  {newsletter.model}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Overview */}
            {newsletter.overview && (
              <div className="mb-12">
                <NewsletterOverview
                  weekStart={newsletter.weekStart}
                  weekEnd={newsletter.weekEnd}
                  content={newsletter.overview}
                />
              </div>
            )}

            {/* Articles */}
            {newsletter.articles && newsletter.articles.length > 0 ? (
              <NewsletterArticleList
                articles={newsletter.articles}
                title="This Week's Top Stories"
                description="Curated insights from the latest developments in AI and GenAI"
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No articles found in this newsletter.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Want to see the latest newsletter?
            </h2>
            <Link
              href="/newsletter"
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              View Latest Newsletter
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
