"use client"

import { useEffect, useState } from "react"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import * as auth from "@/lib/auth"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const checkAuth = () => {
      try {
        const session = auth.getUserSession()

        if (!session) {
          window.location.href = "/login"
          return
        }

        if (session.user.role === "admin") {
          window.location.href = "/admin"
          return
        }

        if (session.user.role === "user") {
          setUser(session.user)
        } else {
          setError("Invalid user role")
        }
      } catch (error) {
        console.error("Authentication error:", error)
        setError("Authentication failed")
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <UserDashboard />
}
