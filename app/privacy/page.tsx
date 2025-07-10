// Güncellenmiş KineKids gizlilik politikası sayfası - FERPA uyumlu
"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Eye, Lock, Database, Users, FileText } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import LanguageSwitcher from "@/components/language-switcher";

export default function PrivacyPolicyPage() {
  const { translate: t } = useLanguage()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col min-h-screen">
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
          <LanguageSwitcher className="text-sm text-blue-700 hover:text-blue-900" />
        </div>

      </header>

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-white">
        <div className="container px-4 md:px-6 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-4">
              <Shield className="h-4 w-4" />
              {t("privacyPolicy")}
            </div>
            <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent mb-4">
              {t("yourPrivacyMatters")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("privacyCommitment")}</p>
            <p className="text-sm text-gray-500 mt-4">Last updated: June 22, 2025</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Eye className="h-5 w-5" />
                  {t("informationWeCollect")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("anonymousStudentData")}</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>{t("studentInfoItem1")}</li>
                    <li>{t("studentInfoItem2")}</li>
                    <li>{t("studentInfoItem3")}</li>
                    <li>{t("studentInfoItem4")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("teacherAdminInformation")}</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>{t("personalInfoItem1")}</li>
                    <li>{t("personalInfoItem2")}</li>
                    <li>{t("personalInfoItem3")}</li>
                    <li>{t("personalInfoItem4")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("technicalInformation")}</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>{t("technicalInfoItem1")}</li>
                    <li>{t("technicalInfoItem2")}</li>
                    <li>{t("technicalInfoItem3")}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Database className="h-5 w-5" />
                  {t("howWeUseYourInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("educationalPurpose")}</h3>
                  <p className="text-gray-600">{t("educationalPurposeDescription")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("platformImprovement")}</h3>
                  <p className="text-gray-600">{t("platformImprovementDescription")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("communication")}</h3>
                  <p className="text-gray-600">{t("communicationDescription")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Lock className="h-5 w-5" />
                  {t("dataProtectionAndSecurity")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("encryption")}</h3>
                  <p className="text-gray-600">{t("encryptionDescription")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Access Controls</h3>
                  <p className="text-gray-600">{t("accessControlsDescription")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("ferpaCompliance")}</h3>
                  <p className="text-gray-600">{t("ferpaComplianceFullDescription")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Users className="h-5 w-5" />
                  {t("informationSharing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("weDoNotSellYourData")}</h3>
                  <p className="text-gray-600">{t("weDoNotSellYourDataDescription")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("limitedSharing")}</h3>
                  <p className="text-gray-600">{t("limitedSharingDescription")}</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                    <li>{t("limitedSharingItem1")}</li>
                    <li>{t("limitedSharingItem2")}</li>
                    <li>{t("limitedSharingItem3")}</li>
                    <li>{t("limitedSharingItem4")}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <FileText className="h-5 w-5" />
                  {t("yourRights")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("accessAndControl")}</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>{t("accessAndControlItem1")}</li>
                    <li>{t("accessAndControlItem2")}</li>
                    <li>{t("accessAndControlItem3")}</li>
                    <li>{t("accessAndControlItem4")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t("studentRights")}</h3>
                  <p className="text-gray-600">{t("studentRightsDescription")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-4">{t("contactUsAboutPrivacy")}</h3>
                <p className="text-blue-700 mb-4">{t("contactUsAboutPrivacyDescription")}</p>
                <div className="space-y-2 text-blue-700">
                  <p><strong>{t("Email")}:</strong> privacy@kinekidsgames.com</p>
                  <p><strong>{t("Phone")}:</strong> +90 (532) 154-6934</p>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 bg-gray-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <button onClick={scrollToTop} className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-pointer group mb-4 sm:mb-0">
              <Image src="/kinekids-logo.png" alt="KineKids Logo" width={24} height={24} className="h-6 w-6 rounded-lg" />
              <span className="text-lg font-bold">KineKids</span>
            </button>
            <p className="text-xs text-gray-400">{t("copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
