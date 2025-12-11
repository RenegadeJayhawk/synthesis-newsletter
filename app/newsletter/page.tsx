'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar, Loader2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { NewsletterArticleList, NewsletterOverview } from '@/components/newsletter';
import { ParsedNewsletter } from '@/types/newsletter';

interface Newsletter {
  id: string;
  title: string;
  weekStart: string;
  weekEnd: string;
  content: string;
  generatedAt: string;
  model: string;
}

export default function NewsletterPage() {
  const [newsletter, setNewsletter] = useState<ParsedNewsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the latest newsletter on mount
  useEffect(() => {
    fetchLatestNewsletter();
  }, []);

  const fetchLatestNewsletter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/newsletter/latest');
      const data = await response.json();
      
      if (data.success && data.newsletter) {
        // Parse the newsletter content
        const parsed = await parseNewsletterContent(data.newsletter);
        setNewsletter(parsed);
      } else {
        setError('No newsletter available. Click "Refresh Newsletter" to generate one.');
      }
    } catch (err) {
      setError('Failed to load newsletter');
      console.error('Error fetching newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewsletter = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch('/api/newsletter/generate', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success && data.newsletter) {
        // Parse the newsletter content
        const parsed = await parseNewsletterContent(data.newsletter);
        setNewsletter(parsed);
      } else {
        setError(data.error || 'Failed to generate newsletter');
      }
    } catch (err) {
      setError('Failed to generate newsletter');
      console.error('Error generating newsletter:', err);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Parse newsletter content and add images
   */
  const parseNewsletterContent = async (rawNewsletter: Newsletter): Promise<ParsedNewsletter> => {
    try {
      // Call API to parse newsletter
      const response = await fetch('/api/newsletter/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsletter: rawNewsletter }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse newsletter');
      }

      const data = await response.json();
      return data.parsed;
    } catch (error) {
      console.error('Error parsing newsletter:', error);
      // Fallback: return basic structure
      return {
        ...rawNewsletter,
        overview: 'Newsletter overview',
        articles: [],
      };
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI & GenAI Weekly Newsletter</h1>
            {newsletter && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Week of {newsletter.weekStart} - {newsletter.weekEnd}
              </p>
            )}
          </div>
          
          <Button
            onClick={handleGenerateNewsletter}
            disabled={generating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shrink-0"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Newsletter
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !newsletter && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Newsletter Content */}
        {newsletter && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8">
            {/* Overview Section */}
            {newsletter.overview && (
              <NewsletterOverview
                content={newsletter.overview}
                weekStart={newsletter.weekStart}
                weekEnd={newsletter.weekEnd}
              />
            )}

            {/* Article List */}
            {newsletter.articles && newsletter.articles.length > 0 ? (
              <NewsletterArticleList
                articles={newsletter.articles}
                title="This Week's Top Stories"
                description="Curated insights from the latest developments in AI and GenAI"
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No articles found in this newsletter.
                </p>
              </div>
            )}
            
            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-muted-foreground">
                Generated on {new Date(newsletter.generatedAt).toLocaleString()} using {newsletter.model}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
