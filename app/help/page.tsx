"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { Search, Mail, MessageSquare, FileText, Video, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import LanguageSwitcher from "@/components/language-switcher"

export default function HelpPage() {
  const { toast } = useToast()
  const { translate: t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: t("toast.searchingTitle"),
      description: t("toast.searchingDescription", { query: searchQuery }),
    })
  }

  const handleContactSupport = () => {
    toast({
      title: t("toast.supportRequestTitle"),
      description: t("toast.supportRequestDescription"),
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-4 md:px-6 w-full shadow-sm">
          <button onClick={scrollToTop} className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-pointer group">
              <Image src="/kinekids-logo.png" alt="KineKids Logo" width={32} height={32} className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"/>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300">
                  KineKids
              </span>
          </button>
          <div className="flex items-center gap-4 ml-auto">
              <Link href="/">
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-100">
                      <ArrowLeft className="h-4 w-4 mr-2"/>
                      {t("backToHome")}
                  </Button>
              </Link>
              <LanguageSwitcher className="text-sm text-gray-700 hover:text-gray-900"/>
          </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">{t("helpCenterTitle")}</h1>
            <p className="text-muted-foreground">{t("helpCenterSubtitle")}</p>
            <form onSubmit={handleSearch} className="relative mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("searchPlaceholder")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="absolute right-1 top-1 h-8 px-4 text-sm">
                {t("searchButton")}
              </Button>
            </form>
          </div>

          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="faq">{t("tabFAQ")}</TabsTrigger>
              <TabsTrigger value="guides">{t("tabGuides")}</TabsTrigger>
              <TabsTrigger value="videos">{t("tabVideos")}</TabsTrigger>
              <TabsTrigger value="contact">{t("tabContact")}</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("faqTitle")}</CardTitle>
                  <CardDescription>{t("faqDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>{t("faqAddStudentQ")}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t("faqAddStudentA")}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>{t("faqAssignGameQ")}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t("faqAssignGameA")}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>{t("faqViewPerformanceQ")}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t("faqViewPerformanceA")}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>{t("faqExportDataQ")}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t("faqExportDataA")}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger>{t("faqCustomizeGameQ")}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t("faqCustomizeGameA")}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("guidesTitle")}</CardTitle>
                  <CardDescription>{t("guidesDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: t("guideGettingStarted"), icon: FileText, description: t("guideGettingStartedDesc") },
                      { title: t("guideStudentManagement"), icon: FileText, description: t("guideStudentManagementDesc") },
                      { title: t("guideClassManagement"), icon: FileText, description: t("guideClassManagementDesc") },
                      { title: t("guideGameConfig"), icon: FileText, description: t("guideGameConfigDesc") },
                      { title: t("guideAnalytics"), icon: FileText, description: t("guideAnalyticsDesc") },
                      { title: t("guideAccountSettings"), icon: FileText, description: t("guideAccountSettingsDesc") },
                    ].map((guide, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        onClick={() => toast({ title: t("toast.openingGuide", { guide: guide.title }) })}
                      >
                        <div className="flex items-start gap-4">
                          <guide.icon className="h-6 w-6 text-primary" />
                          <div className="text-left">
                            <h3 className="font-medium">{guide.title}</h3>
                            <p className="text-sm text-muted-foreground">{guide.description}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("videosTitle")}</CardTitle>
                  <CardDescription>{t("videosDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: t("videoOverview"), duration: "5:32", thumbnail: "/placeholder.svg?height=120&width=240" },
                      { title: t("videoStudentManagement"), duration: "4:15", thumbnail: "/placeholder.svg?height=120&width=240" },
                      { title: t("videoClassCreation"), duration: "3:48", thumbnail: "/placeholder.svg?height=120&width=240" },
                      { title: t("videoGameConfig"), duration: "6:22", thumbnail: "/placeholder.svg?height=120&width=240" },
                    ].map((video, index) => (
                      <div key={index} className="space-y-2">
                        <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                          <img
                            src={video.thumbnail || "/placeholder.svg"}
                            alt={video.title}
                            className="object-cover w-full h-full"
                          />
                          <Button
                            variant="default"
                            size="icon"
                            className="absolute inset-0 m-auto h-12 w-12 rounded-full"
                            onClick={() => toast({ title: t("toast.playingVideo", { video: video.title }) })}
                          >
                            <Video className="h-6 w-6" />
                          </Button>
                        </div>
                        <div>
                          <h3 className="font-medium">{video.title}</h3>
                          <p className="text-sm text-muted-foreground">{video.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contactTitle")}</CardTitle>
                  <CardDescription>{t("contactDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium">
                          {t("contactName")}
                        </label>
                        <Input id="name" placeholder={t("contactNamePlaceholder")} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium">
                          {t("contactEmail")}
                        </label>
                        <Input id="email" type="email" placeholder={t("contactEmailPlaceholder")} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="block text-sm font-medium">
                          {t("contactSubject")}
                        </label>
                        <Input id="subject" placeholder={t("contactSubjectPlaceholder")} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="block text-sm font-medium">
                          {t("contactMessage")}
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t("contactMessagePlaceholder")}
                        ></textarea>
                      </div>
                      <Button onClick={handleContactSupport}>{t("contactSendRequest")}</Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">{t("otherHelpMethodsTitle")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{t("otherHelpMethodsSubtitle")}</p>
                      </div>

                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => toast({ title: t("toast.openingEmailClient") })}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          {t("emailSupport")}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => toast({ title: t("toast.openingLiveChat") })}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {t("liveChat")}
                        </Button>
                      </div>

                      <div className="rounded-lg border p-4 mt-6">
                        <h4 className="font-medium">{t("supportHoursTitle")}</h4>
                        <p className="text-sm text-muted-foreground mt-1" dangerouslySetInnerHTML={{__html: t("supportHoursContent")}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="w-full py-8 bg-gray-900 text-white">
          <div className="container px-4 md:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                  <button onClick={scrollToTop} className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-pointer group mb-4 sm:mb-0">
                      <Image src="/kinekids-logo.png" alt="KineKids Logo" width={24} height={24} className="h-6 w-6 rounded-lg"/>
                      <span className="text-lg font-bold">KineKids</span>
                  </button>
                  <p className="text-xs text-gray-400">{t("copyright")}</p>
              </div>
          </div>
      </footer>
    </div>
  )
}
