import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Calendar } from 'lucide-react'
import { Article } from '@/types'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/${article.slug}`}>
        <div className="relative">
          {article.featuredImage && (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
              >
                {article.category.name}
              </Badge>
              {article.isFeatured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>
            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-muted-foreground line-clamp-3">
              {article.excerpt}
            </p>
          </CardHeader>
        </div>
      </Link>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={article.author.avatar.url} alt={article.author.avatar.alt} />
            <AvatarFallback>{article.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{article.author.name}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{article.readingTime} min read</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

