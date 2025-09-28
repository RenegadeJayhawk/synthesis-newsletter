'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Users, BookOpen } from 'lucide-react'
import ArticleCard from '@/components/article/ArticleCard'
import PageWrapper from '@/components/layout/PageWrapper'
import { GenerativeArtCanvas } from '@/components/generative/GenerativeArtCanvas'
import { motion } from 'framer-motion'
import { articles } from '@/lib/data'
import { 
  fadeInUp, 
  fadeInDown, 
  staggerContainer, 
  staggerItem, 
  heroTextAnimation,
  buttonHover,
  cardHover,
  scaleIn
} from '@/animations/variants'

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
          <motion.div 
            className="max-w-4xl mx-auto space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInDown}>
              <Badge 
                variant="secondary" 
                className="mb-4 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                AI-Powered Insights
              </Badge>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-bold leading-tight"
              variants={heroTextAnimation}
            >
              The Future of{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Discover cutting-edge research, breakthrough innovations, and expert insights 
              shaping the future of AI, machine learning, and intelligent systems.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <motion.div variants={buttonHover} whileHover="whileHover" whileTap="whileTap">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Explore Articles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div variants={buttonHover} whileHover="whileHover" whileTap="whileTap">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  Subscribe to Newsletter
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 bg-white dark:bg-slate-800"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div variants={scaleIn}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</h3>
              <p className="text-gray-600 dark:text-gray-300">Expert Articles</p>
            </motion.div>

            <motion.div variants={scaleIn}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10K+</h3>
              <p className="text-gray-600 dark:text-gray-300">Subscribers</p>
            </motion.div>

            <motion.div variants={scaleIn}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">95%</h3>
              <p className="text-gray-600 dark:text-gray-300">Reader Satisfaction</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Article Section */}
      <motion.section 
        className="py-20 bg-gray-50 dark:bg-slate-900"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Article
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our latest deep-dive into the most important developments in AI
            </p>
          </motion.div>

          {featuredArticle && (
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={cardHover}
              whileHover="whileHover"
            >
              <motion.div variants={fadeInUp}>
                <ArticleCard article={featuredArticle} />
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Latest Articles Section */}
      <motion.section 
        className="py-20 bg-white dark:bg-slate-800"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex justify-between items-center mb-16" variants={fadeInUp}>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Latest Articles
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Stay up-to-date with the latest insights and research
              </p>
            </div>
            <motion.div variants={buttonHover} whileHover="whileHover" whileTap="whileTap">
              <Link href="/archive">
                <Button variant="outline" size="lg">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {latestArticles.map((article) => (
              <motion.div 
                key={article.slug} 
                variants={staggerItem}
                whileHover={cardHover.whileHover}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div className="max-w-3xl mx-auto" variants={fadeInUp}>
            <h2 className="text-4xl font-bold mb-6">
              Stay Updated with The Synthesis
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the latest AI insights delivered to your inbox every week. 
              Join thousands of researchers, engineers, and enthusiasts.
            </p>
            <motion.div variants={buttonHover} whileHover="whileHover" whileTap="whileTap">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                Subscribe Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </PageWrapper>
  )
}
