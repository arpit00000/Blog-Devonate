"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Save, Send, X } from "lucide-react"

interface BlogPost {
  id?: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  status: "draft" | "submitted" | "published" | "rejected"
}

interface BlogEditorProps {
  initialPost?: BlogPost
  onSave: (post: BlogPost) => Promise<void>
  onSubmit: (post: BlogPost) => Promise<void>
}

export function BlogEditor({ initialPost, onSave, onSubmit }: BlogEditorProps) {
  const [post, setPost] = useState<BlogPost>(
    initialPost || {
      title: "",
      content: "",
      excerpt: "",
      tags: [],
      status: "draft",
    },
  )
  const [tagInput, setTagInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("write")

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError("")
    try {
      await onSave({ ...post, status: "draft" })
    } catch (error) {
      setError("Failed to save draft")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!post.title.trim() || !post.content.trim()) {
      setError("Title and content are required")
      return
    }

    setIsLoading(true)
    setError("")
    try {
      await onSubmit({ ...post, status: "submitted" })
    } catch (error) {
      setError("Failed to submit for review")
    } finally {
      setIsLoading(false)
    }
  }

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - in production, use a proper markdown parser
    return content
      .replace(/^# (.*$)/gim, '<h1 class="newspaper-heading text-3xl mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="newspaper-subheading text-2xl mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="newspaper-subheading text-xl mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/\n/gim, "<br>")
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="newspaper-heading text-2xl">
            {initialPost ? "Edit Article" : "Create New Article"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Article Title</Label>
            <Input
              id="title"
              value={post.title}
              onChange={(e) => setPost((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter your article title..."
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={post.excerpt}
              onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief description of your article..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-2">
              <Label htmlFor="content">Content (Markdown supported)</Label>
              <Textarea
                id="content"
                value={post.content}
                onChange={(e) => setPost((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your article content here... You can use Markdown formatting."
                rows={20}
                className="font-mono"
              />
              <div className="text-sm text-muted-foreground">
                Tip: Use # for headings, **bold**, *italic*, and other Markdown syntax
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-lg p-6 min-h-[500px] bg-card">
                <h1 className="newspaper-heading text-3xl mb-4">{post.title || "Article Title"}</h1>
                {post.excerpt && <p className="text-muted-foreground mb-6 text-lg italic">{post.excerpt}</p>}
                <div
                  className="newspaper-body prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                />
                {post.tags.length > 0 && (
                  <div className="mt-8 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} variant="outline" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
