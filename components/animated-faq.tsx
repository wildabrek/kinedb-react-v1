"use client"

import type React from "react"

import { useState } from "react"
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation"
import { BookOpen, ChevronDown, Shield, Database, GraduationCap, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const faqData = [
  {
    question: "How secure is my students' data?",
    answer:
      "KineKids takes data security seriously. We use industry-standard encryption, regular security audits, and comply with FERPA and other educational privacy regulations to ensure your students' data is always protected.",
    icon: <Shield className="h-5 w-5" />,
    color: "from-green-500 to-green-600",
  },
  {
    question: "Can I import data from other systems?",
    answer:
      "Yes! KineKids supports importing data from most major Student Information Systems (SIS) and Learning Management Systems (LMS). Our team can help you with the migration process.",
    icon: <Database className="h-5 w-5" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    question: "Is training available for my staff?",
    answer:
      "Absolutely. We offer comprehensive training resources including video tutorials, documentation, and live webinars. School and District plans also include personalized onboarding sessions.",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "from-purple-500 to-purple-600",
  },
  {
    question: "Can parents access the system?",
    answer:
      "Yes, KineKids includes a parent portal where parents can view their child's progress, upcoming assignments, and communicate with teachers. This feature is available on all plans.",
    icon: <Users className="h-5 w-5" />,
    color: "from-orange-500 to-orange-600",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  icon: React.ReactNode
  color: string
  isVisible: boolean
  index: number
}

function FAQItem({ question, answer, icon, color, isVisible, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`group rounded-2xl border border-blue-100 bg-white shadow-lg hover:shadow-xl transition-all duration-700 overflow-hidden ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
      }`}
    >
      {/* Question Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left hover:bg-blue-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
            >
              {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{question}</h3>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </button>

      {/* Answer Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6">
          <div className="pl-14">
            <p className="text-gray-600 leading-relaxed">{answer}</p>

            {/* Animated Bottom Border */}
            <div
              className={`mt-4 h-1 bg-gradient-to-r ${color} transition-all duration-1000 ${isOpen ? "w-full" : "w-0"}`}
            />
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-br ${color} rounded-full opacity-20 animate-float-faq`}
            style={{
              left: `${80 + i * 10}%`,
              top: `${20 + i * 30}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AnimatedFAQ() {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ delay: 200 })
  const { containerRef, visibleItems } = useStaggeredAnimation(faqData.length, 150)
  const { translate: t } = useLanguage()

  return (
    <section
      id="faq"
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse-gentle"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse-gentle animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse-gentle animation-delay-4000"></div>

        {/* Question Mark Symbols */}
        <div className="absolute top-16 left-1/4 text-6xl opacity-5 animate-float-question">❓</div>
        <div className="absolute bottom-20 right-1/3 text-4xl opacity-5 animate-float-question animation-delay-3000">
          ❔
        </div>
      </div>

      <div className="container px-4 md:px-6 relative">
        <div ref={headerRef} className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-1000 ${
                headerVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
              }`}
            >
              <BookOpen className="h-4 w-4 animate-pulse" />
              FAQ
            </div>
            <h2
              className={`text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent transition-all duration-1000 delay-200 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Frequently asked questions")}
            </h2>
            <p
              className={`max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed transition-all duration-1000 delay-400 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Find answers to common questions about KineKids.")}
            </p>
          </div>
        </div>

        <div ref={containerRef} className="mx-auto grid max-w-5xl gap-6 py-12">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={t(faq.question)}
              answer={t(faq.answer)}
              icon={faq.icon}
              color={faq.color}
              isVisible={visibleItems[index]}
              index={index}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        
        @keyframes float-question {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
          75% { transform: translateY(-20px) rotate(7deg); }
        }
        
        @keyframes float-faq {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(5px); }
          66% { transform: translateY(-5px) translateX(-5px); }
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 5s ease-in-out infinite;
        }
        
        .animate-float-question {
          animation: float-question 10s ease-in-out infinite;
        }
        
        .animate-float-faq {
          animation: float-faq 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}