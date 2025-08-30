import { type NextRequest, NextResponse } from "next/server"
import { generateToken, hashPassword } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const existingUser = await db.collection<User>("users").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const newUser: Omit<User, "_id"> = {
      email,
      name,
      password: hashedPassword,
      role: "user", // Default role is user, not admin
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<User>("users").insertOne(newUser)
    const userId = result.insertedId.toString()

    const token = generateToken({
      id: userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    })

    return NextResponse.json({
      token,
      user: {
        id: userId,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
