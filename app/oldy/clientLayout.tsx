"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ActionProvider } from "@/contexts/action-context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Sidebar } from "@/components/sidebar"

// Auth checker component that uses the auth context
function AuthChecker({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/terms",
    "/privacy",
    "/cookies",
    "/gdpr",
    "/help",
    "/feedback",
    "/elci-basvuru", // Ambassador application is public
  ]

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/students",
    "/teachers",
    "/classes",
    "/games",
    "/analytics",
    "/reports",
    "/schools",
    "/areas",
    "/strengths",
    "/skills",
    "/game-impacts",
    "/notifications",
    "/elci-panel", // Ambassador panel requires authentication
  ]

  const isPublicRoute = publicRoutes.includes(pathname)
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  useEffect(() => {
    if (!loading) {
      if (isProtectedRoute && !user) {
        // Redirect to login if trying to access protected route without auth
        router.push("/login")
      }
    }
  }, [user, loading, pathname, isProtectedRoute, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For protected routes, don't render if not authenticated
  if (isProtectedRoute && !user) {
    return null
  }

  return <>{children}</>
}

// Layout wrapper component
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Routes that should not show header/sidebar
  const noLayoutRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/elci-basvuru", // Ambassador application has its own layout
  ]

  const shouldShowLayout = !noLayoutRoutes.includes(pathname) && user

  if (shouldShowLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">{children}</main>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        <AuthProvider>
          <ActionProvider>
            <AuthChecker>
              <LayoutWrapper>{children}</LayoutWrapper>
            </AuthChecker>
            <Toaster />
            <SonnerToaster />
          </ActionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
