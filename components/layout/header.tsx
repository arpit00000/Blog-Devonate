"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Menu, PenTool, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("search") as string
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="newspaper-heading text-xl text-primary">Devnovate</h1>
              <p className="text-xs text-muted-foreground -mt-1">Digital Newspaper</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/trending" className="text-sm font-medium hover:text-primary transition-colors">
              Trending
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-sm mx-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input name="search" placeholder="Search articles..." className="pl-10 pr-4" />
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link href="/create">
                <PenTool className="h-4 w-4 mr-2" />
                Write
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <form onSubmit={handleSearch} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input name="search" placeholder="Search articles..." className="pl-10 pr-4" />
                    </div>
                  </form>

                  <nav className="flex flex-col space-y-2">
                    <Link href="/trending" className="text-sm font-medium hover:text-primary transition-colors py-2">
                      Trending
                    </Link>
                    <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors py-2">
                      Categories
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors py-2">
                      About
                    </Link>
                  </nav>

                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/create">
                        <PenTool className="h-4 w-4 mr-2" />
                        Write Article
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/login">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
