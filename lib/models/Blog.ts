import type { ObjectId } from "mongodb"

export interface Blog {
  _id?: ObjectId
  title: string
  content: string
  excerpt: string
  author: {
    id: string
    name: string
    email: string
  }
  status: "pending" | "approved" | "rejected" | "hidden"
  tags: string[]
  likes: number
  comments: number
  views: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  rejectedReason?: string
}

export interface BlogStats {
  totalBlogs: number
  pendingBlogs: number
  approvedBlogs: number
  rejectedBlogs: number
}

export interface Comment {
  _id?: ObjectId
  blogId: string
  author: {
    id: string
    name: string
    email: string
  }
  content: string
  createdAt: Date
}

export interface Like {
  _id?: ObjectId
  blogId: string
  userId: string
  createdAt: Date
}
