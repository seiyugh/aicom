"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, checkAuth } = useAuth()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    // Only verify auth once when the dashboard layout mounts
    const verifyAuth = async () => {
      try {
        setLocalLoading(true)
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
          router.push("/login")
        }
        setAuthChecked(true)
      } catch (error) {
        console.error("Auth verification error:", error)
        router.push("/login")
      } finally {
        setLocalLoading(false)
      }
    }

    if (!user && !authChecked) {
      verifyAuth()
    } else {
      setAuthChecked(true)
      setLocalLoading(false)
    }
  }, [user, checkAuth, router, authChecked])

  if (isLoading || localLoading || !authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          <main className="container mx-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

