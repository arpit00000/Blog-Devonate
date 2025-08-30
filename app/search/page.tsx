"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
  }
  createdAt: string
  publishedAt?: string
  views: number
  likes: number
  comments: number
  tags: string[]
}

interface SearchResponse {
  blogs: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  availableTags: { name: string; count: number }[]
  query: {
    q: string
    tags: string[]
    author: string
    sortBy: string
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get("tags")?.split(",").filter(Boolean) || [])
  const [author, setAuthor] = useState(searchParams.get("author") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest")
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page") || "1"))

  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    performSearch()
  }, [currentPage])

  useEffect(() => {
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      performSearch()
    }
  }, [query, selectedTags, author, sortBy])

  const performSearch = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        tags: selectedTags.join(","),
        author,
        sortBy,
        page: currentPage.toString(),
        limit: "12",
      })

      // Update URL
      router.push(`/search?${params.toString()}`, { scroll: false })

      const response = await fetch(`/api/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearFilters = () => {
    setQuery("")
    setSelectedTags([])
    setAuthor("")
    setSortBy("newest")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Articles</h1>
          <p className="text-muted-foreground">
            Discover articles, filter by topics, and find content that interests you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              query={query}
              selectedTags={selectedTags}
              author={author}
              sortBy={sortBy}
              availableTags={searchResults?.availableTags || []}
              onQueryChange={setQuery}
              onTagsChange={setSelectedTags}
              onAuthorChange={setAuthor}
              onSortChange={setSortBy}
              onSearch={performSearch}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults
              blogs={searchResults?.blogs || []}
              isLoading={isLoading}
              pagination={searchResults?.pagination || { page: 1, limit: 12, total: 0, pages: 0 }}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
