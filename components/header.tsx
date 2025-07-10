"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { Bell, Settings, LogOut, User, HelpCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const { translate : t } = useLanguage()

  const handleViewNotifications = () => {
    setUnreadNotifications(0)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center justify-end md:justify-between">
        <nav className="hidden md:flex">
          <ul className="flex items-center gap-4 text-sm font-medium">
            <li>
              <Link
                href="/dashboard"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {t("dashboard")}
              </Link>
            </li>
            <li>
              <Link
                href="/students"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname.startsWith("/students") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {t("students")}
              </Link>
            </li>
            <li>
              <Link
                href="/classes"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname.startsWith("/classes") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {t("classes")}
              </Link>
            </li>
            <li>
              <Link
                href="/games"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname.startsWith("/games") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {t("games")}
              </Link>
            </li>
            <li>
              <Link
                href="/analytics"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname.startsWith("/analytics") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {t("analytics")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <LanguageSelector />

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadNotifications}
                </Badge>
              )}
              <span className="sr-only">{t("notifications")}</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("profile")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/overview">
                  <User className="mr-2 h-4 w-4" />
                  {t("profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {t("help")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
