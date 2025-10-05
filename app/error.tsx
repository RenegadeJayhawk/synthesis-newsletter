"use client"

import React from 'react'
import PageWrapper from '@/components/layout/PageWrapper'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-24 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-lg text-muted-foreground mb-6">{error?.message || 'An unexpected error occurred.'}</p>
        <div className="flex items-center justify-center gap-4">
          <button className="btn" onClick={() => reset()}>Try again</button>
        </div>
      </div>
    </PageWrapper>
  )
}
