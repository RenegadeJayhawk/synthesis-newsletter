'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import { PageTransition } from '@/components/ui/PageTransition';
import NewsletterArticleList from '@/components/newsletter/NewsletterArticleList';
import { NewsletterArticle } from '@/types/newsletter';

export default function CategoryArchivePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [articles, setArticles] = useState<NewsletterArticle[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/category/${slug}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
        setCategoryName(data.category);
      } else {
        setError(data.error || 'Failed to load category articles');
      }
    } catch (err) {
      setError('Failed to fetch category articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      void fetchCategoryArticles();
    }
  }, [slug, fetchCategoryArticles]);

  return (
    <PageWrapper>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white py-20 border-b border-indigo-500/20">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-200 via-red-300 to-pink-500" />
            <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>

                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-5 w-5 text-blue-300" />
                  <span className="text-xs font-semibold tracking-wider uppercase text-blue-200">
                    Category Exploration
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-sm">
                  {loading ? (
                    <span className="inline-flex items-center gap-3">
                      Loading Category <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                    </span>
                  ) : (
                    `${categoryName}`
                  )}
                </h1>
                <p className="text-lg md:text-xl text-blue-100/90 max-w-3xl leading-relaxed">
                  {loading 
                    ? 'Fetching category publications...' 
                    : `Browse through our collection of premium articles, research briefs, and industry updates centered on ${categoryName}.`
                  }
                </p>
              </motion.div>
            </div>
          </div>

          {/* Articles Section */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Assembling category stream...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-lg backdrop-blur-sm">
                <p className="text-red-800 dark:text-red-300 font-medium text-lg mb-6">{error}</p>
                <button
                  onClick={fetchCategoryArticles}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Try Again
                </button>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-16 text-center max-w-2xl mx-auto shadow-xl">
                <BookOpen className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-500 mb-6" />
                <h3 className="text-xl font-bold mb-2">No articles found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  We don&apos;t have any publications indexed under this category at the moment.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  Back to Homepage
                </Link>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xl p-6 md:p-10"
              >
                <NewsletterArticleList
                  articles={articles}
                  title={`Latest in ${categoryName}`}
                  description="Curated insights, weekly summaries, and editorial publications."
                />
              </motion.div>
            )}
          </div>
        </div>
      </PageTransition>
    </PageWrapper>
  );
}
