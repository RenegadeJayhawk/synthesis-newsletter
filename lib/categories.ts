export interface Category {
  slug: string
  name: string
}

export const categories: Category[] = [
  { slug: 'ai', name: 'Artificial Intelligence' },
  { slug: 'ml', name: 'Machine Learning' },
  { slug: 'robotics', name: 'Robotics' },
  { slug: 'ethics', name: 'AI Ethics' },
]

export const categorySlugs = categories.map((category) => category.slug)
