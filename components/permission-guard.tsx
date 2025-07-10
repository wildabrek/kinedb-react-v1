"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"

interface PermissionGuardProps {
  requiredPermissions?: string | string[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean
}

export function PermissionGuard({
  requiredPermissions,
  children,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth()

  // Ensure requiredPermissions is always an array
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : requiredPermissions
      ? [requiredPermissions]
      : []

  // If no permissions are required, render children
  if (!permissions.length) {
    return <>{children}</>
  }

  // Check permissions based on requireAll flag
  const hasRequiredPermissions = requireAll
    ? permissions.every((permission) => hasPermission(permission))
    : permissions.some((permission) => hasPermission(permission))

  // Render children if user has required permissions, otherwise render fallback
  return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>
}
