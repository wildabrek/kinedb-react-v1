"use client"

import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation"
import { Button } from "@/components/ui/button"
import { BarChart2, Check, Zap, Crown, Building } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const pricingPlans = [
  {
    name: "Teacher",
    price: "$11,9",
    period: "/month",
    description: "Perfect for individual teachers managing their classrooms.",
    icon: <BarChart2 className="h-6 w-6" />,
    color: "from-blue-500 to-blue-600",
    borderColor: "border-blue-200",
    bgGradient: "from-white to-blue-50",
    features: ["for up to 100 students", "basic analytics", "classroom management", "email support"],
    popular: false,
  },
  {
    name: "School",
    price: "$9,9",
    period: "/month",
    description: "Ideal for schools with multiple classrooms and teachers.",
    icon: <Crown className="h-6 w-6" />,
    color: "from-purple-500 to-purple-600",
    borderColor: "border-purple-500",
    bgGradient: "from-purple-50 to-white",
    features: ["for unlimited students", "advanced AI analytics", "school-wide reporting", "priority support"],
    popular: true,
  },
  {
    name: "District",
    price: "Custom",
    period: "",
    description: "For school districts needing enterprise-level solutions.",
    icon: <Building className="h-6 w-6" />,
    color: "from-gray-500 to-gray-600",
    borderColor: "border-gray-200",
    bgGradient: "from-white to-gray-50",
    features: [
      "district-wide deployment",
      "custom integrations",
      "advanced security features",
      "dedicated account manager",
    ],
    popular: false,
  },
]

export default function AnimatedPricing() {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ delay: 200 })
  const { containerRef, visibleItems } = useStaggeredAnimation(pricingPlans.length, 200)
  const { translate: t } = useLanguage()

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20 animate-pulse-slow animation-delay-3000"></div>

        {/* Floating Currency Symbols */}
        <div className="absolute top-20 left-1/4 text-4xl opacity-10 animate-float-currency">💰</div>
        <div className="absolute bottom-32 right-1/4 text-3xl opacity-10 animate-float-currency animation-delay-2000">
          💳
        </div>
        <div className="absolute top-1/2 left-10 text-2xl opacity-10 animate-float-currency animation-delay-4000">
          💎
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
              <BarChart2 className="h-4 w-4 animate-pulse" />
              {t("Pricing")}
            </div>
            <h2
              className={`text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent transition-all duration-1000 delay-200 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Simple, transparent pricing")}
            </h2>
            <p
              className={`max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed transition-all duration-1000 delay-400 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Choose the plan that's right for your school or district.")}
            </p>
          </div>
        </div>

        <div ref={containerRef} className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`group relative rounded-2xl border-2 ${plan.borderColor} bg-gradient-to-br ${plan.bgGradient} p-6 shadow-lg hover:shadow-2xl transition-all duration-700 ${
                plan.popular ? "scale-105 ring-2 ring-purple-200" : ""
              } ${visibleItems[index] ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  className={`absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r ${plan.color} px-4 py-2 text-xs font-medium text-white shadow-lg transition-all duration-500 ${
                    visibleItems[index] ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                  style={{ transitionDelay: "300ms" }}
                >
                  <Zap className="inline h-3 w-3 mr-1" />
                  {t("Most Popular")}
                </div>
              )}

              {/* Animated Background Pattern */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-gradient-to-br ${plan.color} rounded-full opacity-10 animate-float-pricing`}
                    style={{
                      left: `${10 + i * 20}%`,
                      top: `${20 + (i % 2) * 40}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${3 + i * 0.5}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4 relative">
                {/* Plan Header */}
                <div className="text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300 ${
                      visibleItems[index] ? "animate-bounce-in" : ""
                    }`}
                    style={{ animationDelay: `${index * 200 + 400}ms` }}
                  >
                    {plan.icon}
                  </div>
                  <h3
                    className={`text-xl font-bold text-gray-800 transition-all duration-500 ${
                      visibleItems[index] ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 200 + 600}ms` }}
                  >
                    {t(plan.name)}
                  </h3>
                </div>

                {/* Price */}
                <div className="text-center">
                  <p
                    className={`text-3xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent transition-all duration-500 ${
                      visibleItems[index] ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
                    }`}
                    style={{ transitionDelay: `${index * 200 + 800}ms` }}
                  >
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">{t(plan.period)}</span>
                  </p>
                  <p
                    className={`text-gray-600 mt-2 transition-all duration-500 ${
                      visibleItems[index] ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 200 + 1000}ms` }}
                  >
                    {t(plan.description)}
                  </p>
                </div>

                {/* Features */}
                <ul className="grid gap-3 py-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-center gap-3 transition-all duration-500 ${
                        visibleItems[index] ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                      }`}
                      style={{ transitionDelay: `${index * 200 + 1200 + featureIndex * 100}ms` }}
                    >
                      <div
                        className={`w-5 h-5 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">{t(feature)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full transition-all duration-500 ${
                    plan.popular
                      ? `bg-gradient-to-r ${plan.color} hover:scale-105`
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } ${visibleItems[index] ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                  variant={plan.popular ? "default" : "outline"}
                  style={{ transitionDelay: `${index * 200 + 1600}ms` }}
                >
                  {t(plan.name === "District" ? "Contact Sales" : "Get Started")}
                </Button>

                {/* Animated Progress Bar */}
                <div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${plan.color} transition-all duration-1000 ${
                    visibleItems[index] ? "w-full" : "w-0"
                  }`}
                  style={{ transitionDelay: `${index * 200 + 1800}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        
        @keyframes float-currency {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-25px) rotate(3deg); }
        }
        
        @keyframes float-pricing {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-15px) translateX(10px) scale(1.2); }
          66% { transform: translateY(-5px) translateX(-10px) scale(0.8); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-float-currency {
          animation: float-currency 8s ease-in-out infinite;
        }
        
        .animate-float-pricing {
          animation: float-pricing ease-in-out infinite;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out forwards;
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
