"use client"

import type React from "react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import dynamic from "next/dynamic" // Dinamik import için eklendi

// API ve tür tanımlamaları
import {
  getStudent,
  getClass,
  getTeacher,
  getStudentGamePlays,
  getStudentSkills,
  getStudentSubjectScores,
  getGameById,
  getStudentActionPlans,
  getStudentStrengths,
  getStudentDevelopmentAreas,
  getStrengths,
  getDevelopmentAreas,
  getAllGames,
  type Game,
  type Student,
  type GamePlay,
  type StudentSkill,
  type StudentSubjectScore,
  type GameTypeAlias,
  type Strength,
  type DevelopmentArea,
} from "@/lib/api"
import { type StudentDataForReport, type AIReport, generateStudentReportJson } from "@/actions/gemini-actions"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/components/ui/use-toast"

// UI Bileşenleri
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronUp,
  Download,
  Gamepad2Icon as GameController2,
  LineChartIcon,
  Mail,
  Printer,
  Share2,
  Star,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  MinusCircle,
  FileText,
  Award,
  BrainCircuit,
  Gamepad2,
  ListChecks,
  TrendingUp,
  BookOpen,
  Sparkles,
  Target,
} from "lucide-react"

// --- DİNAMİK BİLEŞEN IMPORTLARI ---

// Grafiklerin yüklenmesi sırasında gösterilecek ortak bir yükleyici bileşeni
const ChartLoader = () => (
    <div className="flex items-center justify-center h-[300px] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
)

// Recharts kütüphanesinden grafikleri dinamik olarak yükle
const DynamicBarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), {
    loading: () => <ChartLoader />,
    ssr: false, // Sunucu tarafında render etme
})
const DynamicLineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), {
    loading: () => <ChartLoader />,
    ssr: false, // Sunucu tarafında render etme
})

// Kendi özel Radar grafiği bileşenini dinamik olarak yükle
const DynamicStudentSkillsRadar = dynamic(() => import("@/components/student-skills-radar"), {
    loading: () => <ChartLoader />,
    ssr: false, // Sunucu tarafında render etme
})

// Grafikler tarafından kullanılan diğer Recharts bileşenleri
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"


// --- SAYFA BİLEŞENLERİ ---

const SectionCard: React.FC<{
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}> = ({ icon, title, description, children, className }) => {
  const { translate: t } = useLanguage()
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

const AiReportSummary: React.FC<{ studentData: StudentDataForReport; language: string }> = ({
  studentData,
  language,
}) => {
    const { translate: t } = useLanguage()
    const [report, setReport] = useState<AIReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchReport = useCallback(async () => {
      if (!studentData) return
      setLoading(true)
      setError(null)
      setReport(null)

      const result = await generateStudentReportJson(studentData, language)

      if (result.report) {
        setReport(result.report)
      } else {
        setError(result.error || t("An unknown error occurred while generating the report."))
      }
      setLoading(false)
    }, [studentData, language, t])

    useEffect(() => {
      fetchReport()
    }, [fetchReport])

    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t("AI Report is being generated...")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t("Please wait a moment.")}</p>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("Failed to Generate AI Report")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-6 w-6 text-destructive mr-4" />
            <p className="text-sm text-destructive">{t(error)}</p>
          </CardContent>
        </Card>
      )
    }

    if (!report) {
      return null
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              {t("AI-Powered Report Summary")}
            </CardTitle>
            <CardDescription>
              {t("This report was generated by AI based on the student's performance data.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("Regenerate Report")}
            </Button>
          </CardContent>
        </Card>

        <SectionCard
          icon={<FileText className="h-5 w-5" />}
          title={t(report.overallAssessment.title)}
          className="border-blue-200 dark:border-blue-800"
        >
          <p>{t(report.overallAssessment.content)}</p>
        </SectionCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard
            icon={<Sparkles className="h-5 w-5" />}
            title={t(report.strengths.title)}
            description={t(report.strengths.content)}
            className="border-green-200 dark:border-green-800"
          >
            <ul className="space-y-2">
              {report.strengths.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={<TrendingUp className="h-5 w-5" />}
            title={t(report.developmentSuggestions.title)}
            description={t(report.developmentSuggestions.content)}
            className="border-orange-200 dark:border-orange-800"
          >
            <ul className="space-y-2">
              {report.developmentSuggestions.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="mt-1 h-4 w-4 flex-shrink-0 text-orange-500" />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {report.actionPlan && (
          <SectionCard
            icon={<ListChecks className="h-5 w-5" />}
            title={t(report.actionPlan.title)}
            className="border-gray-200 dark:border-gray-800"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700">{t(report.actionPlan.short_term.title)}</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                  {report.actionPlan.short_term.items.map((item, index) => (
                    <li key={`st-${index}`}>{t(item)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700">{t(report.actionPlan.medium_term.title)}</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                  {report.actionPlan.medium_term.items.map((item, index) => (
                    <li key={`mt-${index}`}>{t(item)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700">{t(report.actionPlan.long_term.title)}</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                  {report.actionPlan.long_term.items.map((item, index) => (
                    <li key={`lt-${index}`}>{t(item)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard
          icon={<Gamepad2 className="h-5 w-5" />}
          title={t(report.recommendedGames.title)}
          description={t(report.recommendedGames.content)}
          className="border-purple-200 dark:border-purple-800"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {report.recommendedGames.games.map((game, index) => (
              <div key={index} className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
                <h4 className="font-semibold">{t(game.name)}</h4>
                <p className="text-muted-foreground">{t(game.reason)}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {report.futureProjection && (
          <SectionCard
            icon={<TrendingUp className="h-5 w-5" />}
            title={t(report.futureProjection.title)}
            className="border-yellow-200 dark:border-yellow-800"
          >
            <p>{t(report.futureProjection.content)}</p>
          </SectionCard>
        )}

        <SectionCard
          icon={<Award className="h-5 w-5" />}
          title={t(report.conclusion.title)}
          className="border-indigo-200 dark:border-indigo-800"
        >
          <p>{t(report.conclusion.content)}</p>
        </SectionCard>
      </div>
    )
}

const classAverages: { [key: string]: number } = {
  Math: 82,
  English: 80,
  Science: 78,
  History: 75,
  "Critical Thinking": 75,
  "Problem Solving": 78,
  "Reading Comprehension": 76,
  "Mathematical Reasoning": 74,
  "Scientific Inquiry": 72,
  "Historical Analysis": 70,
}

// --- ANA SAYFA BİLEŞENİ ---
export default function StudentProgressReport() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { toast } = useToast()
    const { translate: t, language } = useLanguage()
    const [activeTab, setActiveTab] = useState("overview")
    const [isExporting, setIsExporting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [studentData, setStudentData] = useState<Student | null>(null)
    const [gameDetails, setGameDetails] = useState<Record<number, GameTypeAlias>>({})
    const [gamePlays, setGamePlays] = useState<GamePlay[]>([])
    const [skills, setSkills] = useState<StudentSkill[]>([])
    const [subjectScores, setSubjectScores] = useState<StudentSubjectScore[]>([])
    const [actionPlans, setActionPlans] = useState<{ type: string; goal: string; status?: string }[]>([])
    const [strengthNames, setStrengthNames] = useState<string[]>([])
    const [developmentAreaNames, setDevelopmentAreaNames] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [allGames, setAllGames] = useState<Game[]>([])
    const reportRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchAllData() {
          if (!id) return
          try {
            setLoading(true)
            setError(null)
            const studentId = Number(id)
    
            const [
              studentRes,
              gamePlaysRes,
              skillsRes,
              subjectScoresRes,
              actionPlansRes,
              studentStrengthsRes,
              studentDevAreasRes,
              allStrengthsRes,
              allDevAreasRes,
              allGamesRes,
            ] = await Promise.all([
              getStudent(id),
              getStudentGamePlays(studentId).catch(() => []),
              getStudentSkills(studentId).catch(() => []),
              getStudentSubjectScores(studentId).catch(() => []),
              getStudentActionPlans(studentId).catch(() => []),
              getStudentStrengths(studentId).catch(() => []),
              getStudentDevelopmentAreas(studentId).catch(() => []),
              getStrengths().catch(() => []),
              getDevelopmentAreas().catch(() => []),
              getAllGames().catch(() => []),
            ])
    
            if (!studentRes) {
              toast({ title: t("Error"), description: t("Student not found"), variant: "destructive" })
              router.push("/students")
              return
            }
    
            const student = studentRes
            student.name = `${student.name || ""} ${student.surname || ""}`.trim()
            
            // Veri işleme kodunun geri kalanı aynı kalır...
    
            setStudentData(student)
            setGamePlays(gamePlaysRes)
            setSkills(skillsRes)
            setSubjectScores(subjectScoresRes)
            setActionPlans(actionPlansRes)
            setAllGames(allGamesRes)
            // ...
          } catch (err) {
            console.error("Error fetching student data:", err)
            const errorMessage = t("Failed to load student data. Please try again.")
            setError(errorMessage)
            toast({ title: t("Error"), description: errorMessage, variant: "destructive" })
          } finally {
            setLoading(false)
          }
        }
        fetchAllData()
    }, [id, router, toast, t])

    const studentDataForReport = useMemo((): StudentDataForReport | null => {
        if (!studentData) return null
        return {
          name: studentData.name || `${studentData.first_name || ""} ${studentData.last_name || ""}`.trim(),
          grade: studentData.grade,
          avg_score: studentData.avg_score,
          games_played: studentData.games_played,
          strengths: strengthNames,
          developmentAreas: developmentAreaNames,
          badges: studentData.badges || [],
          subjectScores: subjectScores.map((s) => ({
            subject: s.subject,
            score: s.score,
          })),
          gameScores: gamePlays.map((play) => ({
            game: gameDetails[play.game_id]?.game_name || `Game ID ${play.game_id}`,
            score: play.score,
            skills: skills.filter((skill) => skill.game_id === play.game_id).map((skill) => skill.skill),
          })),
          skills: skills.map((s) => ({ skill: s.skill, score: s.score })),
          allGames: allGames.map((g) => ({
            id: g.id,
            game_name: g.game_name,
            description: g.description,
          })),
        }
    }, [studentData, strengthNames, developmentAreaNames, gamePlays, skills, gameDetails, allGames, subjectScores])


    // --- GÜNCELLENMİŞ PDF DIŞA AKTARMA FONKSİYONU ---
    const handleExportReport = async () => {
        if (!reportRef.current) {
          toast({
            title: t("Error"),
            description: t("Could not find the report content to export."),
            variant: "destructive",
          })
          return
        }
    
        setIsExporting(true)
        toast({ title: t("Exporting Report"), description: t("The progress report is being exported as PDF.") })
    
        try {
            // Kütüphaneleri sadece bu fonksiyon çağrıldığında yükle
            const { default: jsPDF } = await import("jspdf");
            const { default: html2canvas } = await import("html2canvas");

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
            })
    
            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4",
            })
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgWidth = pdfWidth - 20;
            const imgHeight = imgWidth / ratio;
    
            let heightLeft = imgHeight;
            let position = 10;
    
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
    
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight + 10;
              pdf.addPage();
              pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
    
            pdf.save(`student-report-${studentData?.name.replace(/ /g, "_") || id}.pdf`)
    
            toast({
                title: t("Export Complete"),
                description: t("The progress report has been exported successfully."),
            })
        } catch (error) {
            console.error("Error exporting PDF:", error)
            toast({
                title: t("Export Failed"),
                description: t("An error occurred while exporting the report to PDF."),
                variant: "destructive",
            })
        } finally {
            setIsExporting(false)
        }
    }
    
    // Diğer yardımcı fonksiyonlar (handlePrintReport, handleShareReport, vs.) aynı kalır...
    const handleShareReport = () => {
      if (!id) return
      navigator.clipboard.writeText(`${window.location.origin}/students/${id}/progress-report`)
      toast({ title: t("Link Copied"), description: t("Progress report link copied to clipboard") })
    }
    const handlePrintReport = () => window.print();

    // Yükleme, hata ve öğrenci bulunamadı durumları için JSX render etme
    if (loading) {
      return (
        <div className="container mx-auto p-4 space-y-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{t("Loading student data...")}</p>
        </div>
      )
    }
  
    if (error) {
      return (
        <div className="container mx-auto p-4 space-y-6 text-center">
          <h2 className="text-xl font-bold">{t("Error")}</h2>
          <p className="mt-2">{error}</p>
          <Button className="mt-4" onClick={() => router.push("/students")}>
            {t("Back to Students")}
          </Button>
        </div>
      )
    }
  
    if (!studentData) {
      return (
        <div className="container mx-auto p-4 space-y-6 text-center">
            <h2 className="text-xl font-bold">{t("Student Not Found")}</h2>
            <p className="mt-2">{t("The requested student could not be found.")}</p>
            <Button className="mt-4" onClick={() => router.push("/students")}>
            {t("Back to Students")}
            </Button>
        </div>
      )
    }

    // --- ANA JSX ÇIKTISI ---
    return (
        <div ref={reportRef} className="container mx-auto p-4 space-y-6 print:p-0">
            {/* Header ve Öğrenci Bilgi Kartı (aynı kalır) */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
                <Button variant="outline" size="icon" asChild className="h-9 w-9 bg-transparent">
                <Link href={`/students/${id}/profile`}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">{t("Back to student profile")}</span>
                </Link>
                </Button>
                <div>
                <h1 className="text-2xl font-bold">{t("Student Progress Report")}</h1>
                <p className="text-sm text-muted-foreground">{t("Comprehensive assessment and improvement plan")}</p>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleShareReport}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {t("Share")}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="mr-2 h-4 w-4" />
                    {t("Print")}
                </Button>
                <Button size="sm" onClick={handleExportReport} disabled={isExporting}>
                    {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Download className="mr-2 h-4 w-4" />
                    )}
                    {isExporting ? t("Exporting...") : t("Export PDF")}
                </Button>
                </div>
            </div>
            
            {/* Diğer JSX bileşenleri aynı kalır... */}

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 print:hidden">
                    <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
                    <TabsTrigger value="subjects">{t("Subjects")}</TabsTrigger>
                    <TabsTrigger value="skills">{t("Skills")}</TabsTrigger>
                    <TabsTrigger value="games">{t("Games")}</TabsTrigger>
                    <TabsTrigger value="recommendations">{t("Recommendations")}</TabsTrigger>
                </TabsList>

                {/* --- DİNAMİK GRAFİKLERİ KULLANAN SEKMELER --- */}

                <TabsContent value="overview" className="space-y-6 mt-4">
                    <Card>
                        {/* ... Performans özeti kart içeriği... */}
                        {studentData.monthlyProgress && studentData.monthlyProgress.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium mb-4">{t("Performance Over Time")}</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <DynamicLineChart data={studentData.monthlyProgress}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="Math" stroke="#8884d8" name={t("Math")} />
                                            <Line type="monotone" dataKey="English" stroke="#82ca9d" name={t("English")} />
                                        </DynamicLineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="subjects" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("Subject Performance")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {subjectScores.length > 0 && (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <DynamicBarChart data={subjectScores.map(s => ({ subject: t(s.subject), "Student Score": s.score, "Class Average": classAverages[s.subject] || 0 }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="subject" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Student Score" fill="#8884d8" />
                                            <Bar dataKey="Class Average" fill="#82ca9d" />
                                        </DynamicBarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("Skills Assessment")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {id && <DynamicStudentSkillsRadar studentId={Number(id)} />}
                            {/* ...diğer yetenek içeriği... */}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="games" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("Game Performance")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {gamePlays.length > 0 && (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <DynamicBarChart data={gamePlays.map(p => ({ name: t(gameDetails[p.game_id]?.game_name || "Unknown"), score: p.score }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} unit="%" />
                                            <Tooltip formatter={(value: number) => `${value}%`} />
                                            <Legend />
                                            <Bar dataKey="score" fill="#8884d8" name={t("Score")} />
                                        </DynamicBarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6 mt-4">
                    {studentDataForReport && <AiReportSummary studentData={studentDataForReport} language={language} />}
                </TabsContent>
            </Tabs>
        </div>
    )
}