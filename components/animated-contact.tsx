"use client"

import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Building, Globe, Headphones } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const contactMethods = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email Support",
    description: "Get help from our support team",
    contact: "support@kinekidsgames.com",
    color: "from-blue-500 to-blue-600",
    action: "Send Email",
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: "Phone Support",
    description: "Speak directly with our team",
    contact: "+90 (532) 154-6934",
    color: "from-green-500 to-green-600",
    action: "Call Now",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Live Chat",
    description: "Chat with us in real-time",
    contact: "Available 24/7",
    color: "from-purple-500 to-purple-600",
    action: "Start Chat",
  },
]

const officeLocations = [
  {
    city: "istanbul",
    address: "Acıbadem, Çeçen Sok. No: 25/A",
    zipcode: "İstanbul, TR 34660",
    phone: "+90 (532) 154-6934",
    icon: "🌉",
  },
  {
    city: "California",
    address: "344 20th St Oakland, CA 94612",
    zipcode: "CA, USA ",
    icon: "🌉",
  },
  {
    city: "Dubai",
    address: "Boulevard Plaza Sheikh Mohammed bin Rashid Boulevard",
    zipcode: "DBX, UAE",
    icon: "🌉",
  },

]

export default function AnimatedContact() {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ delay: 200 })
  const { containerRef: methodsRef, visibleItems: methodsVisible } = useStaggeredAnimation(contactMethods.length, 200)
  const { containerRef: locationsRef, visibleItems: locationsVisible } = useStaggeredAnimation(
    officeLocations.length,
    150,
  )
  const { translate: t } = useLanguage()

  return (
    <section
      id="contact"
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-30 animate-float-contact"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-float-contact animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-100 rounded-full opacity-30 animate-float-contact animation-delay-4000"></div>

        {/* Communication Icons */}
        <div className="absolute top-16 right-1/4 text-4xl opacity-10 animate-float-icon">📧</div>
        <div className="absolute bottom-32 left-1/4 text-3xl opacity-10 animate-float-icon animation-delay-3000">
          📞
        </div>
        <div className="absolute top-1/3 left-10 text-2xl opacity-10 animate-float-icon animation-delay-5000">💬</div>
      </div>

      <div className="container px-4 md:px-6 relative">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-1000 ${
                headerVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
              }`}
            >
              <Headphones className="h-4 w-4 animate-pulse" />
              {t("Contact Us")}
            </div>
            <h2
              className={`text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent transition-all duration-1000 delay-200 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Get in Touch with Our Team")}
            </h2>
            <p
              className={`max-w-[900px] text-gray-600 md:text-xl/relaxed transition-all duration-1000 delay-400 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {t("Have questions about KineKids? We're here to help you transform your classroom experience.")}
            </p>
          </div>
        </div>

        {/* Contact Methods */}
        <div ref={methodsRef} className="grid gap-6 md:grid-cols-3 mb-16">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className={`group border-blue-100 hover:shadow-xl transition-all duration-700 bg-white relative overflow-hidden ${
                methodsVisible[index] ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
              }`}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-gradient-to-br ${method.color} rounded-full opacity-10 animate-float-particle`}
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${15 + i * 25}%`,
                      animationDelay: `${i * 0.8}s`,
                      animationDuration: `${3 + i * 0.5}s`,
                    }}
                  />
                ))}
              </div>

              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300`}
                >
                  {method.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {t(method.title)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">{t(method.description)}</p>
                <div className="font-semibold text-gray-800">{method.contact}</div>
                <Button
                  className={`w-full bg-gradient-to-r ${method.color} hover:scale-105 transition-all duration-300`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t(method.action)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Office Locations */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3
              className={`text-2xl font-bold text-gray-800 mb-4 transition-all duration-1000 ${
                headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              {t("Our Office Locations")}
            </h3>
          </div>

          <div ref={locationsRef} className="grid gap-6 md:grid-cols-3">
            {officeLocations.map((location, index) => (
              <Card
                key={index}
                className={`group border-blue-100 hover:shadow-lg transition-all duration-500 bg-white ${
                  locationsVisible[index] ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{location.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                        {location.city}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div>{location.address}</div>
                            <div>{location.zipcode}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span>{location.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Business Hours & Additional Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-blue-100 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-blue-500" />
                {t("Business Hours")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("Monday - Friday")}</span>
                <span className="font-semibold text-gray-800">9:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("Saturday")}</span>
                <span className="font-semibold text-gray-800">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">{t("Sunday")}</span>
                <span className="font-semibold text-gray-800">{t("Closed")}</span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">24/7 {t("Online Support Available")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Users className="h-5 w-5 text-blue-500" />
                {t("Quick Links")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={() => document.getElementById("interactive-demo")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      🎮
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{t("Try Our Demo")}</div>
                      <div className="text-sm text-gray-500">{t("Experience KineKids firsthand")}</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      💰
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{t("View Pricing")}</div>
                      <div className="text-sm text-gray-500">{t("Find the right plan for you")}</div>
                    </div>
                  </div>
                </button>

                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{t("Enterprise Solutions")}</div>
                      <div className="text-sm text-gray-500">{t("Custom plans for large districts")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-contact {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-15px) rotate(5deg) scale(1.1); }
          50% { transform: translateY(-8px) rotate(-3deg) scale(0.9); }
          75% { transform: translateY(-20px) rotate(7deg) scale(1.05); }
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-12px) translateX(8px); }
          66% { transform: translateY(-6px) translateX(-8px); }
        }
        
        .animate-float-contact {
          animation: float-contact 8s ease-in-out infinite;
        }
        
        .animate-float-icon {
          animation: float-icon 10s ease-in-out infinite;
        }
        
        .animate-float-particle {
          animation: float-particle 5s ease-in-out infinite;
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
        
        .animation-delay-5000 {
          animation-delay: 5s;
        }
      `}</style>
    </section>
  )
}
