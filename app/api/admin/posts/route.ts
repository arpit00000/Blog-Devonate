import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
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

    const posts = await Post.find().populate("author", "name email").sort({ createdAt: -1 }).lean()

    // Transform the data to match the expected format
    const transformedPosts = posts.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      excerpt: post.excerpt || post.content.substring(0, 150) + "...",
      content: post.content,
      tags: post.tags || [],
      status: post.status,
      author: {
        id: post.author._id.toString(),
        name: post.author.name,
        email: post.author.email,
      },
      createdAt: post.createdAt,
      submittedAt: post.submittedAt,
      publishedAt: post.publishedAt,
      views: post.views || 0,
      likes: post.likes || 0,
      comments: post.comments || 0,
    }))

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error("Admin posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
