"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  BookOpen,
  Gamepad2Icon as GameController2,
  Home,
  LogOut,
  Settings,
  Users,
  UserCircle,
  Bell,
  HelpCircle,
  FileText,
  MessageSquare,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Students", href: "/students", icon: Users },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Games", href: "/games", icon: GameController2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const { setTheme } = useTheme()
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [mounted, setMounted] = useState(false)

  // Only run on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle window resize to detect mobile view
  useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [mounted])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleSignOut = () => {
    logout()
  }

  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code)
    toast({
      title: "Language Changed",
      description: `Language has been changed to ${code === "en" ? "English" : code === "es" ? "Spanish" : code === "fr" ? "French" : "German"}`,
    })
  }

  // Don't render on server or if not authenticated
  if (!mounted || !isAuthenticated) {
    return null
  }

  // Don't show sidebar on login/register pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#1a2035] text-white transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo and title */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <GameController2 className="h-6 w-6" />
          <h1 className="text-xl font-medium">KineKids</h1>
        </div>

        {/* Navigation */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px-80px)]">
          <div className="mb-3">
            <p className="text-xs font-bold uppercase opacity-60 mb-2">Main</p>
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon || FileText
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                      isActive ? "bg-blue-600 text-white" : "hover:bg-white/10 text-white/80",
                    )}
                    onClick={() => isMobileView && setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* User profile and sign out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="h-8 w-8" />
            <div>
              <p className="text-sm font-medium">{user?.name || "Teacher Account"}</p>
              <p className="text-xs opacity-60">{user?.email || "teacher@example.com"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            {/* Inline theme toggle instead of importing component */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Inline language selector instead of importing component */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Globe className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Select language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("es")}>Español</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("fr")}>Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("de")}>Deutsch</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/10 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && isMobileView && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggleSidebar} aria-hidden="true" />
      )}
    </>
  )
}

export default Sidebar
