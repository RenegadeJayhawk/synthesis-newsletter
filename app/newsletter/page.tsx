'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar, Loader2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { NewsletterArticleList, NewsletterOverview } from '@/components/newsletter';
import { ParsedNewsletter } from '@/types/newsletter';

export default function NewsletterPage() {
  const [newsletter, setNewsletter] = useState<ParsedNewsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminGenerating, setAdminGenerating] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestNewsletter = useCallback(async () => {
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
    } catch (fetchError) {
      setError('Failed to load newsletter');
      console.error('Error fetching newsletter:', fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the latest newsletter on mount
  useEffect(() => {
    void fetchLatestNewsletter();
  }, [fetchLatestNewsletter]);

  const handleRefreshNewsletter = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await fetchLatestNewsletter();
    } catch (refreshError) {
      setError('Failed to refresh newsletter');
      console.error('Error refreshing newsletter:', refreshError);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAdminGenerateNewsletter = async () => {
    if (!adminPassword.trim()) {
      setAdminMessage('Enter the admin password to generate a newsletter.');
      return;
    }

    try {
      setAdminGenerating(true);
      setAdminMessage(null);

      const response = await fetch('/api/newsletter/admin-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.newsletter) {
        setAdminMessage(data.error || 'Admin generation failed.');
        return;
      }

      setNewsletter(data.newsletter as ParsedNewsletter);
      setAdminMessage('Newsletter generated successfully.');
      setAdminPassword('');
      setError(null);
    } catch (adminGenerateError) {
      setAdminMessage('Admin generation failed.');
      console.error('Error generating admin newsletter:', adminGenerateError);
    } finally {
      setAdminGenerating(false);
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
            onClick={handleRefreshNewsletter}
            disabled={refreshing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shrink-0"
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Newsletter
              </>
            )}
          </Button>
        </div>

        <details className="mb-8 rounded-lg border border-border bg-muted/20 p-4">
          <summary className="cursor-pointer text-sm font-semibold">Admin Tools</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Admin password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                autoComplete="current-password"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <Button
              onClick={handleAdminGenerateNewsletter}
              disabled={adminGenerating}
              className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
            >
              {adminGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate New Newsletter'
              )}
            </Button>
          </div>
          {adminMessage ? <p className="mt-3 text-sm text-muted-foreground">{adminMessage}</p> : null}
        </details>

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
