"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { BarChart2, Users, Zap, Shield, Clock, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface AnimatedFeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  delay: number
  index: number
}

function AnimatedFeatureCard({ icon, title, description, color, delay, index }: AnimatedFeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={cardRef}
      className={`group p-6 rounded-2xl border border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-700 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Particles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${color} rounded-full opacity-20 animate-float-particle`}
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Icon with Animation */}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${color} mx-auto mb-4 transition-all duration-500 ${
          isHovered ? "scale-110 rotate-6" : "scale-100 rotate-0"
        } ${isVisible ? "animate-bounce-in" : ""}`}
        style={{ animationDelay: `${delay + 200}ms` }}
      >
        <div className="text-white text-2xl">{icon}</div>
      </div>

      {/* Content */}
      <h3
        className={`text-xl font-bold text-center mb-3 text-gray-800 transition-all duration-500 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: `${delay + 400}ms` }}
      >
        {title}
      </h3>
      <p
        className={`text-gray-600 text-center transition-all duration-500 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: `${delay + 600}ms` }}
      >
        {description}
      </p>

      {/* Interactive Elements */}
      {isHovered && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        </div>
      )}

      {/* Movement Indicators */}
      {index === 2 && ( // Interactive Games card
        <div className="absolute bottom-4 right-4">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        
        .animate-float-particle {
          animation: float-particle ease-in-out infinite;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default function AnimatedFeatures() {
  const { translate: t } = useLanguage()
  const features = [
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: t("Advanced Analytics"),
      description:
        t("Track student performance with detailed analytics and visualizations to identify areas for improvement."),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t("Teacher and Classroom Management"),
      description: t("Tools that allow teachers to manage student data, attendance, assignments, and progress reports."),
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: t("Interactive Games with Movement"),
      description:
        t("Discover how KineKids integrates physical activities into the learning process to improve motor skills and academic learning."),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t("Safe & Secure"),
      description:
        t("Built with security and privacy in mind, ensuring student data is protected and compliant with regulations."),
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: t("Curriculum-Aligned Games"),
      description: t("The games are aligned with early childhood education standards and curriculum guidelines."),
      color: "from-teal-500 to-teal-600",
    },
  ]

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-100 rounded-full opacity-50 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-100 rounded-full opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 animate-fade-in">
              <BookOpen className="h-4 w-4 animate-pulse" />
              {t("Features")}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent animate-fade-in-up">
              {t("Everything you need to manage your classroom")}
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-fade-in-up animation-delay-200">
              {t("Our comprehensive suite of tools helps teachers and administrators streamline education management and improve student outcomes.")}
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
          {features.map((feature, index) => (
            <AnimatedFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              delay={index * 200}
              index={index}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}
