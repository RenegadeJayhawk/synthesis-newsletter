'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Moon, Sun, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function Header() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchQuery.trim()

    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
    setMobileMenuOpen(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
              TS
            </div>
            <span className="font-bold text-xl">The Synthesis</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Primary navigation">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/articles" className="text-sm font-medium hover:text-primary transition-colors">
              Articles
            </Link>
            <Link href="/archive" className="text-sm font-medium hover:text-primary transition-colors">
              Archive
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/newsletter" className="text-sm font-medium hover:text-primary transition-colors">
              Newsletter
            </Link>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="w-64 pl-10"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  // Explicitly capture Enter key presses. In some browser/layout contexts,
                  // standard HTML form submission on Enter might be hijacked or fail,
                  // so we explicitly prevent default and push the search route here.
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    const query = searchQuery.trim()
                    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
                    setMobileMenuOpen(false)
                  }
                }}
                aria-label="Search articles"
              />
              <button type="submit" className="sr-only">
                Submit search
              </button>
            </form>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Open search"
            >
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/contact?topic=Newsletter%20subscription">Subscribe</Link>
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-nav-menu" className="md:hidden border-t py-4" aria-label="Mobile navigation">
            <div className="flex flex-col gap-2">
              <Link href="/" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/articles" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Articles
              </Link>
              <Link href="/archive" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Archive
              </Link>
              <Link href="/about" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/newsletter" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Newsletter
              </Link>
              <Link href="/contact?topic=Newsletter%20subscription" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Subscribe
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

