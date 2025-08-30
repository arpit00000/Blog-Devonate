import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import type { Blog } from "@/lib/models/Blog"

export async function POST(request: NextRequest) {
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

    const { title, content, excerpt, tags } = await request.json()

    if (!title || !content || !excerpt) {
      return NextResponse.json({ error: "Title, content, and excerpt are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user details
    const user = await db.collection("users").findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newBlog: Omit<Blog, "_id"> = {
      title,
      content,
      excerpt,
      author: {
        id: decoded.userId,
        name: user.name,
        email: user.email,
      },
      status: "pending", // All blogs start as pending for admin approval
      tags: tags || [],
      likes: 0,
      comments: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Blog>("blogs").insertOne(newBlog)

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: "Blog submitted for approval",
    })
  } catch (error) {
    console.error("Blog creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const filter: any = {}
    if (status) filter.status = status
    if (userId) filter["author.id"] = userId

    const blogs = await db
      .collection<Blog>("blogs")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection<Blog>("blogs").countDocuments(filter)

    return NextResponse.json({
      blogs: blogs.map((blog) => ({
        ...blog,
        id: blog._id?.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Blog fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
