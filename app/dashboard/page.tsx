"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic" // Dinamik import için eklendi

// UI Bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import MDBox from "@/components/MDBox"

// Ikonlar
import { Users, BookOpen, Bug, Database, Gamepad2, TrendingUp, School, Settings, BarChart3, Wrench, FolderSyncIcon as Sync, Crown, Loader2, AlertCircle } from "lucide-react"

// Diğer
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { getStudents, getClasses, getGames } from "@/lib/api"


// --- DİNAMİK BİLEŞEN YÜKLEYİCİLERİ ---

// Grafiklerin yüklenmesi sırasında gösterilecek ortak bir yükleyici bileşeni
const ChartLoader = () => (
    <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
)

// Özel grafik bileşenlerini dinamik olarak yükle
// HATA DÜZELTİLDİ: Named export olan bileşenler için .then() eklendi.
const DynamicGameUsageChart = dynamic(() => import("@/components/game-usage-chart"), { loading: () => <ChartLoader />, ssr: false });
const DynamicPerformanceChart = dynamic(() => import("@/components/performance-chart"), { loading: () => <ChartLoader />, ssr: false });
const DynamicSkillProgressChart = dynamic(() => import("@/components/skill-progress-chart").then(mod => mod.SkillProgressChart), { loading: () => <ChartLoader />, ssr: false });
const DynamicSubjectPerformanceChart = dynamic(() => import("@/components/subject-performance-chart").then(mod => mod.SubjectPerformanceChart), { loading: () => <ChartLoader />, ssr: false });


// --- ANA DASHBOARD SAYFA BİLEŞENİ ---

export default function DashboardPage() {
  const { user } = useAuth()
  const { translate: t } = useLanguage()

  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [totalClasses, setTotalClasses] = useState<number>(0)
  const [totalGames, setTotalGames] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Veri çekme işlemi başlamadan önce yükleme durumunu true yap
      setLoading(true)
      setError(null)

      try {
        const schoolId = user?.school_id || 1 // Kullanıcıdan school_id al, yoksa varsayılan kullan

        const [studentsResponse, classesResponse, gamesResponse] = await Promise.all([
            getStudents(schoolId),
            getClasses(schoolId),
            getGames()
        ]);

        setTotalStudents(studentsResponse.length)
        setTotalClasses(classesResponse.length)
        setTotalGames(gamesResponse.length)
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err)
        setError(
          `Veriler yüklenemedi: ${err.message || "API'ye bağlanılamadı. Lütfen ağ bağlantınızı kontrol edin."}`,
        )
        // Hata durumunda değerleri sıfırla
        setTotalStudents(0)
        setTotalClasses(0)
        setTotalGames(0)
      } finally {
        // İşlem bittiğinde yükleme durumunu false yap
        setLoading(false)
      }
    }

    if (user) {
        fetchData()
    }
  }, [user])

  // Grafik verileri (statik veya ileride API'den gelebilir)
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

  // Framer Motion için animasyon varyantları
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
        <h2 className="text-3xl font-bold tracking-tight">{t("Dashboard")}</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{user?.role || "User"}</Badge>
        </div>
      </div>

      {error && (
         <Card className="bg-destructive text-destructive-foreground">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertCircle/> Hata</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
         </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MDBox bgColor="info" variant="gradient" borderRadius="lg" coloredShadow="info" pt={2} pb={2} px={2}>
          <Card className="border-0 bg-transparent text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">{t("Total Students")}</CardTitle>
              <Users className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-white/30" />
              ) : (
                <div className="text-2xl font-bold text-white">{totalStudents}</div>
              )}
              <p className="text-xs text-white/80">{t("Active students in the system")}</p>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox bgColor="success" variant="gradient" borderRadius="lg" coloredShadow="success" pt={2} pb={2} px={2}>
          <Card className="border-0 bg-transparent text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">{t("Total Classes")}</CardTitle>
              <BookOpen className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              {loading ? (
                 <Skeleton className="h-8 w-20 bg-white/30" />
              ) : (
                <div className="text-2xl font-bold text-white">{totalClasses}</div>
              )}
              <p className="text-xs text-white/80">{t("Active classes")}</p>
            </CardContent>
          </Card>
        </MDBox>

        <MDBox bgColor="warning" variant="gradient" borderRadius="lg" coloredShadow="warning" pt={2} pb={2} px={2}>
          <Card className="border-0 bg-transparent text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">{t("Total Games")}</CardTitle>
              <Gamepad2 className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-white/30" />
              ) : (
                <div className="text-2xl font-bold text-white">{totalGames}</div>
              )}
              <p className="text-xs text-white/80">{t("Available games")}</p>
            </CardContent>
          </Card>
        </MDBox>
      </div>

      {/* Project Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
            <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-blue-100 rounded-lg"><School className="h-6 w-6 text-blue-600" /></div><div><CardTitle className="text-lg">{t("School Information")}</CardTitle><CardDescription className="text-sm">{t("School settings and information")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0"><Link href="/schools"><Button variant="outline" className="w-full bg-transparent">{t("View")}</Button></Link></CardContent>
                </Card>
            </MDBox>
        </motion.div>

        <motion.div variants={itemVariants}>
             <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-green-100 rounded-lg"><Settings className="h-6 w-6 text-green-600" /></div><div><CardTitle className="text-lg">{t("Quick Actions")}</CardTitle><CardDescription className="text-sm">{t("Frequently used actions")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            <Link href="/students/create"><Button variant="outline" size="sm" className="w-full bg-transparent">{t("Add Student")}</Button></Link>
                            <Link href="/classes/create"><Button variant="outline" size="sm" className="w-full bg-transparent">{t("Create Class")}</Button></Link>
                        </div>
                    </CardContent>
                </Card>
            </MDBox>
        </motion.div>

        <motion.div variants={itemVariants}>
            <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="h-6 w-6 text-purple-600" /></div><div><CardTitle className="text-lg">{t("Student Progress")}</CardTitle><CardDescription className="text-sm">{t("Detailed analysis and reports")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0"><Link href="/analytics"><Button variant="outline" className="w-full bg-transparent">{t("Analytics")}</Button></Link></CardContent>
                </Card>
            </MDBox>
        </motion.div>

        <motion.div variants={itemVariants}>
            <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-amber-100 rounded-lg"><Crown className="h-6 w-6 text-amber-600" /></div><div><CardTitle className="text-lg">{t("Ambassador Panel")}</CardTitle><CardDescription className="text-sm">{t("Ambassador program management")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0"><Link href="/elci-panel"><Button variant="outline" className="w-full bg-transparent">{t("Open Panel")}</Button></Link></CardContent>
                    <CardContent className="pt-0"><Link href="/ambassador-applications"><Button variant="outline" className="w-full bg-transparent">{t("Ambassador Applications")}</Button></Link></CardContent>
                </Card>
            </MDBox>
        </motion.div>

        <motion.div variants={itemVariants}>
            <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-red-100 rounded-lg"><Bug className="h-6 w-6 text-red-600" /></div><div><CardTitle className="text-lg">{t("Debugging")}</CardTitle><CardDescription className="text-sm">{t("System status and logs")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0"><Link href="/debug/local-storage"><Button variant="outline" className="w-full bg-transparent">{t("Debug Panel")}</Button></Link></CardContent>
                </Card>
            </MDBox>
        </motion.div>

        <motion.div variants={itemVariants}>
            <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-orange-100 rounded-lg"><Wrench className="h-6 w-6 text-orange-600" /></div><div><CardTitle className="text-lg">{t("Initial Setup")}</CardTitle><CardDescription className="text-sm">{t("System setup wizard")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0"><Link href="/initial-setup"><Button variant="outline" className="w-full bg-transparent">{t("Setup")}</Button></Link></CardContent>
                </Card>
            </MDBox>
        </motion.div>

        <motion.div variants={itemVariants}>
            <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-cyan-100 rounded-lg"><Database className="h-6 w-6 text-cyan-600" /></div><div><CardTitle className="text-lg">{t("Test Data Generation")}</CardTitle><CardDescription className="text-sm">{t("Sample data for development")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0"><Link href="/test-sync"><Button variant="outline" className="w-full bg-transparent">{t("Test Data")}</Button></Link></CardContent>
                </Card>
            </MDBox>
        </motion.div>

        <motion.div variants={itemVariants}>
            <MDBox bgColor="white" borderRadius="lg" shadow="md" pt={3} pb={3} px={3} className="h-full">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3"><div className="p-2 bg-indigo-100 rounded-lg"><Sync className="h-6 w-6 text-indigo-600" /></div><div><CardTitle className="text-lg">{t("Synchronization Test")}</CardTitle><CardDescription className="text-sm">{t("Data synchronization tools")}</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="pt-0"><Link href="/test-sync"><Button variant="outline" className="w-full bg-transparent">{t("Sync Test")}</Button></Link></CardContent>
                </Card>
            </MDBox>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("Game Usage")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicGameUsageChart data={gameUsageData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("Performance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicPerformanceChart data={performanceData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("Skill Progress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicSkillProgressChart data={skillProgressData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("Subject Performance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicSubjectPerformanceChart data={subjectPerformanceData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
