"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Eye } from "lucide-react"
import { getUserSession } from "@/lib/auth"

interface BlogEngagementProps {
  blogId: string
  initialLikes: number
  initialComments: number
  views: number
}

export function BlogEngagement({ blogId, initialLikes, initialComments, views }: BlogEngagementProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkLikeStatus()
    trackView()
  }, [blogId])

  const checkLikeStatus = async () => {
    const session = getUserSession()
    if (!session) return

    try {
      const response = await fetch(`/api/blogs/${blogId}/like`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
      }
    } catch (error) {
      console.error("Failed to check like status:", error)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`/api/blogs/${blogId}/view`, { method: "POST" })
    } catch (error) {
      console.error("Failed to track view:", error)
    }
  }

  const handleLike = async () => {
    const session = getUserSession()
    if (!session) {
      // Redirect to login or show login modal
      window.location.href = "/login"
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/blogs/${blogId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikes((prev) => (data.liked ? prev + 1 : prev - 1))
      }
    } catch (error) {
      console.error("Failed to like/unlike:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant={isLiked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        <span>{likes}</span>
      </Button>

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span>{initialComments}</span>
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>{views}</span>
      </div>
    </div>
  )
}
