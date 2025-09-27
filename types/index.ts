export interface Author {
  id: string
  name: string
  bio: string
  avatar: {
    url: string
    alt: string
  }
  expertise: string[]
  socialLinks: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: Author
  category: Category
  tags: Tag[]
  featuredImage?: {
    url: string
    alt: string
    width: number
    height: number
  }
  publishedAt: string
  updatedAt: string
  readingTime: number
  isPublished: boolean
  isFeatured: boolean
}

export interface AnimationVariants {
  initial: any
  animate: any
  exit?: any
  transition?: any
}

