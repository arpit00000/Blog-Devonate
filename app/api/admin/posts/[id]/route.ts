import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Post } from "@/lib/models/Post"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { action } = await request.json()
    const postId = params.id

    await connectDB()

    let updateData: any = {}
    let newStatus = ""

    switch (action) {
      case "approve":
        newStatus = "published"
        updateData = {
          status: "published",
          publishedAt: new Date(),
          moderatedBy: user.id,
          moderatedAt: new Date(),
        }
        break
      case "reject":
        newStatus = "rejected"
        updateData = {
          status: "rejected",
          moderatedBy: user.id,
          moderatedAt: new Date(),
        }
        break
      case "hide":
        newStatus = "hidden"
        updateData = {
          status: "hidden",
          moderatedBy: user.id,
          moderatedAt: new Date(),
        }
        break
      case "delete":
        await Post.findByIdAndDelete(postId)
        console.log(`Admin ${user.email} deleted post ${postId}`)
        return NextResponse.json({ success: true, deleted: true })
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, { new: true })

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    console.log(`Admin ${user.email} performed action "${action}" on post ${postId}`)
    return NextResponse.json({ success: true, newStatus })
  } catch (error) {
    console.error("Admin post action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
