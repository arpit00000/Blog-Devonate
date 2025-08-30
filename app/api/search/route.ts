import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Blog } from "@/lib/models/Blog"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || []
    const author = searchParams.get("author") || ""
    const sortBy = searchParams.get("sortBy") || "newest"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    // Build search filter
    const filter: any = {
      status: "approved", // Only show approved blogs in search
    }

    // Text search across title, excerpt, and content
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ]
    }

    // Filter by tags
    if (tags.length > 0) {
      filter.tags = { $in: tags }
    }

    // Filter by author name
    if (author) {
      filter["author.name"] = { $regex: author, $options: "i" }
    }

    // Build sort options
    let sortOptions: any = {}
    switch (sortBy) {
      case "newest":
        sortOptions = { publishedAt: -1, createdAt: -1 }
        break
      case "oldest":
        sortOptions = { publishedAt: 1, createdAt: 1 }
        break
      case "popular":
        sortOptions = { likes: -1, views: -1 }
        break
      case "trending":
        sortOptions = { views: -1, likes: -1, comments: -1 }
        break
      default:
        sortOptions = { publishedAt: -1, createdAt: -1 }
    }

    // Execute search
    const [blogs, total, allTags] = await Promise.all([
      db.collection<Blog>("blogs").find(filter).sort(sortOptions).skip(skip).limit(limit).toArray(),
      db.collection<Blog>("blogs").countDocuments(filter),
      // Get all available tags for filter options
      db
        .collection<Blog>("blogs")
        .aggregate([
          { $match: { status: "approved" } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 50 },
        ])
        .toArray(),
    ])

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
      availableTags: allTags.map((tag) => ({
        name: tag._id,
        count: tag.count,
      })),
      query: {
        q: query,
        tags,
        author,
        sortBy,
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
