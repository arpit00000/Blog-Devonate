import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt: Date
}

export interface AuthToken {
  userId: string
  email: string
  role: "user" | "admin"
}

export function generateToken(user: User): string {
  const payload: AuthToken = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function setUserSession(user: User, token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export function getUserSession(): { user: User; token: string } | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        return { user, token }
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearUserSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }
}

export function isAdmin(): boolean {
  const session = getUserSession()
  return session?.user?.role === "admin"
}

export function isUser(): boolean {
  const session = getUserSession()
  return session?.user?.role === "user"
}
