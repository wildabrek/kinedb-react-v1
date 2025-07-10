"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Play } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

interface FloatingElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

function FloatingElement({ children, delay = 0, duration = 3, className = "" }: FloatingElementProps) {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  )
}

interface MovingChildProps {
  delay?: number
  direction?: "left" | "right"
  className?: string
}

function MovingChild({ delay = 0, direction = "right", className = "" }: MovingChildProps) {
  return (
    <div className={`absolute animate-move-${direction} ${className}`} style={{ animationDelay: `${delay}s` }}>
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
        👦
      </div>
    </div>
  )
}

interface JumpingNumberProps {
  number: string
  delay?: number
  className?: string
}

function JumpingNumber({ number, delay = 0, className = "" }: JumpingNumberProps) {
  return (
    <div className={`animate-bounce-number ${className}`} style={{ animationDelay: `${delay}s` }}>
      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-lg">
        {number}
      </div>
    </div>
  )
}

export default function AnimatedHero() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeGame, setActiveGame] = useState(0)
  const { translate: t } = useLanguage()

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveGame((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const games = [
    { name: "Math Jump", emoji: "🔢", color: "from-blue-500 to-blue-600" },
    { name: "Word Race", emoji: "📝", color: "from-green-500 to-green-600" },
    { name: "Shape Hunt", emoji: "🔺", color: "from-purple-500 to-purple-600" },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Learning Icons */}
        <FloatingElement delay={0} className="absolute top-20 left-10">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">⭐</div>
        </FloatingElement>

        <FloatingElement delay={1} className="absolute top-32 right-20">
          <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">💝</div>
        </FloatingElement>

        <FloatingElement delay={2} className="absolute bottom-40 left-20">
          <div className="w-7 h-7 bg-green-400 rounded-full flex items-center justify-center shadow-lg">🎯</div>
        </FloatingElement>

        {/* Moving Children Avatars */}
        <MovingChild delay={0} direction="right" className="top-24 -left-8" />
        <MovingChild delay={2} direction="left" className="top-48 -right-8" />
        <MovingChild delay={4} direction="right" className="bottom-32 -left-8" />

        {/* Jumping Numbers for Math */}
        <JumpingNumber number="7" delay={1} className="absolute top-16 right-32" />
        <JumpingNumber number="+" delay={1.5} className="absolute top-28 right-40" />
        <JumpingNumber number="5" delay={2} className="absolute top-40 right-48" />
        <JumpingNumber number="=" delay={2.5} className="absolute top-52 right-56" />
        <JumpingNumber number="12" delay={3} className="absolute top-64 right-64" />
      </div>

      {/* Main Hero Content */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-blue-100 relative">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-4 transition-all duration-1000 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  <Zap className="h-4 w-4 animate-pulse" />
                  {t("Movement-Based Learning Platform")}
                </div>
                <h1
                  className={`text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 bg-clip-text text-transparent transition-all duration-1000 delay-200 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  {t("Empower Children's Learning with")}{" "}
                  <span className="relative bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t("Movement")}
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                  </span>{" "}
                  {t("and Fun")}
                </h1>
                <p
                  className={`max-w-[600px] text-gray-600 md:text-xl leading-relaxed transition-all duration-1000 delay-400 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  {t("Help students learn through games that incorporate physical activity and AI data-driven insights.")}
                </p>
              </div>
              <div
                className={`flex flex-col gap-2 min-[400px]:flex-row transition-all duration-1000 delay-600 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
                  >
                    {t("Start Free Trial")}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#interactive-demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all group"
                  >
                    <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    {t("Try Interactive Demo")}
                  </Button>
                </Link>
              </div>

              {/* Animated Game Showcase */}
              <div
                className={`mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg transition-all duration-1000 delay-800 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <div className="text-sm text-gray-600 mb-3">{t("Currently Playing")}:</div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${games[activeGame].color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg animate-pulse`}
                  >
                    {games[activeGame].emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{t(games[activeGame].name)}</div>
                    <div className="text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {t("24 students active")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated Dashboard Preview */}
            <div className="flex items-center justify-center">
              <div
                className={`relative w-full aspect-video overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl transition-all duration-1000 delay-1000 ${
                  isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
                }`}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white rounded-full animate-ping animation-delay-1000"></div>
                  <div className="absolute bottom-8 left-8 w-4 h-4 border-2 border-white rounded-full animate-ping animation-delay-2000"></div>
                </div>

                {/* Dashboard Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{t("Interactive Learning Dashboard")}</h3>
                    <p className="text-blue-100">{t("Real-time student progress tracking with AI")}</p>
                  </div>

                  {/* Animated Progress Bars */}
                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t("Math Skills")}</span>
                      <span>87%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full animate-progress-87"></div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>{t("Physical Activity")}</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full animate-progress-92"></div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>{t("Engagement")}</span>
                      <span>95%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full animate-progress-95"></div>
                    </div>
                  </div>

                  {/* Floating Achievement Badges */}
                  <div className="absolute top-4 right-4">
                    <div className="animate-bounce-slow">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        🏆
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <div className="animate-bounce-slow animation-delay-1000">
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                        ⭐
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Border Glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-300 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Statistics */}
        <div className="container px-4 md:px-6 mt-16">
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-1200 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {[
              { number: "10K+", label: t("Active Students"), icon: "👥", color: "from-blue-500 to-blue-600" },
              { number: "500+", label: t("Schools"), icon: "🏫", color: "from-green-500 to-green-600" },
              { number: "50+", label: t("Learning Games"), icon: "🎮", color: "from-purple-500 to-purple-600" },
              { number: "98%", label: t("Satisfaction"), icon: "💯", color: "from-pink-500 to-pink-600" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes move-right {
          0% { transform: translateX(-100px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 100px)); opacity: 0; }
        }
        
        @keyframes move-left {
          0% { transform: translateX(calc(100vw + 100px)); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(-100px); opacity: 0; }
        }
        
        @keyframes bounce-number {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-10px) scale(1.1); }
          50% { transform: translateY(-5px) scale(1.05); }
          75% { transform: translateY(-15px) scale(1.15); }
        }
        
        @keyframes progress-87 {
          0% { width: 0%; }
          100% { width: 87%; }
        }
        
        @keyframes progress-92 {
          0% { width: 0%; }
          100% { width: 92%; }
        }
        
        @keyframes progress-95 {
          0% { width: 0%; }
          100% { width: 95%; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-move-right {
          animation: move-right 8s linear infinite;
        }
        
        .animate-move-left {
          animation: move-left 8s linear infinite;
        }
        
        .animate-bounce-number {
          animation: bounce-number 2s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        
        .animate-progress-87 {
          animation: progress-87 2s ease-out forwards;
        }
        
        .animate-progress-92 {
          animation: progress-92 2s ease-out 0.5s forwards;
        }
        
        .animate-progress-95 {
          animation: progress-95 2s ease-out 1s forwards;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
