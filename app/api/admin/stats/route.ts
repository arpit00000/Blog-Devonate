import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { Post } from "@/lib/models/Post"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const [totalUsers, totalPosts, pendingPosts, publishedPosts, rejectedPosts, allPosts] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: "submitted" }),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "rejected" }),
      Post.find({ status: "published" }).select("views likes comments"),
    ])

    const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0)
    const totalLikes = allPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
    const totalComments = allPosts.reduce((sum, post) => sum + (post.comments || 0), 0)

    const stats = {
      totalUsers,
      totalPosts,
      pendingPosts,
      publishedPosts,
      rejectedPosts,
      totalViews,
      totalLikes,
      totalComments,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
