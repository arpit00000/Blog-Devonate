import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import type { Post } from "@/lib/models/Post"
import type { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userPayload = verifyToken(token)
    if (!userPayload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(userPayload.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const postData = await request.json()

    const newPost: Omit<Post, "_id"> = {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || postData.content.substring(0, 200) + "...",
      author: user._id!,
      authorName: user.name,
      authorAvatar: user.avatar,
      tags: postData.tags || [],
      status: postData.status || "draft",
      featured: false,
      likes: 0,
      views: 0,
      readTime: Math.ceil(postData.content.split(" ").length / 200), // Estimate reading time
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (postData.status === "submitted") {
      try {
        // AI moderation logic would go here
        // For now, auto-approve shorter posts, queue longer ones for review
        if (postData.content.length < 1000) {
          newPost.status = "published"
          newPost.publishedAt = new Date()
        } else {
          newPost.status = "pending"
        }
      } catch (error) {
        console.error("AI moderation failed:", error)
        newPost.status = "pending"
      }
    }

    const result = await db.collection<Post>("posts").insertOne(newPost)
    const createdPost = { ...newPost, _id: result.insertedId }

    return NextResponse.json({ post: createdPost })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = Number.parseInt(url.searchParams.get("skip") || "0")

    const query: any = {}
    if (status) {
      query.status = status
    }

    const posts = await db
      .collection<Post>("posts")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
