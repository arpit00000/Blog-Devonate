import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: "user" | "admin"
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  totalPosts: number
  totalLikes: number
  totalViews: number
  joinedDate: Date
}
