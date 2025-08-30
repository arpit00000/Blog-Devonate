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

    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean()

    // Get post counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const postsCount = await Post.countDocuments({ author: user._id })
        const publishedCount = await Post.countDocuments({ author: user._id, status: "published" })

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          postsCount,
          publishedCount,
        }
      }),
    )

    return NextResponse.json({ users: usersWithCounts })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
