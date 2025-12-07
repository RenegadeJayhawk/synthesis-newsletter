import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                TS
              </div>
              <span className="font-bold text-xl">The Synthesis</span>
            </div>
            <p className="text-slate-300 text-sm">
              AI-powered insights for the future of technology. Stay ahead of the curve with expert analysis and breakthrough research.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-slate-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/articles" className="text-slate-300 hover:text-white transition-colors">Articles</Link></li>
              <li><Link href="/archive" className="text-slate-300 hover:text-white transition-colors">Archive</Link></li>
              <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/ai" className="text-slate-300 hover:text-white transition-colors">Artificial Intelligence</Link></li>
              <li><Link href="/category/ml" className="text-slate-300 hover:text-white transition-colors">Machine Learning</Link></li>
              <li><Link href="/category/robotics" className="text-slate-300 hover:text-white transition-colors">Robotics</Link></li>
              <li><Link href="/category/ethics" className="text-slate-300 hover:text-white transition-colors">AI Ethics</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-slate-300 text-sm mb-4">
              Get the latest AI insights delivered to your inbox.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 The Synthesis. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

