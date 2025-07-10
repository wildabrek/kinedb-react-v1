"use client"

import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation"
import { Users, Quote, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "4th Grade Teacher",
    avatar: "SJ",
    color: "from-blue-500 to-blue-600",
    content:
      "KineKids has transformed how I track student progress. The analytics help me identify struggling students early, and the gamified learning tools keep my students engaged. It's been a game-changer for my classroom!",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "School Principal",
    avatar: "MR",
    color: "from-green-500 to-green-600",
    content:
      "As an administrator, I need comprehensive data to make informed decisions. KineKids provides exactly that, with easy-to-understand reports and dashboards that help us improve our school's performance year after year.",
    rating: 5,
  },
]

export default function AnimatedTestimonials() {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ delay: 200 })
  const { containerRef, visibleItems } = useStaggeredAnimation(testimonials.length, 300)
  const { translate: t } = useLanguage()

  return (
    <section
      id="testimonials"
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-float-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-100 rounded-full opacity-30 animate-float-slow animation-delay-4000"></div>
      </div>

      <div className="container px-4 md:px-6 relative">
        <div ref={headerRef} className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-1000 ${
                headerVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
              }`}
            >
              <Users className="h-4 w-4 animate-pulse" />
              {t("Testimonials")}
            </div>
            <h2
              className={`text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent transition-all duration-1000 delay-200 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Trusted by educators worldwide")}
            </h2>
            <p
              className={`max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed transition-all duration-1000 delay-400 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("See what teachers and administrators are saying about KineKids.")}
            </p>
          </div>
        </div>

        <div ref={containerRef} className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group rounded-2xl border border-blue-100 bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-700 relative overflow-hidden ${
                visibleItems[index] ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
              }`}
            >
              {/* Animated Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-12 w-12 text-blue-500 transform rotate-12" />
              </div>

              {/* Floating Particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-float-particle"
                    style={{
                      left: `${20 + i * 25}%`,
                      top: `${15 + i * 20}%`,
                      animationDelay: `${i * 0.7}s`,
                      animationDuration: `${4 + i}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4 relative">
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-full bg-gradient-to-br ${testimonial.color} p-1 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-gray-700 font-semibold">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-blue-600">{t(testimonial.role)}</p>
                    {/* Animated Star Rating */}
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 text-yellow-400 fill-current transition-all duration-300 ${
                            visibleItems[index] ? "scale-100 opacity-100" : "scale-0 opacity-0"
                          }`}
                          style={{ transitionDelay: `${800 + i * 100}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {t(testimonial.content)}
                </p>

                {/* Animated Bottom Border */}
                <div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${testimonial.color} transition-all duration-1000 ${
                    visibleItems[index] ? "w-full" : "w-0"
                  }`}
                  style={{ transitionDelay: "600ms" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-15px) translateX(5px) scale(1.2); }
          50% { transform: translateY(-8px) translateX(-8px) scale(0.8); }
          75% { transform: translateY(-20px) translateX(3px) scale(1.1); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-particle {
          animation: float-particle ease-in-out infinite;
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
