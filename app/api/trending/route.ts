import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Blog } from "@/lib/models/Blog"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "week" // week, month, all
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const { db } = await connectToDatabase()

    // Calculate date threshold based on timeframe
    let dateThreshold: Date | null = null
    const now = new Date()

    switch (timeframe) {
      case "day":
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "week":
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "all":
      default:
        dateThreshold = null
        break
    }

    // Build aggregation pipeline for trending calculation
    const pipeline: any[] = [
      {
        $match: {
          status: "approved",
          ...(dateThreshold && { publishedAt: { $gte: dateThreshold } }),
        },
      },
      {
        $addFields: {
          // Calculate trending score based on engagement and recency
          trendingScore: {
            $add: [
              { $multiply: ["$likes", 3] }, // Likes have 3x weight
              { $multiply: ["$comments", 5] }, // Comments have 5x weight
              { $multiply: ["$views", 1] }, // Views have 1x weight
              // Recency bonus (newer posts get higher score)
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [new Date(), { $ifNull: ["$publishedAt", "$createdAt"] }],
                      },
                      1000 * 60 * 60 * 24, // Convert to days
                    ],
                  },
                  -0.1, // Negative weight for age (newer = higher score)
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { trendingScore: -1 },
      },
      {
        $limit: limit,
      },
    ]

    const trendingBlogs = await db.collection<Blog>("blogs").aggregate(pipeline).toArray()

    return NextResponse.json({
      blogs: trendingBlogs.map((blog) => ({
        ...blog,
        id: blog._id?.toString(),
      })),
      timeframe,
      total: trendingBlogs.length,
    })
  } catch (error) {
    console.error("Trending blogs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
