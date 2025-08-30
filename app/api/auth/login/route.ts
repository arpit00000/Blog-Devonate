import { type NextRequest, NextResponse } from "next/server"
import { generateToken, comparePassword } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection<User>("users").findOne({ email })

    console.log("[v0] Login attempt for email:", email)
    console.log("[v0] User found:", !!user)
    if (user) {
      console.log("[v0] User role:", user.role)
      console.log("[v0] Stored password format:", user.password?.substring(0, 10) + "...")
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isValidPassword = await comparePassword(password, user.password)
    console.log("[v0] Password comparison result:", isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = generateToken({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })

    return NextResponse.json({
      token,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
