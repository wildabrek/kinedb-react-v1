// app/elci-basvuru/page.tsx

"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft, Award, Trophy, Crown, Gem,
  CheckCircle, Send
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/language-switcher";

interface PackageData {
  name: string;
  icon: React.ElementType;
  textColor: string;
  bgColor: string;
  borderColor: string;
  students: number;
  perStudent: number;
  total: number;
  totalTL: number;
}

interface ApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  city: string;
  district: string;
  motivation: string;
}

const packages: PackageData[] = [
  { name: "Bronze", icon: Award, textColor: "text-amber-800", bgColor: "bg-amber-50", borderColor: "border-amber-200", students: 50, perStudent: 7, total: 350, totalTL: 13650 },
  { name: "Silver", icon: Trophy, textColor: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200", students: 200, perStudent: 6, total: 1200, totalTL: 46800 },
  { name: "Gold", icon: Crown, textColor: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", students: 500, perStudent: 5, total: 2500, totalTL: 97500 },
  { name: "Diamond", icon: Gem, textColor: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200", students: 1000, perStudent: 4, total: 4000, totalTL: 156000 },
];

const faqs = [
  { question: "faq1q", answer: "faq1a" },
  { question: "faq2q", answer: "faq2a" },
  { question: "faq3q", answer: "faq3a" },
];

export default function ElciBasvuruPage() {
  const { translate: t } = useLanguage();

  const [formData, setFormData] = useState<ApplicationData>({
    firstName: "", lastName: "", email: "", phone: "",
    school: "", city: "", district: "", motivation: ""
  });
  const [selectedPackageName, setSelectedPackageName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageName) {
      toast({
        title: "Paket Seçimi Eksik",
        description: "Lütfen başvurmak istediğiniz elçilik seviyesini seçin.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPackage = packages.find(p => p.name === selectedPackageName);
      const response = await fetch("/api/ambassador-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          packageName: selectedPackage?.name,
          price: 0
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Başvuru gönderilemedi.");
      }
      const result = await response.json();
      setApplicationId(result.applicationId);
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Hata Oluştu",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center p-6">
          <CardHeader>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">{t("applicationReceived")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-700">{t("applicationThanks")}</p>
            <p className="font-mono text-xl bg-gray-200 p-2 rounded-md inline-block mb-6">{applicationId}</p>
            <p className="mb-6">{t("applicationFollowup")}</p>
            <Link href="/"><Button><ArrowLeft className="w-4 h-4 mr-2" />{t("backToHome")}</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-4 md:px-6 w-full shadow-sm">
        <button onClick={scrollToTop} className="flex items-center gap-2">
          <Image src="/kinekids-logo.png" alt="KineKids Logo" width={32} height={32} />
          <span className="text-xl font-bold">KineKids</span>
        </button>
        <div className="flex items-center gap-4 ml-auto">
          <Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />{t("backToHome")}</Button></Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

          <section className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">{t("ambassadorTitle")}</h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">{t("ambassadorSubtitle")}</p>
          </section>

          <section>
            <Card className="p-8 bg-white shadow-sm">
              <CardTitle className="text-2xl mb-4 text-center">{t("howItWorks")}</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"><p className="font-bold text-xl">1</p></div>
                  <h3 className="font-semibold">{t("stepApply")}</h3>
                  <p className="text-sm text-gray-600">{t("stepApplyDesc")}</p>
                </div>
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"><p className="font-bold text-xl">2</p></div>
                  <h3 className="font-semibold">{t("stepApprove")}</h3>
                  <p className="text-sm text-gray-600">{t("stepApproveDesc")}</p>
                </div>
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"><p className="font-bold text-xl">3</p></div>
                  <h3 className="font-semibold">{t("stepStart")}</h3>
                  <p className="text-sm text-gray-600">{t("stepStartDesc")}</p>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t("packagesTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {packages.map((pkg) => (
                <Card key={pkg.name} className={`flex flex-col border-2 ${pkg.borderColor} shadow-lg`}>
                  <CardHeader className={`text-center pb-4 ${pkg.bgColor}`}>
                    <pkg.icon className={`w-12 h-12 mx-auto ${pkg.textColor}`} />
                    <CardTitle className={`mt-4 ${pkg.textColor}`}>{pkg.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between text-center">
                      <div className="space-y-3 text-sm my-4 p-3 bg-gray-100 rounded-lg border">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("targetStudents")}:</span>
                          <span className="font-bold">{pkg.students}+</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("perStudent")}:</span>
                          <span className="font-bold">${pkg.perStudent}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 mt-3">
                          <span className="text-gray-600">{t("monthlyEarnings")}:</span>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${pkg.total.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">≈ {pkg.totalTL.toLocaleString()} TL</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t("faqsTitle")}</h2>
            <Card className="max-w-3xl mx-auto p-2">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index + 1}`}>
                      <AccordionTrigger className="text-left">{t(faq.question)}</AccordionTrigger>
                      <AccordionContent><p>{t(faq.answer)}</p></AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="max-w-4xl mx-auto" id="application-form">
              <CardHeader>
                <CardTitle className="text-2xl text-center">{t("applicationFormTitle")}</CardTitle>
                <CardDescription className="text-center">{t("applicationFormSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="firstName">{t("firstName")} *</Label><Input id="firstName" value={formData.firstName} onChange={e => handleInputChange("firstName", e.target.value)} required /></div>
                    <div><Label htmlFor="lastName">{t("lastName")} *</Label><Input id="lastName" value={formData.lastName} onChange={e => handleInputChange("lastName", e.target.value)} required /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="email">{t("email")} *</Label><Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required /></div>
                    <div><Label htmlFor="phone">{t("phone")} *</Label><Input id="phone" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} required /></div>
                  </div>
                  <div><Label htmlFor="school">{t("school")} *</Label><Input id="school" value={formData.school} onChange={e => handleInputChange("school", e.target.value)} required /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="city">{t("city")} *</Label><Input id="city" value={formData.city} onChange={e => handleInputChange("city", e.target.value)} required /></div>
                    <div><Label htmlFor="district">{t("district")} *</Label><Input id="district" value={formData.district} onChange={e => handleInputChange("district", e.target.value)} required /></div>
                  </div>
                  <div><Label htmlFor="motivation">{t("motivation")} *</Label><Textarea id="motivation" value={formData.motivation} onChange={e => handleInputChange("motivation", e.target.value)} required className="min-h-[120px]" /></div>
                  <div>
                    <Label htmlFor="package">{t("selectPackage")} *</Label>
                    <Select onValueChange={setSelectedPackageName} value={selectedPackageName}>
                      <SelectTrigger id="package"><SelectValue placeholder={t("selectPackage")} /></SelectTrigger>
                      <SelectContent>{packages.map(p => (<SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="text-center pt-4">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? t("submitting") : <><Send className="w-5 h-5 mr-2" />{t("submitApplication")}</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>

        </div>
      </main>

      <footer className="w-full py-8 bg-gray-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <button onClick={scrollToTop} className="flex items-center gap-2">
              <Image src="/kinekids-logo.png" alt="KineKids Logo" width={24} height={24} />
              <span className="text-lg font-bold">KineKids</span>
            </button>
            <p className="text-xs text-gray-400">{t("copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
