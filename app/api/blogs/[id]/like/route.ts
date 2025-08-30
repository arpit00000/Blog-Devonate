import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Blog } from "@/lib/models/Blog"
import type { Like } from "@/lib/models/Blog"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const blogId = params.id

    // Check if user already liked this blog
    const existingLike = await db.collection<Like>("likes").findOne({
      blogId,
      userId: decoded.userId,
    })

    if (existingLike) {
      // Unlike: Remove like and decrement counter
      await Promise.all([
        db.collection<Like>("likes").deleteOne({ _id: existingLike._id }),
        db.collection<Blog>("blogs").updateOne({ _id: new ObjectId(blogId) }, { $inc: { likes: -1 } }),
      ])

      return NextResponse.json({ liked: false, message: "Blog unliked" })
    } else {
      // Like: Add like and increment counter
      const newLike: Omit<Like, "_id"> = {
        blogId,
        userId: decoded.userId,
        createdAt: new Date(),
      }

      await Promise.all([
        db.collection<Like>("likes").insertOne(newLike),
        db.collection<Blog>("blogs").updateOne({ _id: new ObjectId(blogId) }, { $inc: { likes: 1 } }),
      ])

      return NextResponse.json({ liked: true, message: "Blog liked" })
    }
  } catch (error) {
    console.error("Like/unlike error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ liked: false })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ liked: false })
    }

    const { db } = await connectToDatabase()
    const existingLike = await db.collection<Like>("likes").findOne({
      blogId: params.id,
      userId: decoded.userId,
    })

    return NextResponse.json({ liked: !!existingLike })
  } catch (error) {
    return NextResponse.json({ liked: false })
  }
}
