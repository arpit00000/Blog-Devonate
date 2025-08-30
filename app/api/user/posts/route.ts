import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Mock posts database - in real app, this would be shared
const posts: any[] = []

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Filter posts by user
    const userPosts = posts.filter((post) => post.author.id === user.userId)

    // Calculate stats
    const stats = {
      totalPosts: userPosts.length,
      publishedPosts: userPosts.filter((p) => p.status === "published").length,
      draftPosts: userPosts.filter((p) => p.status === "draft").length,
      submittedPosts: userPosts.filter((p) => p.status === "submitted").length,
      totalViews: userPosts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalLikes: userPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
    }

    return NextResponse.json({ posts: userPosts, stats })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
