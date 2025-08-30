"use client"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsAuthorized(false)
        return
      }

      const response = await fetch("/api/admin/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setIsAuthorized(response.ok)
    } catch (error) {
      setIsAuthorized(false)
    }
  }

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying access...</p>
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
            <h2 className="newspaper-subheading text-xl mb-2">Access Denied</h2>
            <p className="newspaper-body text-muted-foreground mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <a href="/login" className="text-primary hover:underline">
              Sign in with admin account
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <AdminDashboard />
}
