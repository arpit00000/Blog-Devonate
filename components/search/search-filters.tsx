"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Filter } from "lucide-react"

interface SearchFiltersProps {
  query: string
  selectedTags: string[]
  author: string
  sortBy: string
  availableTags: { name: string; count: number }[]
  onQueryChange: (query: string) => void
  onTagsChange: (tags: string[]) => void
  onAuthorChange: (author: string) => void
  onSortChange: (sort: string) => void
  onSearch: () => void
  onClearFilters: () => void
}

export function SearchFilters({
  query,
  selectedTags,
  author,
  sortBy,
  availableTags,
  onQueryChange,
  onTagsChange,
  onAuthorChange,
  onSortChange,
  onSearch,
  onClearFilters,
}: SearchFiltersProps) {
  const [showAllTags, setShowAllTags] = useState(false)

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag))
  }

  const displayedTags = showAllTags ? availableTags : availableTags.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search articles, titles, content..."
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
            />
            <Button onClick={onSearch}>Search</Button>
          </div>
        </div>

        {/* Author Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Author</label>
          <Input
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="Filter by author name..."
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Selected Tags</label>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="default" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {displayedTags.map((tag) => (
              <Badge
                key={tag.name}
                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => addTag(tag.name)}
              >
                {tag.name} ({tag.count})
              </Badge>
            ))}
          </div>
          {availableTags.length > 10 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllTags(!showAllTags)}>
              {showAllTags ? "Show Less" : `Show All ${availableTags.length} Tags`}
            </Button>
          )}
        </div>

        {/* Clear Filters */}
        <Button variant="outline" onClick={onClearFilters} className="w-full bg-transparent">
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  )
}
