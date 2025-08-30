"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Eye, Heart, MessageCircle, Clock, Flame } from "lucide-react"
import Link from "next/link"

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
  trendingScore: number
}

export default function TrendingPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [timeframe, setTimeframe] = useState("week")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingBlogs()
  }, [timeframe])

  const fetchTrendingBlogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trending?timeframe=${timeframe}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs)
      }
    } catch (error) {
      console.error("Failed to fetch trending blogs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case "day":
        return "Today"
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      case "all":
        return "All Time"
      default:
        return "This Week"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Trending Articles</h1>
              <p className="text-muted-foreground">
                Discover the most popular content based on likes, comments, and views
              </p>
            </div>
          </div>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Selection */}
        <div className="mb-6">
          <Badge variant="secondary" className="text-sm">
            <TrendingUp className="h-3 w-3 mr-1" />
            {getTimeframeLabel(timeframe)} • {blogs.length} articles
          </Badge>
        </div>

        {/* Trending Articles */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trending articles</h3>
              <p className="text-muted-foreground">
                No articles are trending in the selected timeframe. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog, index) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Trending Rank */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index < 3
                              ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </Badge>
                          {index < 3 && (
                            <Badge className="text-xs bg-gradient-to-r from-orange-400 to-red-500">
                              <Flame className="h-3 w-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                        </div>

                        <CardTitle className="text-xl mb-2 hover:text-primary">
                          <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                        </CardTitle>

                        <p className="text-sm text-muted-foreground mb-2">by {blog.author.name}</p>
                        <p className="text-muted-foreground line-clamp-2 mb-4">{blog.excerpt}</p>

                        {/* Engagement Metrics */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{blog.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{blog.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{blog.comments.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{Math.round(blog.trendingScore)} pts</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {blog.tags.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{blog.tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {blogs.length >= 20 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Trending Articles</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
