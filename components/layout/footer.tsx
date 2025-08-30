import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <div>
                <h3 className="newspaper-heading text-lg text-primary">Devnovate</h3>
                <p className="text-xs text-muted-foreground -mt-1">Digital Newspaper</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A modern blogging platform with newspaper aesthetics and AI-powered content moderation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/trending" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Trending
              </Link>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Search
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
            </nav>
          </div>

          {/* For Writers */}
          <div className="space-y-4">
            <h4 className="font-semibold">For Writers</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/create" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Write Article
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/guidelines" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Guidelines
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">© 2024 Devnovate. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Admin
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Powered by AI Moderation</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
