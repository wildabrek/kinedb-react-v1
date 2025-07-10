"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
}

export function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until auth state is loaded
    if (isLoading) return

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(permission))

      if (!hasAllPermissions) {
        router.push("/dashboard") // Redirect to dashboard if missing permissions
      }
    }
  }, [isLoading, isAuthenticated, hasPermission, requiredPermissions, router])

  // Show nothing while loading or if not authenticated
  if (isLoading || !isAuthenticated) {
    return null
  }

  // If permissions are required, check them
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(permission))

    if (!hasAllPermissions) {
      return null
    }
  }

  return <>{children}</>
}
