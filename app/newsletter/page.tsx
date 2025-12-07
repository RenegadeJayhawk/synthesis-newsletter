'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar, Loader2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ReactMarkdown from 'react-markdown';

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
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
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
        setNewsletter(data.newsletter);
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
        setNewsletter(data.newsletter);
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

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{newsletter.content}</ReactMarkdown>
            </article>
            
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
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
