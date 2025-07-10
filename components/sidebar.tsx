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
  Star,
  Activity,
  GraduationCap,
  School,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import LanguageSwitcher from "@/components/language-switcher"
import { PermissionGuard } from "@/components/permission-guard"

export function Sidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { translate: t } = useLanguage()

  const navItems = useMemo(
    () => [
      { name: t("dashboard"), href: "/dashboard", icon: Home },
      { name: t("Teachers"), href: "/teachers", icon: GraduationCap },
      { name: t("students"), href: "/students", icon: Users },
      { name: t("classes"), href: "/classes", icon: BookOpen },
      { name: t("games"), href: "/games", icon: GameController2 },
      { name: t("analytics"), href: "/analytics", icon: BarChart3 },
      { name: t("reports"), href: "/reports", icon: FileText },
      { name: t("notifications"), href: "/notifications", icon: Bell },
      { name: t("settings"), href: "/settings", icon: Settings },
      { name: t("help"), href: "/help", icon: HelpCircle },
      { name: t("feedback"), href: "/feedback", icon: MessageSquare },
    ],
    [t],
  )

  const adminNavItems = useMemo(
    () => [
      { name: t("Schools"), href: "/schools", icon: School },
      { name: t("Game Impacts"), href: "/game-impacts", icon: FileText },
      { name: t("Strengths"), href: "/strengths", icon: Star },
      { name: t("Areas"), href: "/areas", icon: Activity },
      { name: t("Skills"), href: "/skills", icon: Sun },
    ],
    [t],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      setIsOpen(window.innerWidth >= 768)
    }

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

  if (!mounted || !isAuthenticated) return null
  if (["/login", "/register", "/forgot-password"].includes(pathname)) return null

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-transparent"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">{t("Toggle Menu")}</span>
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

            {/* Admin Only Links */}
            <PermissionGuard
              requiredPermissions={["manage_game_impacts", "manage_strengths", "manage_areas", "manage_skills"]}
              requireAll={false}
            >
              {adminNavItems.map((item) => {
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
            </PermissionGuard>
          </ul>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="h-8 w-8" />
            <div>
              <p className="text-sm font-medium">{user?.name || t("Teacher Account")}</p>
              <p className="text-xs opacity-60">{user?.email || "teacher@example.com"}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-2">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">{t("Toggle theme")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>{t("Light")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>{t("Dark")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>{t("System")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sign out button */}
            <Button variant="ghost" size="icon" className="text-white" onClick={handleSignOut} title={t("Sign Out")}>
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{t("Sign Out")}</span>
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
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
