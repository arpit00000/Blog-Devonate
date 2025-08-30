"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, Heart, MessageCircle, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  status: "draft" | "submitted" | "published" | "rejected"
  author: {
    name: string
    email: string
  }
  createdAt: Date
  publishedAt?: Date
  views?: number
  likes?: number
  comments?: number
}

interface BlogCardProps {
  post: BlogPost
  showActions?: boolean
  onEdit?: (post: BlogPost) => void
  onDelete?: (postId: string) => void
}

export function BlogCard({ post, showActions = false, onEdit, onDelete }: BlogCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "submitted":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/blog/${post.id}`}>
              <h3 className="newspaper-subheading text-lg hover:text-primary cursor-pointer line-clamp-2">
                {post.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              <span>by {post.author.name}</span>
            </div>
          </div>
          <Badge className={getStatusColor(post.status)} variant="secondary">
            {post.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="newspaper-body text-muted-foreground mb-4 line-clamp-3 flex-1">{post.excerpt}</p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
            )}
            {post.likes !== undefined && (
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>
            )}
            {post.comments !== undefined && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit?.(post)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDelete?.(post.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
