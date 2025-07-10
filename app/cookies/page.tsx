"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, Eye, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import LanguageSwitcher from "@/components/language-switcher"; // Dil hook'unu import edin

export default function CookiePolicyPage() {
  const { translate: t } = useLanguage() // t fonksiyonunu alın

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header
            className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-4 md:px-6 w-full shadow-sm">
          <button onClick={scrollToTop}
                  className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-pointer group">
            <Image src="/kinekids-logo.png" alt="KineKids Logo" width={32} height={32}
                   className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"/>
            <span
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300">
            KineKids
          </span>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-2"/>
                {t("backToHome")}
              </Button>
            </Link>
            <LanguageSwitcher className="text-sm text-blue-700 hover:text-blue-900"/>
          </div>

        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-blue-50 to-white">
          <div className="container px-4 md:px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div
                  className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-4">
                <Cookie className="h-4 w-4"/>
                {t("cookiePolicy")}
              </div>
              <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent mb-4">
                {t("cookiePolicy")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("cookiePolicyDescription")}
              </p>
              <p className="text-sm text-gray-500 mt-4">{t("lastUpdatedDate")}</p>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Cookie className="h-5 w-5"/>
                    {t("whatAreCookies")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    {t("whatAreCookiesP1")}
                  </p>
                  <p className="text-gray-600">
                    {t("whatAreCookiesP2")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Settings className="h-5 w-5"/>
                    {t("typesOfCookiesWeUse")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{t("essentialCookies")}</h3>
                    <p className="text-gray-600 mb-2">
                      {t("essentialCookiesDescription")}
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("essentialCookieItem1")}</li>
                      <li>{t("essentialCookieItem2")}</li>
                      <li>{t("essentialCookieItem3")}</li>
                      <li>{t("essentialCookieItem4")}</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{t("functionalCookies")}</h3>
                    <p className="text-gray-600 mb-2">{t("functionalCookiesDescription")}</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("functionalCookieItem1")}</li>
                      <li>{t("functionalCookieItem2")}</li>
                      <li>{t("functionalCookieItem3")}</li>
                      <li>{t("functionalCookieItem4")}</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{t("analyticsCookies")}</h3>
                    <p className="text-gray-600 mb-2">
                      {t("analyticsCookiesDescription")}
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("analyticsCookieItem1")}</li>
                      <li>{t("analyticsCookieItem2")}</li>
                      <li>{t("analyticsCookieItem3")}</li>
                      <li>{t("analyticsCookieItem4")}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <BarChart3 className="h-5 w-5"/>
                    {t("thirdPartyServices")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("analyticsServices")}</h3>
                    <p className="text-gray-600">
                      {t("analyticsServicesDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("educationalTools")}</h3>
                    <p className="text-gray-600">
                      {t("educationalToolsDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("noAdvertisingCookies")}</h3>
                    <p className="text-gray-600">
                      {t("noAdvertisingCookiesDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-5 w-5"/>
                    {t("studentPrivacyProtection")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("ferpaCompliance")}</h3>
                    <p className="text-gray-600">
                      {t("ferpaComplianceDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("noBehavioralAdvertising")}</h3>
                    <p className="text-gray-600">
                      {t("noBehavioralAdvertisingDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("minimalDataCollection")}</h3>
                    <p className="text-gray-600">
                      {t("minimalDataCollectionDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Eye className="h-5 w-5"/>
                    {t("managingYourCookiePreferences")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("browserSettings")}</h3>
                    <p className="text-gray-600">
                      {t("browserSettingsDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("cookiePreferencesCenter")}</h3>
                    <p className="text-gray-600">
                      {t("cookiePreferencesCenterDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("mobileDevices")}</h3>
                    <p className="text-gray-600">
                      {t("mobileDevicesDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Trash2 className="h-5 w-5"/>
                    {t("howToDeleteCookies")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("browserInstructions")}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">{t("chrome")}</h4>
                        <p className="text-sm text-gray-600">{t("chromeInstructions")}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">{t("firefox")}</h4>
                        <p className="text-sm text-gray-600">{t("firefoxInstructions")}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">{t("safari")}</h4>
                        <p className="text-sm text-gray-600">{t("safariInstructions")}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">{t("edge")}</h4>
                        <p className="text-sm text-gray-600">{t("edgeInstructions")}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("importantNote")}</h3>
                    <p className="text-gray-600">
                      {t("importantNoteDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-800 mb-4">{t("questionsAboutCookies")}</h3>
                  <p className="text-blue-700 mb-4">
                    {t("questionsAboutCookiesDescription")}
                  </p>
                  <div className="space-y-2 text-blue-700">
                    <p>
                      <strong>{t("email")}:</strong> privacy@kinekidsgames.com
                    </p>
                    <p>
                      <strong>{t("phone")}:</strong> +90 (532) 154-6934
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-8 bg-gray-900 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <button
                  onClick={scrollToTop}
                  className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-pointer group mb-4 sm:mb-0"
              >
                <Image
                    src="/kinekids-logo.png"
                    alt="KineKids Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-lg"
                />
                <span className="text-lg font-bold">KineKids</span>
              </button>
              <p className="text-xs text-gray-400">{t("copyright")}</p>
            </div>
          </div>
        </footer>
      </div>
  )
}
