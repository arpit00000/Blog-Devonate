import type { ObjectId } from "mongodb"

export interface Post {
  _id?: ObjectId
  title: string
  content: string
  excerpt: string
  author: ObjectId
  authorName: string
  authorAvatar?: string
  tags: string[]
  status: "draft" | "pending" | "published" | "rejected"
  featured: boolean
  likes: number
  views: number
  readTime: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  aiModerationResult?: {
    score: number
    feedback: string
    approved: boolean
    confidence: number
    categories: {
      quality: number
      appropriateness: number
      relevance: number
      readability: number
    }
    moderatedAt: Date
  }
}

export interface Comment {
  _id?: ObjectId
  postId: ObjectId
  author: ObjectId
  authorName: string
  content: string
  likes: number
  createdAt: Date
}

export interface Like {
  _id?: ObjectId
  postId: ObjectId
  userId: ObjectId
  createdAt: Date
}
