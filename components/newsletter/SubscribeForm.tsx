'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface SubscribeFormProps {
  variant?: 'footer' | 'inline' | 'sidebar'
  buttonText?: string
  placeholderText?: string
}

export default function SubscribeForm({
  variant = 'inline',
  buttonText = 'Subscribe',
  placeholderText = 'Enter your email',
}: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = (await response.json()) as { success: boolean; message?: string; error?: string }

      if (data.success) {
        setMessage(data.message || 'Thank you for subscribing!')
        setEmail('')
      } else {
        setError(data.error || 'Failed to subscribe')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'footer') {
    return (
      <form className="space-y-2" onSubmit={handleSubmit}>
        <Input 
          type="email"
          placeholder={placeholderText} 
          aria-label="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
          disabled={loading}
        />
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonText}
        </Button>
        {message && <p className="text-xs text-green-400 mt-2 font-medium" role="status">{message}</p>}
        {error && <p className="text-xs text-red-400 mt-2 font-medium" role="alert">{error}</p>}
      </form>
    )
  }

  if (variant === 'sidebar') {
    return (
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input 
          type="email"
          placeholder={placeholderText} 
          aria-label="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background text-foreground border-input placeholder:text-muted-foreground"
          disabled={loading}
        />
        <Button type="submit" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing...
            </span>
          ) : buttonText}
        </Button>
        {message && <p className="text-xs text-green-300 mt-2 font-medium" role="status">{message}</p>}
        {error && <p className="text-xs text-red-300 mt-2 font-medium" role="alert">{error}</p>}
      </form>
    )
  }

  // default 'inline' variant (Homepage and Archive Page)
  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder={placeholderText}
          aria-label="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="h-12 px-8 rounded-lg font-medium bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Subscribing...
            </span>
          ) : (
            buttonText
          )}
        </Button>
      </form>
      {message && <p className="text-sm text-green-300 mt-3 font-medium text-center" role="status">{message}</p>}
      {error && <p className="text-sm text-red-300 mt-3 font-medium text-center" role="alert">{error}</p>}
    </div>
  )
}
