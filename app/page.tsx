import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Users, BookOpen } from 'lucide-react'
import ArticleCard from '@/components/article/ArticleCard'
import PageWrapper from '@/components/layout/PageWrapper'
import { GenerativeArtCanvas } from '@/components/generative/GenerativeArtCanvas'
import { articles } from '@/lib/data'

export default function HomePage() {
  const featuredArticle = articles.find(article => article.featured)
  const latestArticles = articles.filter(article => !article.featured).slice(0, 3)

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        {/* Generative Art Background */}
        <div className="absolute inset-0 opacity-30">
          <GenerativeArtCanvas />
        </div>
        
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="mb-4">
              AI-Powered Insights
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              The Future of{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover cutting-edge research, breakthrough innovations, and expert insights 
              shaping the future of AI, machine learning, and intelligent systems.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Explore Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Subscribe to Newsletter
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-3xl font-bold">50+</span>
                </div>
                <p className="text-muted-foreground">Expert Articles</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-3xl font-bold">10K+</span>
                </div>
                <p className="text-muted-foreground">Subscribers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-3xl font-bold">95%</span>
                </div>
                <p className="text-muted-foreground">Reader Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Article</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our latest deep-dive into the most important developments in AI
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <ArticleCard article={featuredArticle} />
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Latest Articles</h2>
              <p className="text-muted-foreground">
                Stay up-to-date with the latest insights and research
              </p>
            </div>
            <Link href="/archive">
              <Button variant="outline">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Stay Updated with The Synthesis</h2>
            <p className="text-blue-100">
              Get the latest AI insights delivered to your inbox every week. 
              Join thousands of researchers, engineers, and enthusiasts.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Subscribe Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
