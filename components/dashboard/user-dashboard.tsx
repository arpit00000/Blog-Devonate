"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, FileText, Clock, CheckCircle, LogOut, Eye, Heart } from "lucide-react"
import Link from "next/link"
import { clearUserSession, getUserSession } from "@/lib/auth"
import { ProfileSettings } from "@/components/profile/profile-settings"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  status: "pending" | "approved" | "rejected" | "hidden"
  author: {
    name: string
    email: string
  }
  createdAt: string
  publishedAt?: string
  views: number
  likes: number
  comments: number
  rejectedReason?: string
}

interface DashboardStats {
  totalPosts: number
  approvedPosts: number
  pendingPosts: number
  rejectedPosts: number
  totalViews: number
  totalLikes: number
}

export function UserDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    approvedPosts: 0,
    pendingPosts: 0,
    rejectedPosts: 0,
    totalViews: 0,
    totalLikes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session.user)
    }
    fetchUserPosts()
  }, [])

  const fetchUserPosts = async () => {
    try {
      const session = getUserSession()
      if (!session) return

      const response = await fetch(`/api/blogs?userId=${session.user.id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const userPosts = data.blogs || []
        setPosts(userPosts)

        // Calculate stats
        const approved = userPosts.filter((p: BlogPost) => p.status === "approved")
        const pending = userPosts.filter((p: BlogPost) => p.status === "pending")
        const rejected = userPosts.filter((p: BlogPost) => p.status === "rejected")

        setStats({
          totalPosts: userPosts.length,
          approvedPosts: approved.length,
          pendingPosts: pending.length,
          rejectedPosts: rejected.length,
          totalViews: userPosts.reduce((sum: number, p: BlogPost) => sum + (p.views || 0), 0),
          totalLikes: userPosts.reduce((sum: number, p: BlogPost) => sum + (p.likes || 0), 0),
        })
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearUserSession()
    window.location.href = "/login"
  }

  const filterPosts = (status: string) => {
    if (status === "all") return posts
    return posts.filter((post) => post.status === status)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "hidden":
        return <Badge className="bg-gray-100 text-gray-800">Hidden</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {user && (
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-muted-foreground">Manage your articles and track performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/create-blog">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">My Articles</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approvedPosts})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pendingPosts})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejectedPosts})</TabsTrigger>
            </TabsList>

            {["all", "approved", "pending", "rejected"].map((status) => (
              <TabsContent key={status} value={status}>
                <div className="space-y-4">
                  {filterPosts(status).length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No {status === "all" ? "" : status} articles yet</h3>
                        <p className="text-muted-foreground mb-4">
                          {status === "all"
                            ? "Start writing your first article to share with the world"
                            : `You don't have any ${status} articles`}
                        </p>
                        {status === "all" && (
                          <Link href="/create-blog">
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Your First Article
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filterPosts(status).map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(post.status)}
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(post.publishedAt || post.createdAt)}
                                </span>
                              </div>
                              <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                              <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>

                              {post.rejectedReason && (
                                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                                  <p className="text-sm text-red-700">
                                    <strong>Rejection Reason:</strong> {post.rejectedReason}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{post.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  <span>{post.likes}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
