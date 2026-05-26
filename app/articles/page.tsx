import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import ArticleCard from '@/components/article/ArticleCard'
import PageWrapper from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { articles } from '@/lib/data'

const categories = Array.from(new Set(articles.map((article) => article.category)))

export default function ArticlesPage() {
  const featuredArticle = articles.find((article) => article.featured)
  const recentArticles = articles.filter((article) => !article.featured)

  return (
    <PageWrapper>
      <section className="border-b bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="space-y-6">
              <Badge variant="outline" className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Editorial Coverage
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Reporting on the systems, policy, and products shaping AI.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  The Synthesis curates practical analysis for engineers, operators, and decision makers following fast-moving AI infrastructure and product shifts.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary" className="px-3 py-1 text-sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Coverage snapshot</p>
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-semibold">{articles.length}</p>
                  <p className="text-sm text-muted-foreground">Published stories</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Core beats</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold">Weekly</p>
                  <p className="text-sm text-muted-foreground">Newsletter cadence</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold">Expert</p>
                  <p className="text-sm text-muted-foreground">Operator perspective</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredArticle ? (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Featured</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Start with the lead story</h2>
              </div>
              <Button asChild variant="outline">
                <Link href={`/${featuredArticle.slug}`}>
                  Read featured article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="max-w-4xl">
              <ArticleCard article={featuredArticle} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Latest</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Recent coverage</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/search?q=AI">
                Search all coverage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {recentArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}