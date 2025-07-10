"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ActionProvider } from "@/contexts/action-context"
import { AuthProvider } from "@/contexts/auth-context"
import { SessionTimeout } from "@/components/session-timeout"
import { LanguageProvider } from "@/contexts/language-context"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // DEĞİŞİKLİK 1: Kenar çubuğunun gösterilmeyeceği statik yollar.
  const noSidebarStaticRoutes = [
    '/',
    '/login',
    '/register',
    '/gdpr',
    '/cookies',
    '/privacy',
    '/terms',
    '/elci-basvuru',
    '/forgot-password',
    '/help',
    '/feedback'
  ];

  // DEĞİŞİKLİK 2: Kenar çubuğunun gösterilmeyeceği dinamik yol başlangıçları.
  const noSidebarDynamicPrefixes = [
    '/elci-panel', // /elci-paneli/ ile başlayan tüm yolları kapsar
    '/odeme'         // /odeme/ ile başlayan tüm yolları kapsar
  ];

  // DEĞİŞİKLİK 3: Yeni ve daha güçlü showSidebar mantığı.
  const showSidebar =
    !noSidebarStaticRoutes.includes(pathname) &&
    !noSidebarDynamicPrefixes.some(prefix => pathname.startsWith(prefix));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <ActionProvider>
                <div className="flex min-h-screen">
                  {showSidebar && <Sidebar />}
                  {/* Sidebar gösterildiğinde soldan boşluk bırakma mantığı aynı kalıyor */}
                  <div className={`flex-1 flex flex-col ${showSidebar ? "md:ml-64" : ""}`}>
                    <main className="flex-1 p-4">{children}</main>
                  </div>
                </div>
                <SessionTimeout />
                <Toaster />
              </ActionProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}