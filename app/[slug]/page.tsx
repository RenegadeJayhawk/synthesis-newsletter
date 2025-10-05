import { notFound } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { articles } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArticlePageProps {
  // `params` may be provided as a thenable by Next's runtime. Declare it as
  // either the object or a promise of the object so `await params` is typed.
  params: { slug: string } | Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // Await params per Next.js guidance for dynamic routes in the App Router.
  const { slug } = await params;
  const article = articles.find((article) => article.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-white/20 text-white">
              {article.category}
            </Badge>
            {article.featured && (
              <Badge className="bg-yellow-500/20 text-white">
                Featured
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-blue-100 mb-8 max-w-3xl">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Article Image */}
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {article.excerpt}
              </p>

              <h2>Introduction</h2>
              <p>
                The landscape of artificial intelligence is rapidly evolving, with new breakthroughs 
                emerging at an unprecedented pace. In this comprehensive analysis, we explore the 
                latest developments that are shaping the future of AI technology and its applications 
                across various industries.
              </p>

              <h2>Key Developments</h2>
              <p>
                Recent advances in machine learning algorithms have opened new possibilities for 
                solving complex problems that were previously thought to be intractable. From 
                natural language processing to computer vision, AI systems are becoming increasingly 
                sophisticated and capable.
              </p>

              <h3>Breakthrough Technologies</h3>
              <ul>
                <li>Advanced neural network architectures</li>
                <li>Improved training methodologies</li>
                <li>Enhanced computational efficiency</li>
                <li>Better data utilization techniques</li>
              </ul>

              <h2>Industry Impact</h2>
              <p>
                The implications of these technological advances extend far beyond the research 
                laboratory. Industries ranging from healthcare to finance are beginning to 
                integrate these new AI capabilities into their core operations, leading to 
                significant improvements in efficiency and effectiveness.
              </p>

              <blockquote>
                &ldquo;The future of AI lies not just in making machines smarter, but in making 
                them more aligned with human values and needs.&rdquo; - Leading AI Researcher
              </blockquote>

              <h2>Looking Forward</h2>
              <p>
                As we look to the future, it&apos;s clear that AI will continue to play an increasingly 
                important role in shaping our world. The key will be ensuring that these 
                technologies are developed and deployed responsibly, with careful consideration 
                of their potential impact on society.
              </p>

              <p>
                The journey ahead is filled with both opportunities and challenges. By staying 
                informed about the latest developments and engaging in thoughtful dialogue about 
                the implications of AI technology, we can work together to create a future that 
                benefits everyone.
              </p>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Share & Save */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold mb-4">Share this article</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save for later
                  </Button>
                </div>
              </div>

              {/* Author Info */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold mb-4">About the Author</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{article.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI Researcher</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expert in artificial intelligence and machine learning with over 10 years 
                  of experience in the field.
                </p>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Stay Updated</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Get the latest AI insights delivered to your inbox.
                </p>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  Subscribe Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-white dark:bg-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles
              .filter((a) => a.slug !== article.slug)
              .slice(0, 3)
              .map((relatedArticle) => (
                <Link
                  key={relatedArticle.slug}
                  href={`/${relatedArticle.slug}`}
                  className="group block"
                >
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                    <div className="aspect-video relative">
                      <Image
                        src={relatedArticle.image}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <Badge variant="secondary" className="mb-2">
                        {relatedArticle.category}
                      </Badge>
                      <h3 className="font-semibold mt-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {relatedArticle.excerpt.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{relatedArticle.author}</span>
                        <span>{relatedArticle.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
