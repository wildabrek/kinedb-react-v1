"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Globe, Shield, Download, Trash2, Edit, Eye, CheckCircle } from "lucide-react"
import {useLanguage} from "@/contexts/language-context"
import LanguageSwitcher from "@/components/language-switcher";

export default function GDPRPage() {
  const { translate : t} = useLanguage()
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
                <Globe className="h-4 w-4"/>
                {t("gdprCompliance")}
              </div>
              <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent mb-4">
                {t("gdprComplianceAndYourRights")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("gdprCommitmentMessage")}
              </p>
              <p className="text-sm text-gray-500 mt-4">{t("lastUpdatedDate")}</p>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-5 w-5"/>
                    {t("ourCommitmentToGdpr")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    {t("gdprDescription1")}
                  </p>
                  <p className="text-gray-600">
                    {t("gdprDescription2")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="h-5 w-5"/>
                    {t("yourGdprRights")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Eye className="h-5 w-5 text-blue-500"/>
                        <h3 className="font-semibold text-gray-800">{t("rightToAccess")}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {t("rightToAccessDescription")}
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Edit className="h-5 w-5 text-green-500"/>
                        <h3 className="font-semibold text-gray-800">{t("rightToRectification")}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {t("rightToRectificationDescription")}
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Trash2 className="h-5 w-5 text-red-500"/>
                        <h3 className="font-semibold text-gray-800">{t("rightToErasure")}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {t("rightToErasureDescription")}
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Download className="h-5 w-5 text-purple-500"/>
                        <h3 className="font-semibold text-gray-800">{t("rightToPortability")}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {t("rightToPortabilityDescription")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">{t("additionalRights")}</h3>
                    <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                      <li>
                        <strong>{t("rightToRestrictProcessing")}</strong> {t("rightToRestrictProcessingDescription")}
                      </li>
                      <li>
                        <strong>{t("rightToObject")}</strong> {t("rightToObjectDescription")}
                      </li>
                      <li>
                        <strong>{t("rightToWithdrawConsent")}</strong> {t("rightToWithdrawConsentDescription")}
                      </li>
                      <li>
                        <strong>{t("rightToLodgeAComplaint")}</strong> {t("rightToLodgeAComplaintDescription")}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-5 w-5"/>
                    {t("legalBasisForProcessing")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("educationalServicesContract")}</h3>
                    <p className="text-gray-600">
                      {t("educationalServicesContractDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("legitimateInterests")}</h3>
                    <p className="text-gray-600">
                      {t("legitimateInterestsDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("legalCompliance")}</h3>
                    <p className="text-gray-600">
                      {t("legalComplianceDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("consent")}</h3>
                    <p className="text-gray-600">
                      {t("consentDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Globe className="h-5 w-5"/>
                    {t("internationalDataTransfers")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("dataLocation")}</h3>
                    <p className="text-gray-600">
                      {t("dataLocationDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("transferSafeguards")}</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("transferSafeguard1")}</li>
                      <li>{t("transferSafeguard2")}</li>
                      <li>{t("transferSafeguard3")}</li>
                      <li>{t("transferSafeguard4")}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-5 w-5"/>
                    {t("dataProtectionMeasures")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("technicalSafeguards")}</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("technicalSafeguardItem1")}</li>
                      <li>{t("technicalSafeguardItem2")}</li>
                      <li>{t("technicalSafeguardItem3")}</li>
                      <li>{t("technicalSafeguardItem4")}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("organizationalMeasures")}</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>{t("organizationalMeasure1")}</li>
                      <li>{t("organizationalMeasure2")}</li>
                      <li>{t("organizationalMeasure3")}</li>
                      <li>{t("organizationalMeasure4")}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Download className="h-5 w-5"/>
                    {t("howToExerciseYourRights")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("submitARequest")}</h3>
                    <p className="text-gray-600">
                      {t("submitARequestDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("identityVerification")}</h3>
                    <p className="text-gray-600">
                      {t("identityVerificationDescription")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t("noCost")}</h3>
                    <p className="text-gray-600">
                      {t("noCostDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-800 mb-4">{t("dataProtectionOfficerContact")}</h3>
                  <p className="text-blue-700 mb-4">
                    {t("dataProtectionOfficerDescription")}
                  </p>
                  <div className="space-y-2 text-blue-700">
                    <p>
                      <strong>{t("email")}:</strong> dpo@kinekidsgames.com
                    </p>
                    <p>
                      <strong>{t("phone")}:</strong> +90 (532) 154-6934
                    </p>

                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>{t("euRepresentative")}</strong> {t("euRepresentativeDescription")}
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
