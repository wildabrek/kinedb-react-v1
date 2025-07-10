"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Trophy, ArrowRight, Bug, TestTube, Database } from "lucide-react"
import Link from "next/link"
import { ChartContainerExample } from "@/components/chart-container-example"
import { Badge } from "@/components/ui/badge"
import GameUsageChart from "@/components/game-usage-chart"
import PerformanceChart from "@/components/performance-chart"
import { SkillProgressChart } from "@/components/skill-progress-chart"
import { SubjectPerformanceChart } from "@/components/subject-performance-chart"
import { ChartArea } from "@/components/charts/chart-area"
import { ChartBar } from "@/components/charts/chart-bar"
import { ChartLine } from "@/components/charts/chart-line"
import { ChartPie } from "@/components/charts/chart-pie"
import { ChartContainer } from "@/components/ui/chart/chart-container"
import MDBox from "@/components/MDBox"
import DefaultProjectCard from "@/components/default-project-card"
import { getStudents, getClasses, getGames } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {

  Gamepad2,
  TrendingUp,
  School,
  Settings,
  BarChart3,

  Wrench,

  FolderSyncIcon as Sync,
  Crown,
} from "lucide-react"


export default function DashboardPage() {
  // Başlangıç değerlerini 0 olarak ayarladım
  const { user, isAuthenticated, isInitialized } = useAuth()

  const { translate: t } = useLanguage()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  //const [gameUsageData, setGameUsageData] = useState<any[]>([])
  //const [performanceData, setPerformanceData] = useState<any[]>([])
  const [skillData, setSkillData] = useState<any[]>([])
  const [subjectData, setSubjectData] = useState<any[]>([])



  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [totalClasses, setTotalClasses] = useState<number>(0)
  const [totalGames, setTotalGames] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const schoolId = 1 // Placeholder school_id. Gerçek uygulamada kullanıcı bağlamından gelmeli.

        const studentsResponse = await getStudents(schoolId)
        const classesResponse = await getClasses(schoolId)
        const gamesResponse = await getGames()

        setTotalStudents(studentsResponse.length)
        setTotalClasses(classesResponse.length)
        setTotalGames(gamesResponse.length)
        setError(null) // Başarılı olursa hatayı temizle
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err)
        // Hata mesajını daha açıklayıcı hale getirdim
        setError(
          `Veriler yüklenemedi: ${err.message || "API'ye bağlanılamadı. Backend'inizin çalıştığından ve NEXT_PUBLIC_API_URL'nin doğru ayarlandığından emin olun."}`,
        )
        // Hata durumunda da yüklemeyi bitir
        setTotalStudents(0) // Hata durumunda varsayılan değerler
        setTotalClasses(0)
        setTotalGames(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Yeni grafik bileşenleri için veri
  const studentEngagementData = [
    { month: "Ocak", desktop: 186, mobile: 80 },
    { month: "Şubat", desktop: 305, mobile: 200 },
    { month: "Mart", desktop: 237, mobile: 120 },
    { month: "Nisan", desktop: 173, mobile: 190 },
    { month: "Mayıs", desktop: 209, mobile: 130 },
    { month: "Haziran", desktop: 214, mobile: 140 },
  ]

  const gameCompletionData = [
    { month: "Ocak", desktop: 120, mobile: 60 },
    { month: "Şubat", desktop: 180, mobile: 95 },
    { month: "Mart", desktop: 150, mobile: 85 },
    { month: "Nisan", desktop: 200, mobile: 110 },
    { month: "Mayıs", desktop: 165, mobile: 90 },
    { month: "Haziran", desktop: 190, mobile: 105 },
  ]

  const subjectDistributionData = [
    { browser: "matematik", visitors: 275, fill: "var(--color-chrome)" },
    { browser: "fen", visitors: 200, fill: "var(--color-safari)" },
    { browser: "türkçe", visitors: 287, fill: "var(--color-firefox)" },
    { browser: "sosyal", visitors: 173, fill: "var(--color-edge)" },
    { browser: "diğer", visitors: 190, fill: "var(--color-other)" },
  ]

  const chartConfig = {
    desktop: {
      label: "Masaüstü",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobil",
      color: "hsl(var(--chart-2))",
    },
  }

  const pieChartConfig = {
    visitors: {
      label: "Öğrenci",
    },
    chrome: {
      label: "Matematik",
      color: "hsl(var(--chart-1))",
    },
    safari: {
      label: "Fen",
      color: "hsl(var(--chart-2))",
    },
    firefox: {
      label: "Türkçe",
      color: "hsl(var(--chart-3))",
    },
    edge: {
      label: "Sosyal",
      color: "hsl(var(--chart-4))",
    },
    other: {
      label: "Diğer",
      color: "hsl(var(--chart-5))",
    },
  }

  const performanceData = [
    { month: "Jan", score: 65 },
    { month: "Feb", score: 72 },
    { month: "Mar", score: 78 },
    { month: "Apr", score: 81 },
    { month: "May", score: 85 },
    { month: "Jun", score: 92 },
  ]

  const gameUsageData = [
    { game: "Math Blast", plays: 120 },
    { game: "Word Find", plays: 98 },
    { game: "Logic Path", plays: 75 },
    { game: "Science Lab", plays: 150 },
  ]

  const skillProgressData = [
    { date: "Wk 1", skill: 55 },
    { date: "Wk 2", skill: 60 },
    { date: "Wk 3", skill: 68 },
    { date: "Wk 4", skill: 75 },
  ]

  const subjectPerformanceData = [
    { subject: "Math", correct: 80, incorrect: 20 },
    { subject: "Science", correct: 95, incorrect: 5 },
    { subject: "History", correct: 70, incorrect: 30 },
    { subject: "English", correct: 88, incorrect: 12 },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{user?.role || "User"}</Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MDBox bgColor="info" variant="gradient" borderRadius="lg" coloredShadow="info" pt={2} pb={2} px={2}>
          <Card className="border-0 bg-transparent text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Toplam Öğrenci</CardTitle>
              <Users className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboardData?.totalStudents || 0}</div>
              <p className="text-xs text-white/80">Sistemdeki aktif öğrenciler</p>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox bgColor="success" variant="gradient" borderRadius="lg" coloredShadow="success" pt={2} pb={2} px={2}>
          <Card className="border-0 bg-transparent text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Toplam Sınıf</CardTitle>
              <BookOpen className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboardData?.totalClasses || 0}</div>
              <p className="text-xs text-white/80">Aktif sınıflar</p>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox bgColor="warning" variant="gradient" borderRadius="lg" coloredShadow="warning" pt={2} pb={2} px={2}>
          <Card className="border-0 bg-transparent text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Toplam Oyun</CardTitle>
              <Gamepad2 className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboardData?.totalGames || 0}</div>
              <p className="text-xs text-white/80">Mevcut oyunlar</p>
            </CardContent>
          </Card>
        </MDBox>
      </div>

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.1s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <School className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Okul Bilgileri</CardTitle>
                  <CardDescription className="text-sm">Okul ayarları ve bilgileri</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/schools">
                <Button variant="outline" className="w-full bg-transparent">
                  Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.2s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
                  <CardDescription className="text-sm">Sık kullanılan işlemler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Link href="/students/create">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Öğrenci Ekle
                  </Button>
                </Link>
                <Link href="/classes/create">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Sınıf Oluştur
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.3s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Öğrenci İlerlemesi</CardTitle>
                  <CardDescription className="text-sm">Detaylı analiz ve raporlar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/analytics">
                <Button variant="outline" className="w-full bg-transparent">
                  Analitik
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.4s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Elçi Paneli</CardTitle>
                  <CardDescription className="text-sm">Elçi programı yönetimi</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/elci-panel">
                <Button variant="outline" className="w-full bg-transparent">
                  Paneli Aç
                </Button>
              </Link>
            </CardContent>
            <CardContent className="pt-0">
              <Link href="/ambassador-applications">
                <Button variant="outline" className="w-full bg-transparent">
                  Ambassador Panel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.5s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bug className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Hata Ayıklama</CardTitle>
                  <CardDescription className="text-sm">Sistem durumu ve loglar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/debug/local-storage">
                <Button variant="outline" className="w-full bg-transparent">
                  Debug Panel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.6s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">İlk Kurulum</CardTitle>
                  <CardDescription className="text-sm">Sistem kurulum sihirbazı</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/initial-setup">
                <Button variant="outline" className="w-full bg-transparent">
                  Kurulum
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.7s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Database className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Test Verisi Oluşturma</CardTitle>
                  <CardDescription className="text-sm">Geliştirme için örnek veri</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/test-sync">
                <Button variant="outline" className="w-full bg-transparent">
                  Test Verisi
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox
          bgColor="white"
          borderRadius="lg"
          shadow="md"
          pt={3}
          pb={3}
          px={3}
          style={{ animationDelay: "0.8s" }}
          className="animate-fade-in-up"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Sync className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Senkronizasyon Testi</CardTitle>
                  <CardDescription className="text-sm">Veri senkronizasyon araçları</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/test-sync">
                <Button variant="outline" className="w-full bg-transparent">
                  Sync Test
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MDBox>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Oyun Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GameUsageChart data={gameUsageData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={performanceData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Beceri İlerlemesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkillProgressChart data={skillData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ders Performansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectPerformanceChart data={subjectData} />
          </CardContent>
        </Card>
      </div>

      {/* Chart Container Example */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Konteyner Örneği</CardTitle>
          <CardDescription>Grafik konteyner bileşeninin kullanım örneği</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              desktop: {
                label: "Desktop",
                color: "hsl(var(--chart-1))",
              },
              mobile: {
                label: "Mobile",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="min-h-[200px]"
          >
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Grafik verileri burada görüntülenecek
            </div>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
