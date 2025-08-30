import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Blog } from "@/lib/models/Blog"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    // Increment view count
    await db.collection<Blog>("blogs").updateOne({ _id: new ObjectId(params.id) }, { $inc: { views: 1 } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("View tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
