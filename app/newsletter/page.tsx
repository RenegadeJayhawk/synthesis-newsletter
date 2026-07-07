'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Calendar,
  Loader2,
  Newspaper,
  KeyRound,
  Clock,
  ShieldAlert,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
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
  const [adminError, setAdminError] = useState<{ code: number; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchLatestNewsletter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsEmpty(false);
      
      const response = await fetch('/api/newsletter/latest');
      
      if (response.status === 404) {
        setIsEmpty(true);
        setNewsletter(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.newsletter) {
        setNewsletter(data.newsletter);
        setIsEmpty(false);
      } else {
        setIsEmpty(true);
        setNewsletter(null);
      }
    } catch (fetchError) {
      setError('Failed to load newsletter. Please check your database connection or try again later.');
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
      setError('Failed to refresh newsletter. Please check the network connection.');
      console.error('Error refreshing newsletter:', refreshError);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAdminGenerateNewsletter = async () => {
    if (!adminPassword.trim()) {
      setAdminError({ code: 400, text: 'Please enter the admin password.' });
      setAdminMessage(null);
      return;
    }

    try {
      setAdminGenerating(true);
      setAdminError(null);
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

      if (!response.ok || !data.success) {
        setAdminError({
          code: response.status,
          text: data.error || 'Failed to generate newsletter.'
        });
        return;
      }

      setNewsletter(data.newsletter as ParsedNewsletter);
      setAdminMessage('Newsletter generated successfully.');
      setAdminPassword('');
      setError(null);
      setIsEmpty(false);
    } catch (adminGenerateError) {
      setAdminError({
        code: 500,
        text: 'A network error occurred during newsletter generation. Please check your server console.'
      });
      console.error('Error generating admin newsletter:', adminGenerateError);
    } finally {
      setAdminGenerating(false);
    }
  };

  const getActionableErrorMessage = (code: number, fallbackText: string) => {
    switch (code) {
      case 401:
        return {
          title: "Authentication Failed",
          message: "The admin password you entered is incorrect. Please verify the credentials and try again.",
          icon: KeyRound,
          colorClass: "border-amber-200 dark:border-amber-950/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300"
        };
      case 429:
        return {
          title: "Rate Limit Exceeded",
          message: "Newsletter generation has been requested too many times in a short window. Please wait a moment before trying again.",
          icon: Clock,
          colorClass: "border-yellow-200 dark:border-yellow-950/50 bg-yellow-50/50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300"
        };
      case 503:
        return {
          title: "Service Not Configured",
          message: "Admin newsletter generation is not configured on the server. Please check that NEWSLETTER_ADMIN_UI_PASSWORD is set in your server environment variables.",
          icon: ShieldAlert,
          colorClass: "border-red-200 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20 text-red-800 dark:text-red-300"
        };
      case 500:
        return {
          title: "Server Generation Failed",
          message: "The server encountered an error while compiling the newsletter. Verify that your API keys (GEMINI_API_KEY or OPENAI_API_KEY) are correctly configured with enough usage quota, and that the database is online.",
          icon: AlertTriangle,
          colorClass: "border-red-200 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20 text-red-800 dark:text-red-300"
        };
      default:
        return {
          title: "Operation Failed",
          message: fallbackText || "An unexpected error occurred. Please inspect the server logs or try again.",
          icon: AlertCircle,
          colorClass: "border-red-200 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20 text-red-800 dark:text-red-300"
        };
    }
  };

  const isGeneratingOrRefreshing = adminGenerating || refreshing;
  const isGenerateDisabled = isGeneratingOrRefreshing || loading;
  const isRefreshDisabled = isGeneratingOrRefreshing || loading;
  const isInputDisabled = adminGenerating || loading;

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
            disabled={isRefreshDisabled}
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

        {/* Admin Tools */}
        <details className="mb-8 rounded-lg border border-border bg-muted/20 p-4">
          <summary className="cursor-pointer text-sm font-semibold hover:text-primary transition-colors">
            Admin Tools
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Admin password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                disabled={isInputDisabled}
                onChange={(event) => setAdminPassword(event.target.value)}
                autoComplete="current-password"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <Button
              onClick={handleAdminGenerateNewsletter}
              disabled={isGenerateDisabled}
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
          {adminMessage ? (
            <div className="mt-3 p-3 text-sm text-green-800 dark:text-green-200 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl">
              {adminMessage}
            </div>
          ) : null}
        </details>

        {/* Actionable Error Message */}
        {adminError && (() => {
          const errorDetail = getActionableErrorMessage(adminError.code, adminError.text);
          const Icon = errorDetail.icon;
          return (
            <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-sm flex gap-4 items-start ${errorDetail.colorClass}`}>
              <div className="p-2 bg-background/50 dark:bg-background/20 rounded-xl shrink-0 shadow-xs">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="font-bold text-lg">{errorDetail.title}</h4>
                <p className="text-sm opacity-90 leading-relaxed">{errorDetail.message}</p>
                <div className="pt-2 border-t border-current/10 text-[10px] opacity-75 font-mono">
                  HTTP Status: {adminError.code}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Standard Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !newsletter && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Premium Empty State */}
        {isEmpty && !loading && (
          <div className="text-center py-20 px-6 max-w-2xl mx-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <Newspaper className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">No newsletter compiled yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Our automated weekly summary has not been generated for the database yet. 
              If you are an administrator, you can compile the first weekly release using the Admin Tools panel above.
            </p>
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
