require("dotenv").config({ path: ".env.local" })
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function fixAdminPassword() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI environment variable is required")
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db()
    const usersCollection = db.collection("users")

    // Hash the admin password properly
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Update the admin user's password
    const result = await usersCollection.updateOne(
      { email: "admin@devnovate.com" },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount > 0) {
      console.log("✅ Admin password updated successfully with bcrypt hash")
    } else {
      console.log("❌ Admin user not found")
    }
  } catch (error) {
    console.error("Error fixing admin password:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

fixAdminPassword()
