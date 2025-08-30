"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, CheckCircle, XCircle, AlertTriangle, Eye, TrendingUp } from "lucide-react"

interface AIModerationResult {
  id: string
  postId: string
  postTitle: string
  author: string
  result: {
    category: "approved" | "flagged" | "rejected"
    confidence: number
    score: number
    feedback: string
    categories: {
      quality: number
      appropriateness: number
      relevance: number
      readability: number
    }
  }
  createdAt: Date
  reviewedByHuman: boolean
  humanDecision?: "approve" | "reject"
}

interface AIModerationStats {
  totalModerated: number
  autoApproved: number
  flaggedForReview: number
  autoRejected: number
  averageConfidence: number
  humanOverrides: number
}

export function AIModerationPanel() {
  const [moderationResults, setModerationResults] = useState<AIModerationResult[]>([])
  const [stats, setStats] = useState<AIModerationStats>({
    totalModerated: 0,
    autoApproved: 0,
    flaggedForReview: 0,
    autoRejected: 0,
    averageConfidence: 0,
    humanOverrides: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchModerationData()
  }, [])

  const fetchModerationData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/ai-moderation", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setModerationResults(data.results)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch moderation data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHumanReview = async (resultId: string, decision: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/ai-moderation/${resultId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ humanDecision: decision }),
      })

      if (response.ok) {
        fetchModerationData() // Refresh data
      }
    } catch (error) {
      console.error("Failed to update moderation result:", error)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Auto-Approved</Badge>
      case "flagged":
        return <Badge className="bg-yellow-100 text-yellow-800">Flagged for Review</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Auto-Rejected</Badge>
      default:
        return <Badge variant="secondary">{category}</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading AI moderation data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-primary" />
        <div>
          <h2 className="newspaper-subheading text-xl">AI Moderation Dashboard</h2>
          <p className="newspaper-body text-muted-foreground">
            Monitor and review AI-powered content moderation decisions
          </p>
        </div>
      </div>

      {/* AI Moderation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Moderated</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModerated}</div>
            <p className="text-xs text-muted-foreground">Posts processed by AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.autoApproved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalModerated > 0 ? Math.round((stats.autoApproved / stats.totalModerated) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged for Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedForReview}</div>
            <p className="text-xs text-muted-foreground">Requires human review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.autoRejected}</div>
            <p className="text-xs text-muted-foreground">Automatically declined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageConfidence}%</div>
            <p className="text-xs text-muted-foreground">AI decision confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Human Overrides</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.humanOverrides}</div>
            <p className="text-xs text-muted-foreground">Manual decisions made</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flagged">Flagged for Review ({stats.flaggedForReview})</TabsTrigger>
          <TabsTrigger value="all">All Results ({stats.totalModerated})</TabsTrigger>
          <TabsTrigger value="overrides">Human Overrides ({stats.humanOverrides})</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged">
          <div className="space-y-4">
            {moderationResults
              .filter((result) => result.result.category === "flagged" && !result.reviewedByHuman)
              .map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="newspaper-subheading text-lg">{result.postTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {result.author} • Moderated {formatDate(result.createdAt)}
                        </p>
                      </div>
                      {getCategoryBadge(result.result.category)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Confidence:</span>
                        <span className={`text-sm font-bold ${getConfidenceColor(result.result.confidence)}`}>
                          {result.result.confidence}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quality:</span>
                          <div className="font-medium">{result.result.categories.quality}/10</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Appropriateness:</span>
                          <div className="font-medium">{result.result.categories.appropriateness}/10</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Relevance:</span>
                          <div className="font-medium">{result.result.categories.relevance}/10</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Readability:</span>
                          <div className="font-medium">{result.result.categories.readability}/10</div>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">AI Feedback:</p>
                        <p className="text-sm text-muted-foreground">{result.result.feedback}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleHumanReview(result.id, "approve")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Override & Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleHumanReview(result.id, "reject")}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Confirm Rejection
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {moderationResults.filter((result) => result.result.category === "flagged" && !result.reviewedByHuman)
              .length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="newspaper-subheading text-lg mb-2">All caught up!</h3>
                  <p className="newspaper-body text-muted-foreground">No posts flagged for human review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {moderationResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="newspaper-subheading text-lg">{result.postTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {result.author} • Moderated {formatDate(result.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getCategoryBadge(result.result.category)}
                      {result.reviewedByHuman && (
                        <Badge variant="outline" className="text-xs">
                          Human Reviewed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence: {result.result.confidence}%</span>
                    <span>Score: {result.result.score}/10</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overrides">
          <div className="space-y-4">
            {moderationResults
              .filter((result) => result.reviewedByHuman)
              .map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="newspaper-subheading text-lg">{result.postTitle}</h3>
                        <p className="text-sm text-muted-foreground">by {result.author}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant="outline">AI: {result.result.category}</Badge>
                        <Badge
                          className={
                            result.humanDecision === "approve"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          Human: {result.humanDecision}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
