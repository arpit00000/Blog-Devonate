// Database initialization script
const path = require("path")
const fs = require("fs")

// Try multiple paths for .env.local
const envPaths = [path.join(__dirname, "..", ".env.local"), path.join(process.cwd(), ".env.local"), ".env.local"]

let envLoaded = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${envPath}`)
    require("dotenv").config({ path: envPath })
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  console.log("No .env.local file found. Checking available files:")
  console.log("Current directory:", process.cwd())
  console.log("Script directory:", __dirname)
  try {
    const files = fs.readdirSync(process.cwd())
    console.log(
      "Files in current directory:",
      files.filter((f) => f.startsWith(".env")),
    )
  } catch (e) {
    console.log("Could not read directory")
  }
}

const { MongoClient } = require("mongodb")

console.log("Environment check:")
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("MONGODB_URI environment variable is required")
  console.error("Make sure your .env.local file exists and contains MONGODB_URI")
  process.exit(1)
}

async function initializeDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db("devnovate-blog")

    // Create indexes for better performance
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("posts").createIndex({ author: 1 })
    await db.collection("posts").createIndex({ status: 1 })
    await db.collection("posts").createIndex({ tags: 1 })
    await db.collection("posts").createIndex({ createdAt: -1 })
    await db.collection("likes").createIndex({ postId: 1, userId: 1 }, { unique: true })
    await db.collection("comments").createIndex({ postId: 1 })

    // Create default admin user
    const adminExists = await db.collection("users").findOne({ email: "admin@devnovate.com" })
    if (!adminExists) {
      await db.collection("users").insertOne({
        name: "Admin User",
        email: "admin@devnovate.com",
        password: "YWRtaW4xMjM=", // admin123 encoded - change in production
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log("Default admin user created")
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization failed:", error)
  } finally {
    await client.close()
  }
}

initializeDatabase()
