require("dotenv").config({ path: ".env.local" })
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function createAdminUser() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is required")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("devnovate_blog")
    const usersCollection = db.collection("users")

    // Check if admin user exists
    const existingAdmin = await usersCollection.findOne({ email: "admin@devnovate.com" })

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 12)

    if (existingAdmin) {
      // Update existing admin user with proper password hash
      await usersCollection.updateOne(
        { email: "admin@devnovate.com" },
        {
          $set: {
            password: hashedPassword,
            role: "admin",
            updatedAt: new Date(),
          },
        },
      )
      console.log("✅ Admin user password updated with bcrypt hash")
    } else {
      // Create new admin user
      const adminUser = {
        name: "Admin",
        email: "admin@devnovate.com",
        password: hashedPassword,
        role: "admin",
        bio: "Platform Administrator",
        avatar: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await usersCollection.insertOne(adminUser)
      console.log("✅ Admin user created successfully")
    }

    console.log("✅ Admin credentials: admin@devnovate.com / admin123")
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

createAdminUser()
