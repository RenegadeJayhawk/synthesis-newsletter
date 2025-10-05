import React from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/layout/PageWrapper'

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-24 px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-4">404 — Page not found</h1>
  <p className="text-lg text-muted-foreground mb-6">Sorry, we could not find the page you are looking for.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="btn">Go home</Link>
          <Link href="/contact" className="btn btn-outline">Contact us</Link>
        </div>
      </div>
    </PageWrapper>
  )
}
