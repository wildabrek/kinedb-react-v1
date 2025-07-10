"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Scale, AlertTriangle, Users, Shield, Gavel } from "lucide-react"
import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/contexts/language-context"


export default function TermsOfServicePage() {
  const { translate: t } = useLanguage()
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
                <Scale className="h-4 w-4"/>
                {t("termsOfService")}
              </div>
              <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent mb-4">
                {t("termsOfService")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("readTermsCarefully")}
              </p>
              <p className="text-sm text-gray-500 mt-4">{t("lastUpdated")} December 18, 2024</p>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <FileText className="h-5 w-5"/>
                    {t("acceptanceOfTerms")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    {t("acceptanceOfTermsDescription1")}
                  </p>
                  <p className="text-gray-600">
                    {t("acceptanceOfTermsDescription2")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Users className="h-5 w-5"/>
                    {t("userAccountsAndResponsibilities")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("accountCreation")}</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("accountCreationItem1")}</li>
                      <li>{t("accountCreationItem2")}</li>
                      <li>{t("accountCreationItem3")}</li>
                      <li>{t("accountCreationItem4")}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("acceptableUse")}</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("acceptableUseItem1")}</li>
                      <li>{t("acceptableUseItem2")}</li>
                      <li>{t("acceptableUseItem3")}</li>
                      <li>{t("acceptableUseItem4")}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-5 w-5"/>
                    {t("educationalUseAndFerpaCompliance")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("educationalPurpose")}</h3>
                    <p className="text-gray-600">
                      {t("educationalPurposeDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("ferpaCompliance")}</h3>
                    <p className="text-gray-600">
                      {t("ferpaComplianceDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("dataUsage")}</h3>
                    <p className="text-gray-600">
                      {t("dataUsageDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Gavel className="h-5 w-5"/>
                    {t("intellectualProperty")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("kinekidsContent")}</h3>
                    <p className="text-gray-600">
                      {t("kinekidsContentDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("userContent")}</h3>
                    <p className="text-gray-600">
                      {t("userContentDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <AlertTriangle className="h-5 w-5"/>
                    {t("prohibitedActivities")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    {t("prohibitedActivitiesDescription")}
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>{t("prohibitedActivitiesItem1")}</li>
                    <li>{t("prohibitedActivitiesItem2")}</li>
                    <li>{t("prohibitedActivitiesItem3")}</li>
                    <li>{t("prohibitedActivitiesItem4")}</li>
                    <li>{t("prohibitedActivitiesItem5")}</li>
                    <li>{t("prohibitedActivitiesItem6")}</li>
                    <li>{t("prohibitedActivitiesItem7")}</li>
                    <li>{t("prohibitedActivitiesItem8")}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Scale className="h-5 w-5"/>
                    {t("limitationOfLiability")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("serviceAvailability")}</h3>
                    <p className="text-gray-600">
                      {t("serviceAvailabilityDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("disclaimer")}</h3>
                    <p className="text-gray-600">
                      {t("disclaimerDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <FileText className="h-5 w-5"/>
                    {t("termination")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("accountTermination")}</h3>
                    <p className="text-gray-600">
                      {t("accountTerminationDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("effectOfTermination")}</h3>
                    <p className="text-gray-600">
                      {t("effectOfTerminationDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-800 mb-4">{t("contactUsAboutTerms")}</h3>
                  <p className="text-blue-700 mb-4">
                    {t("contactUsAboutTermsDescription")}
                  </p>
                  <div className="space-y-2 text-blue-700">
                    <p>
                      <strong>{t("email")}</strong> legal@kinekidsgames.com
                    </p>
                    <p>
                      <strong>{t("phone")}</strong> +90 (532) 154-6934
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
              <p className="text-xs text-gray-400">© 2024 KineKids. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}
