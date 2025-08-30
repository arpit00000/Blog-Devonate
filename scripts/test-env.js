require("dotenv").config({ path: ".env.local" })

console.log("Testing environment variables:")
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY)

if (process.env.MONGODB_URI) {
  console.log("MONGODB_URI starts with:", process.env.MONGODB_URI.substring(0, 20) + "...")
} else {
  console.log("MONGODB_URI is not loaded")
}
