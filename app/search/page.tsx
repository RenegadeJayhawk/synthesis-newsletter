'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'
import ArticleCard from '@/components/article/ArticleCard'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { articles } from '@/lib/data'

function matchesArticleQuery(query: string, value: string) {
  return value.toLowerCase().includes(query)
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredArticles = useMemo(() => {
    if (!normalizedQuery) {
      return articles
    }

    return articles.filter((article) => {
      const searchableValues = [
        article.title,
        article.excerpt,
        article.author,
        article.category,
        article.slug,
        ...article.tags,
      ]

      return searchableValues.some((value) => matchesArticleQuery(normalizedQuery, value))
    })
  }, [normalizedQuery])

  return (
    <PageWrapper>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Article Search
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Search the latest AI coverage
            </h1>
            <p className="text-lg text-muted-foreground">
              Find articles by title, author, category, or tags.
            </p>
            <div className="relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search articles, topics, and authors"
                className="h-14 rounded-full pl-12 pr-4 text-base"
                aria-label="Search articles"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Results</h2>
              <p className="text-muted-foreground">
                {normalizedQuery
                  ? `${filteredArticles.length} result${filteredArticles.length === 1 ? '' : 's'} for "${searchQuery.trim()}"`
                  : `Showing all ${articles.length} articles`}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/archive">
                Browse newsletter archive
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed bg-muted/30 px-6 py-16 text-center">
              <div className="mx-auto max-w-xl space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight">No articles matched that search</h3>
                <p className="text-muted-foreground">
                  Try a broader keyword, an author name, or a category like Artificial Intelligence.
                </p>
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear search
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageWrapper><section className="py-24"><div className="container mx-auto px-4 sm:px-6 lg:px-8"><p className="text-center text-muted-foreground">Loading search...</p></div></section></PageWrapper>}>
      <SearchPageContent />
    </Suspense>
  )
}