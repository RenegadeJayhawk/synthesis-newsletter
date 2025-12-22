'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/ui/PageTransition';

interface Newsletter {
  id: string;
  weekStart: string;
  weekEnd: string;
  model: string;
  generatedAt: string;
}

export default function ArchivePage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/newsletter/list');
      const data = await response.json();

      if (data.success) {
        setNewsletters(data.newsletters);
      } else {
        setError(data.error || 'Failed to load newsletters');
      }
    } catch (err) {
      setError('Failed to fetch newsletters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNewsletters = newsletters.filter((newsletter) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      newsletter.weekStart.toLowerCase().includes(query) ||
      newsletter.weekEnd.toLowerCase().includes(query)
    );
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Newsletter Archive
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Browse through our collection of AI & GenAI weekly newsletters, 
                featuring curated insights and breakthrough developments.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Count */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {filteredNewsletters.length} {filteredNewsletters.length === 1 ? 'Newsletter' : 'Newsletters'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletters List */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : filteredNewsletters.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {searchQuery ? 'No newsletters found matching your search.' : 'No newsletters available yet.'}
              </p>
              {!searchQuery && (
                <Link
                  href="/newsletter"
                  className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate First Newsletter
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredNewsletters.map((newsletter, index) => (
                <motion.div
                  key={newsletter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Link
                    href={`/archive/${newsletter.id}`}
                    className="group block h-full"
                  >
                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                      {/* Newsletter Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5" />
                          <span className="text-sm font-medium opacity-90">
                            Weekly Newsletter
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">
                          Week of {newsletter.weekStart}
                        </h3>
                        <p className="text-blue-100 text-sm mt-1">
                          to {newsletter.weekEnd}
                        </p>
                      </div>

                      {/* Newsletter Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(newsletter.generatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            {newsletter.model}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Explore this week's top AI & GenAI stories, breakthroughs, and insights.
                        </p>

                        <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:underline">
                          Read Newsletter →
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                Never Miss an Update
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Get the latest AI insights delivered to your inbox every week.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
// Force rebuild Sun Dec 21 23:30:15 EST 2025
