import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  FileText,
  Zap,
  PenTool,
  Search,
  Shield,
  Eye,
  Heart,
  MessageCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
  }
  createdAt: string
  views: number
  likes: number
  comments: number
  tags: string[]
}

async function getLatestBlogs(): Promise<BlogPost[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/blogs?status=approved&limit=6`,
      {
        cache: "no-store",
      },
    )
    if (response.ok) {
      const data = await response.json()
      return data.blogs || []
    }
  } catch (error) {
    console.error("Failed to fetch latest blogs:", error)
  }
  return []
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default async function HomePage() {
  const latestBlogs = await getLatestBlogs()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="space-y-6">
              <Badge variant="secondary" className="mb-4">
                <Zap className="h-3 w-3 mr-1" />
                AI-Powered Content Platform
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance">
                The Future of
                <span className="text-primary block">Digital Publishing</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join Devnovate's modern blogging platform where cutting-edge AI meets timeless newspaper aesthetics.
                Write, publish, and discover exceptional content with intelligent moderation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/signup">
                    <PenTool className="h-5 w-5 mr-2" />
                    Start Writing
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                  <Link href="/search">
                    <Search className="h-5 w-5 mr-2" />
                    Explore Content
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Articles</h2>
                <p className="text-lg text-muted-foreground">Discover the newest approved content from our community</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/search">View All</Link>
              </Button>
            </div>

            {latestBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestBlogs.map((blog) => (
                  <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(blog.createdAt)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl line-clamp-2 hover:text-primary">
                        <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3">{blog.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>by {blog.author.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{blog.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{blog.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{blog.comments}</span>
                          </div>
                        </div>
                      </div>

                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{blog.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to publish content on our platform!</p>
                  <Button asChild>
                    <Link href="/create-blog">
                      <PenTool className="h-4 w-4 mr-2" />
                      Write First Article
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="newspaper-subheading text-2xl">1,000+</h3>
                <p className="text-muted-foreground">Articles Published</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="newspaper-subheading text-2xl">500+</h3>
                <p className="text-muted-foreground">Active Writers</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="newspaper-subheading text-2xl">50K+</h3>
                <p className="text-muted-foreground">Monthly Readers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="newspaper-heading text-3xl md:text-4xl">Why Choose Devnovate?</h2>
              <p className="newspaper-body text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the perfect blend of traditional journalism and modern technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI Moderation</CardTitle>
                  <CardDescription>
                    Advanced AI automatically reviews content for quality and appropriateness, ensuring high editorial
                    standards.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <PenTool className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Rich Editor</CardTitle>
                  <CardDescription>
                    Write with our intuitive markdown editor featuring live preview, syntax highlighting, and seamless
                    publishing.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Discovery</CardTitle>
                  <CardDescription>
                    Intelligent algorithms surface trending content and help readers discover articles tailored to their
                    interests.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center max-w-3xl">
            <div className="space-y-6">
              <h2 className="newspaper-heading text-3xl md:text-4xl">Ready to Share Your Story?</h2>
              <p className="text-lg opacity-90">
                Join thousands of writers who trust Devnovate to publish their best work. Start writing today and reach
                readers who matter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                  <Link href="/signup">Create Account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
