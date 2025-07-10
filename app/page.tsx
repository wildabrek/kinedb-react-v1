"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import InteractiveDemo from "@/components/interactive-demo"
import AnimatedHero from "@/components/animated-hero"
import AnimatedFeatures from "@/components/animated-features"
import AnimatedTestimonials from "@/components/animated-testimonials"
import AnimatedPricing from "@/components/animated-pricing"
import AnimatedFAQ from "@/components/animated-faq"
import AnimatedCTA from "@/components/animated-cta"
import { useEffect, useState } from "react"
import AnimatedContact from "@/components/animated-contact"
import LanguageSwitcher from "@/components/language-switcher"
import { Menu, X, Crown } from "lucide-react"

export default function LandingPage() {
  const { translate: t } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      const href = target.getAttribute("href")

      if (href?.startsWith("#")) {
        e.preventDefault()
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
          setIsMobileMenuOpen(false)
        }
      }
    }

    const links = document.querySelectorAll('a[href^="#"]')
    links.forEach((link) => {
      link.addEventListener("click", handleSmoothScroll)
    })

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleSmoothScroll)
      })
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { id: "features", label: t("features") },
    { id: "interactive-demo", label: t("Demo") },
    { id: "testimonials", label: t("testimonials") },
    { id: "pricing", label: t("pricing") },
    { id: "faq", label: t("faq") },
    { id: "contact", label: t("contact") },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-4 md:px-6 w-full shadow-sm">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-pointer group"
        >
          <Image
            src="/kinekids-logo.png"
            alt="KineKids Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300">
            KineKids
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden sm_custom:flex gap-6 ml-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Trigger */}
        <Button
          variant="outline"
          size="icon"
          className="sm_custom:hidden ml-auto bg-transparent"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label={t("Toggle navigation menu")}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Mobile Menu Content */}
        <div
          className={`fixed inset-0 z-50 bg-white/90 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } sm_custom:hidden flex flex-col p-4`}
        >
          <div className="flex items-center justify-between mb-6 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm">
              <Image
                src="/kinekids-logo.png"
                alt="KineKids Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg shadow-sm"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                KineKids
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={t("Close navigation menu")}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col gap-4 flex-grow bg-white/95 backdrop-blur-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })
                  setIsMobileMenuOpen(false)
                }}
                className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors text-left"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-gray-200">
            <Link href="/elci-basvuru">
              <Button
                variant="outline"
                className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 bg-transparent flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Crown className="h-4 w-4" />
                {t("Ambassador Application")}
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("login")}
              </Button>
            </Link>
            {/* Register butonu gizli olduğu için burada da gizli tutuldu */}
            {/* <Link href="/register">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              {t("register")}
            </Button>
          </Link> */}
            <LanguageSwitcher className="w-full justify-center text-blue-700 hover:text-blue-900" />
          </div>
        </div>

        {/* Desktop Login/Register/Language Switcher */}
        <div className="hidden sm_custom:flex items-center gap-4 ml-auto">
          <Link href="/elci-basvuru">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 text-amber-600 hover:bg-amber-50 bg-transparent flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              {t("Ambassador Application")}
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              {t("login")}
            </Button>
          </Link>
          <Link href="/register" style={{ display: "none" }}>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {t("register")}
            </Button>
          </Link>
          <LanguageSwitcher className="text-sm text-blue-700 hover:text-blue-900" />
        </div>
      </header>

      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Animated Features Section */}
      <AnimatedFeatures />

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Animated Testimonials Section */}
      <AnimatedTestimonials />

      {/* Animated Pricing Section */}
      <AnimatedPricing />

      {/* Animated FAQ Section */}
      <AnimatedFAQ />

      {/* Animated CTA Section */}
      <AnimatedCTA />

      {/* Animated Contact Section */}
      <AnimatedContact />

      {/* Footer */}
      <footer className="w-full py-12 bg-gray-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-pointer group"
              >
                <Image
                  src="/kinekids-logo.png"
                  alt="KineKids Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"
                />
                <span className="text-xl font-bold group-hover:text-blue-300 transition-colors duration-300">
                  KineKids
                </span>
              </button>
              <p className="text-sm text-gray-400">
                {t(
                  "Empowering educators with movement-based learning and data-driven insights to improve student outcomes.",
                )}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">{t("Product")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t("Features")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("interactive-demo")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t("Demo")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t("Pricing")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t("Testimonials")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t("Contact")}
                  </button>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">{t("Legal")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    {t("Privacy Policy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    {t("Terms of Service")}
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                    {t("Cookie Policy")}
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="text-gray-400 hover:text-white transition-colors">
                    {t("GDPR")}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">{t("Community")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/elci-basvuru"
                    className="text-gray-400 hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Elçi Başvurusu
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                    {t("Help Center")}
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-gray-400 hover:text-white transition-colors">
                    {t("Feedback")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} KineKids. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="12" x="2" y="6" rx="2" />
                  <path d="M22 9l-5 3-5-3" />
                  <path d="M22 15l-5-3-5 3" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
