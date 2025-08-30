"use client"

import { BlogEditor } from "@/components/blog/blog-editor"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const router = useRouter()

  const handleSave = async (post: any) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      })

      if (response.ok) {
        alert("Draft saved successfully!")
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (post: any) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      })

      if (response.ok) {
        alert("Article submitted for review!")
        router.push("/dashboard")
      } else {
        throw new Error("Failed to submit")
      }
    } catch (error) {
      throw error
    }
  }

  return <BlogEditor onSave={handleSave} onSubmit={handleSubmit} />
}
