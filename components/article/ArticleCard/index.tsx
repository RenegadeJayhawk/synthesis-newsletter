import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, Calendar } from 'lucide-react'
import { Article } from '@/lib/data'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/${article.slug}`}>
        <div className="relative">
          {article.image && (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {article.category}
              </Badge>
              {article.featured && (
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
            <AvatarFallback>{article.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{article.author}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{article.readTime}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

