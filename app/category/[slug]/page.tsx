import { notFound } from 'next/navigation'

import { categories } from '@/lib/categories'

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }))
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = categories.find((c) => c.slug === params.slug)
  if (!cat) return notFound()

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">{cat.title}</h1>
        <p className="text-muted-foreground">Articles in the {cat.title} category will appear here.</p>
      </div>
    </main>
  )
}
