"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Shield,
  LogOut,
  EyeOff,
  Trash2,
} from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalBlogs: number
  pendingBlogs: number
  approvedBlogs: number
  rejectedBlogs: number
  totalViews: number
  totalLikes: number
  totalComments: number
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  status: "pending" | "approved" | "rejected" | "hidden"
  author: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  publishedAt?: string
  views: number
  likes: number
  comments: number
  rejectedReason?: string
}

interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBlogs: 0,
    pendingBlogs: 0,
    approvedBlogs: 0,
    rejectedBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  })
  const [pendingPosts, setPendingPosts] = useState<BlogPost[]>([])
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const [blogsRes, usersRes] = await Promise.all([
        fetch("/api/blogs", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (blogsRes.ok && usersRes.ok) {
        const [blogsData, usersData] = await Promise.all([blogsRes.json(), usersRes.json()])

        const blogs = blogsData.blogs || []
        const users = usersData.users || []

        const pendingBlogs = blogs.filter((b: BlogPost) => b.status === "pending")
        const approvedBlogs = blogs.filter((b: BlogPost) => b.status === "approved")
        const rejectedBlogs = blogs.filter((b: BlogPost) => b.status === "rejected")

        setStats({
          totalUsers: users.length,
          totalBlogs: blogs.length,
          pendingBlogs: pendingBlogs.length,
          approvedBlogs: approvedBlogs.length,
          rejectedBlogs: rejectedBlogs.length,
          totalViews: blogs.reduce((sum: number, b: BlogPost) => sum + (b.views || 0), 0),
          totalLikes: blogs.reduce((sum: number, b: BlogPost) => sum + (b.likes || 0), 0),
          totalComments: blogs.reduce((sum: number, b: BlogPost) => sum + (b.comments || 0), 0),
        })

        setAllPosts(blogs)
        setPendingPosts(pendingBlogs)
        setUsers(users)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostAction = async (postId: string, action: "approve" | "reject" | "hide", reason?: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/blogs/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, rejectedReason: reason }),
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
        setRejectingPostId(null)
        setRejectionReason("")
      }
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/blogs/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A"

    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage content, users, and platform analytics</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBlogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Blogs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedBlogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({stats.pendingBlogs})</TabsTrigger>
          <TabsTrigger value="posts">All Blogs ({stats.totalBlogs})</TabsTrigger>
          <TabsTrigger value="users">Users ({stats.totalUsers})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pending Posts */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingPosts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending blogs</h3>
                  <p className="text-muted-foreground">All submissions have been reviewed</p>
                </CardContent>
              </Card>
            ) : (
              pendingPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {post.author.name} • Submitted {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {rejectingPostId === post.id && (
                      <div className="mb-4 p-4 border rounded-lg bg-red-50">
                        <label className="block text-sm font-medium mb-2">Rejection Reason (Optional)</label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why this blog is being rejected..."
                          rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handlePostAction(post.id, "reject", rejectionReason)}
                          >
                            Confirm Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRejectingPostId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePostAction(post.id, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectingPostId(post.id)}
                        disabled={rejectingPostId === post.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* All Posts */}
        <TabsContent value="posts">
          <div className="space-y-4">
            {allPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {post.author.name} • {formatDate(post.publishedAt || post.createdAt)}
                      </p>
                      {post.rejectedReason && (
                        <p className="text-sm text-red-600 mt-1">Reason: {post.rejectedReason}</p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        post.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : post.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : post.status === "hidden"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {post.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {post.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => handlePostAction(post.id, "hide")}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Across all approved blogs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Total Likes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalLikes.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">User engagement metric</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Total Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalComments.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Community discussions</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
