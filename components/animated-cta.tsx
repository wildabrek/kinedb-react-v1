"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Rocket } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"


export default function AnimatedCTA() {
  const { elementRef, isVisible } = useScrollAnimation({ delay: 300 })
  const { translate: t } = useLanguage()

  return (
    <section
      ref={elementRef}
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-sparkle"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            <Sparkles className="h-4 w-4 text-white opacity-20" />
          </div>
        ))}

        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full animate-pulse-orb"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse-orb animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white opacity-3 rounded-full animate-pulse-orb animation-delay-4000"></div>

        {/* Moving Rocket */}
        <div className="absolute top-20 right-20 animate-rocket-float">
          <Rocket className="h-8 w-8 text-white opacity-10" />
        </div>
      </div>

      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            {/* Animated Badge */}
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition-all duration-1000 ${
                isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
              }`}
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              {t("Transform Education Today")}
            </div>

            {/* Main Heading */}
            <h2
              className={`text-3xl font-bold tracking-tighter sm:text-5xl text-white transition-all duration-1000 delay-200 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Ready to Transform Your Classroom?")}
            </h2>

            {/* Subheading */}
            <p
              className={`max-w-[600px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed transition-all duration-1000 delay-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Join thousands of educators who are already using KineKids to enhance student learning through movement.")}
            </p>
          </div>

          {/* Animated Buttons */}
          <div
            className={`flex flex-col gap-2 min-[400px]:flex-row transition-all duration-1000 delay-600 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                {t("Start Free Trial")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 bg-transparent border-white/30 hover:bg-white/10 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              {t("Schedule Demo")}
            </Button>
          </div>

          {/* Animated Statistics */}
          <div
            className={`grid grid-cols-3 gap-8 mt-12 transition-all duration-1000 delay-800 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            {[
              { number: "10K+", label: t("Happy Students") },
              { number: "500+", label: t("Schools") },
              { number: "98%", label: t("Satisfaction") },
            ].map((stat, index) => (
              <div key={index} className="text-center group hover:scale-110 transition-transform duration-300">
                <div
                  className={`text-2xl md:text-3xl font-bold mb-1 transition-all duration-500 ${
                    isVisible ? "animate-count-up" : ""
                  }`}
                  style={{ animationDelay: `${1000 + index * 200}ms` }}
                >
                  {stat.number}
                </div>
                <div className="text-sm text-blue-100 group-hover:text-white transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-sparkle {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-20px) rotate(90deg) scale(1.2); }
          50% { transform: translateY(-10px) rotate(180deg) scale(0.8); }
          75% { transform: translateY(-25px) rotate(270deg) scale(1.1); }
        }
        
        @keyframes pulse-orb {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.2); }
        }
        
        @keyframes rocket-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
          75% { transform: translateY(-20px) rotate(7deg); }
        }
        
        @keyframes count-up {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-float-sparkle {
          animation: float-sparkle ease-in-out infinite;
        }
        
        .animate-pulse-orb {
          animation: pulse-orb 4s ease-in-out infinite;
        }
        
        .animate-rocket-float {
          animation: rocket-float 8s ease-in-out infinite;
        }
        
        .animate-count-up {
          animation: count-up 0.8s ease-out forwards;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}
