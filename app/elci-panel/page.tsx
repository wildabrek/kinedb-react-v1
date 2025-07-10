"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import MDBox from "@/components/MDBox"
import {
  Crown,
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  Share2,
  Award,
  Phone,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  Clock,
  Banknote,
  CreditCard,
} from "lucide-react"

export default function ElciPanelPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [ibanInfo, setIbanInfo] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")

  // Mock data
  const ambassadorData = {
    name: "Ayşe Öğretmen",
    code: "KINE-12345",
    totalStudents: 135,
    totalEarnings: 675, // $675
    pendingEarnings: 225, // $225
    thisMonthStudents: 28,
    status: "Gold Ambassador",
    joinDate: "2024-01-15",
  }

  const recentActivities = [
    { student: "Mehmet Yılmaz", grade: "3. Sınıf", date: "2024-01-20", earnings: 5 },
    { student: "Zeynep Kaya", grade: "4. Sınıf", date: "2024-01-19", earnings: 5 },
    { student: "Ali Demir", grade: "2. Sınıf", date: "2024-01-18", earnings: 5 },
    { student: "Fatma Şahin", grade: "5. Sınıf", date: "2024-01-17", earnings: 5 },
    { student: "Ahmet Özkan", grade: "1. Sınıf", date: "2024-01-16", earnings: 5 },
  ]

  const monthlyStats = [
    { month: "Ağustos", students: 15 },
    { month: "Eylül", students: 22 },
    { month: "Ekim", students: 18 },
    { month: "Kasım", students: 25 },
    { month: "Aralık", students: 27 },
    { month: "Ocak", students: 28 },
  ]

  const gradeDistribution = [
    { grade: "1. Sınıf", count: 20, percentage: 15 },
    { grade: "2. Sınıf", count: 25, percentage: 18 },
    { grade: "3. Sınıf", count: 18, percentage: 13 },
    { grade: "4. Sınıf", count: 22, percentage: 16 },
    { grade: "5. Sınıf", count: 15, percentage: 11 },
    { grade: "6. Sınıf", count: 12, percentage: 9 },
    { grade: "7. Sınıf", count: 13, percentage: 10 },
    { grade: "8. Sınıf", count: 10, percentage: 8 },
  ]

  const badges = [
    { name: "Bronze Ambassador", requirement: "10 öğrenci", earned: true, progress: 100 },
    { name: "Silver Ambassador", requirement: "50 öğrenci", earned: true, progress: 100 },
    { name: "Gold Ambassador", requirement: "100 öğrenci", earned: true, progress: 100 },
    { name: "Diamond Ambassador", requirement: "250 öğrenci", earned: false, progress: 54 },
  ]

  const paymentHistory = [
    { date: "2024-01-01", amount: 450, status: "Ödendi", method: "IBAN" },
    { date: "2023-12-01", amount: 300, status: "Ödendi", method: "PayPal" },
    { date: "2023-11-01", amount: 200, status: "Beklemede", method: "IBAN" },
  ]

  const faqItems = [
    {
      question: "Ödemeler ne zaman yapılır?",
      answer:
        "Ödemeler her ayın ilk haftasında, minimum 50$ tutarında yapılır. Bakiyeniz 50$'ın altındaysa bir sonraki aya aktarılır.",
    },
    {
      question: "Hangi ödeme yöntemlerini kullanabilirim?",
      answer:
        "IBAN (Türk bankası) veya PayPal hesabınıza ödeme yapabiliyoruz. Ödeme bilgilerinizi Ödemeler sekmesinden güncelleyebilirsiniz.",
    },
    {
      question: "Davet linkimi nasıl paylaşırım?",
      answer:
        "Davet Linki sekmesinden özel kodunuzu ve linkinizi kopyalayabilir, sosyal medyada paylaşabilirsiniz. Öğrenciler bu link ile kayıt olduğunda otomatik olarak size bağlanır.",
    },
    {
      question: "Rozetleri nasıl kazanırım?",
      answer:
        "Davet ettiğiniz öğrenci sayısına göre otomatik olarak rozetler kazanırsınız: 10 öğrenci (Bronz), 50 öğrenci (Gümüş), 100 öğrenci (Altın), 250 öğrenci (Elmas).",
    },
  ]

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Kopyalandı!",
      description: message,
    })
  }

  const handlePaymentRequest = () => {
    if (ambassadorData.pendingEarnings < 50) {
      toast({
        title: "Yetersiz Bakiye",
        description: "Minimum ödeme tutarı 50$'dır.",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: "Ödeme Yöntemi Seçin",
        description: "Lütfen önce ödeme yönteminizi belirleyin.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Ödeme Talebi Gönderildi",
      description: "Ödemeniz 3-5 iş günü içinde hesabınıza yatırılacak.",
    })
  }

  const shareWhatsApp = () => {
    const message = `KineKids'e katılın! Özel davet kodum: ${ambassadorData.code}\nLink: https://kinekids.com/register?ref=${ambassadorData.code}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
  }

  const shareFacebook = () => {
    const url = `https://kinekids.com/register?ref=${ambassadorData.code}`
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Elçi Paneli
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-xl text-gray-600">Hoş geldiniz, {ambassadorData.name}</p>
            <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {ambassadorData.status}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Ana Sayfa</TabsTrigger>
            <TabsTrigger value="referral">Davet Linki</TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
            <TabsTrigger value="badges">Rozetler</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="support">Destek</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MDBox bgColor="info" variant="gradient" borderRadius="lg" coloredShadow="info" pt={3} pb={3} px={3}>
                <Card className="border-0 bg-transparent text-white">
                  <CardContent className="pt-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-white" />
                    <div className="text-2xl font-bold">{ambassadorData.totalStudents}</div>
                    <p className="text-white/80 text-sm">Toplam Öğrenci</p>
                  </CardContent>
                </Card>
              </MDBox>

              <MDBox
                bgColor="success"
                variant="gradient"
                borderRadius="lg"
                coloredShadow="success"
                pt={3}
                pb={3}
                px={3}
              >
                <Card className="border-0 bg-transparent text-white">
                  <CardContent className="pt-6 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-white" />
                    <div className="text-2xl font-bold">${ambassadorData.totalEarnings}</div>
                    <p className="text-white/80 text-sm">Toplam Kazanç</p>
                  </CardContent>
                </Card>
              </MDBox>

              <MDBox
                bgColor="warning"
                variant="gradient"
                borderRadius="lg"
                coloredShadow="warning"
                pt={3}
                pb={3}
                px={3}
              >
                <Card className="border-0 bg-transparent text-white">
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-white" />
                    <div className="text-2xl font-bold">${ambassadorData.pendingEarnings}</div>
                    <p className="text-white/80 text-sm">Bekleyen Ödeme</p>
                  </CardContent>
                </Card>
              </MDBox>

              <MDBox bgColor="error" variant="gradient" borderRadius="lg" coloredShadow="error" pt={3} pb={3} px={3}>
                <Card className="border-0 bg-transparent text-white">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-white" />
                    <div className="text-2xl font-bold">{ambassadorData.thisMonthStudents}</div>
                    <p className="text-white/80 text-sm">Bu Ay</p>
                  </CardContent>
                </Card>
              </MDBox>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>Son kayıt olan öğrenciler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.student}</p>
                        <p className="text-sm text-gray-600">
                          {activity.grade} • {activity.date}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +${activity.earnings}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Davet Bilgileriniz</CardTitle>
                <CardDescription>Öğrencilerinizi davet etmek için bu bilgileri kullanın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Davet Kodunuz</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={ambassadorData.code} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(ambassadorData.code, "Davet kodu kopyalandı!")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Davet Linkiniz</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={`https://kinekids.com/register?ref=${ambassadorData.code}`} readOnly />
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `https://kinekids.com/register?ref=${ambassadorData.code}`,
                          "Davet linki kopyalandı!",
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={shareWhatsApp} className="bg-green-600 hover:bg-green-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    WhatsApp'ta Paylaş
                  </Button>
                  <Button onClick={shareFacebook} className="bg-blue-600 hover:bg-blue-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    Facebook'ta Paylaş
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nasıl Kullanılır?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <p>Davet kodunuzu veya linkinizi öğrencilerinizle paylaşın</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <p>Öğrenciler kayıt olurken kodunuzu kullanacak</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <p>Her kayıt olan öğrenci için otomatik olarak 5$ kazanırsınız</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sınıf Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gradeDistribution.map((grade, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{grade.grade}</span>
                          <span>{grade.count} öğrenci</span>
                        </div>
                        <Progress value={grade.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aylık İstatistikler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyStats.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{stat.month}</span>
                        <Badge variant="secondary">{stat.students} öğrenci</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tüm Öğrenciler</CardTitle>
                <CardDescription>Davet ettiğiniz öğrencilerin listesi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {Array.from({ length: ambassadorData.totalStudents }, (_, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <p className="font-medium">Öğrenci {i + 1}</p>
                        <p className="text-sm text-gray-600">{Math.floor(Math.random() * 8) + 1}. Sınıf</p>
                      </div>
                      <Badge variant="outline">Aktif</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {badges.map((badge, index) => (
                <Card key={index} className={badge.earned ? "border-green-200 bg-green-50" : ""}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Award className={`h-8 w-8 ${badge.earned ? "text-amber-500" : "text-gray-400"}`} />
                      <div>
                        <CardTitle className={badge.earned ? "text-green-700" : ""}>{badge.name}</CardTitle>
                        <CardDescription>{badge.requirement}</CardDescription>
                      </div>
                      {badge.earned && <CheckCircle className="h-6 w-6 text-green-600 ml-auto" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>İlerleme</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-2" />
                      {!badge.earned && (
                        <p className="text-sm text-gray-600">
                          {badge.name === "Diamond Ambassador"
                            ? `${250 - ambassadorData.totalStudents} öğrenci daha gerekli`
                            : "Tamamlandı"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mevcut Bakiye</CardTitle>
                <CardDescription>Ödeme talep edebileceğiniz tutar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">${ambassadorData.pendingEarnings}</div>
                  <p className="text-gray-600 mb-4">≈ {ambassadorData.pendingEarnings * 39} TL</p>
                  <Button
                    onClick={handlePaymentRequest}
                    disabled={ambassadorData.pendingEarnings < 50}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Ödeme Talep Et
                  </Button>
                  {ambassadorData.pendingEarnings < 50 && (
                    <p className="text-sm text-gray-500 mt-2">Minimum ödeme tutarı: $50</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ödeme Yöntemi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="iban"
                        name="payment"
                        value="iban"
                        checked={paymentMethod === "iban"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <Label htmlFor="iban">IBAN (Türk Bankası)</Label>
                    </div>
                    {paymentMethod === "iban" && (
                      <Input
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        value={ibanInfo}
                        onChange={(e) => setIbanInfo(e.target.value)}
                      />
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="paypal"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                    {paymentMethod === "paypal" && (
                      <Input
                        placeholder="paypal@email.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                      />
                    )}
                  </div>

                  <Button className="w-full bg-transparent" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bilgileri Kaydet
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ödeme Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentHistory.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">${payment.amount}</p>
                          <p className="text-sm text-gray-600">{payment.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={payment.status === "Ödendi" ? "default" : "secondary"}
                            className={payment.status === "Ödendi" ? "bg-green-600" : ""}
                          >
                            {payment.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{payment.method}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Destek Kanalları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp Destek
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Canlı Sohbet
                  </Button>
                  <div className="text-center text-sm text-gray-600">
                    <p>Destek Saatleri:</p>
                    <p>Pazartesi - Cuma: 09:00 - 18:00</p>
                    <p>Cumartesi: 10:00 - 16:00</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-sm text-gray-600">+90 XXX XXX XX XX</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">E-posta</p>
                      <p className="text-sm text-gray-600">destek@kinekids.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Destek ekibi çevrimiçi</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sık Sorulan Sorular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-2">{faq.question}</h4>
                          <p className="text-sm text-gray-600">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
