"use client"

import { useEffect, useState } from "react"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { getUserSession } from "@/lib/auth"

export default function ProfilePage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    checkUserAccess()
  }, [])

  const checkUserAccess = () => {
    const session = getUserSession()
    setIsAuthorized(!!session)
  }

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in to access your profile.</p>
            <a href="/login" className="text-primary hover:underline">
              Sign in to continue
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <UserDashboard />
}
