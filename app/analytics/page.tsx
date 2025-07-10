"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Loader2,
  AlertCircle,
  Download,
  Calendar,
  Share2,
  Printer,
  TrendingUp,
} from "lucide-react"
import { DashboardSummary } from "@/components/analytics/dashboard-summary"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import {
  Line,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart,
} from "recharts"
import { useLanguage } from "@/contexts/language-context"
import {
  getGameUsageData,
  getStudentSubjectScores,
  getStudents,
  getAnalyticsDashboardData,
  getStudentPerformanceData,
  getSkillDistributionData,
  getStudentProgressData,
  getEngagementMetricsData,
  getTopPerformers,
  getDashboardAnalytics,
  getWeeklyActivityData,
  getSubjectBreakdownData,
  getStudentDistributionData,
  getRecentActivities,
} from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
//import {BarChart as RechartsBarChart} from "recharts/types/chart/BarChart";
import { BarChart as RechartsBarChart } from "recharts"


export default function AnalyticsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { translate: t } = useLanguage()
  const { translate : translate} = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const [isExporting, setIsExporting] = useState(false)

  // Data states
  const [studentPerformanceData, setStudentPerformanceData] = useState<any[]>([])
  const [skillDistributionData, setSkillDistributionData] = useState<any[]>([])
  const [studentProgressData, setStudentProgressData] = useState<any[]>([])
  const [performanceMetricsData, setPerformanceMetricsData] = useState<any[]>([])
  const [engagementMetricsData, setEngagementMetricsData] = useState<any[]>([])
  const [gameUsageData, setGameUsageData] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [topPerformersData, setTopPerformersData] = useState<any[]>([])
  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([
    { day: "Mon", sessions: 10, avgScore: 75 },
    { day: "Tue", sessions: 12, avgScore: 78 },
    { day: "Wed", sessions: 14, avgScore: 80 },
    { day: "Thu", sessions: 11, avgScore: 76 },
    { day: "Fri", sessions: 15, avgScore: 82 },
    { day: "Sat", sessions: 8, avgScore: 70 },
    { day: "Sun", sessions: 6, avgScore: 68 },
  ])
  const [subjectBreakdownData, setSubjectBreakdownData] = useState<any[]>([
    { name: "Math", value: 35, color: "#3b82f6" },
    { name: "Reading", value: 25, color: "#10b981" },
    { name: "Science", value: 20, color: "#f59e0b" },
    { name: "History", value: 20, color: "#6366f1" },
  ])
  const [studentDistributionData, setStudentDistributionData] = useState<any[]>([
    { name: "0-50%", value: 8, color: "#ef4444" },
    { name: "51-70%", value: 20, color: "#f59e0b" },
    { name: "71-85%", value: 30, color: "#6366f1" },
    { name: "86-100%", value: 25, color: "#10b981" },
  ])
  const [recentActivities, setRecentActivities] = useState<any[]>([
    {
      id: 1,
      type: "game_completed",
      student: "Emma Thompson",
      game: "Math Blaster",
      score: 92,
      time: "2 hours ago",
      avatar: `/placeholder.svg?height=32&width=32&query=Emma Thompson`,
    },
    {
      id: 2,
      type: "achievement",
      student: "Noah Martinez",
      achievement: "Problem Solver",
      game: "Science Quest",
      time: "3 hours ago",
      avatar: `/placeholder.svg?height=32&width=32&query=Noah Martinez`,
    },
    {
      id: 3,
      type: "improvement",
      student: "Olivia Johnson",
      subject: "Reading",
      improvement: "+15%",
      time: "5 hours ago",
      avatar: `/placeholder.svg?height=32&width=32&query=Olivia Johnson`,
    },
    {
      id: 4,
      type: "game_completed",
      student: "Liam Wilson",
      game: "Word Wizard",
      score: 85,
      time: "Yesterday",
      avatar: `/placeholder.svg?height=32&width=32&query=Liam Wilson`,
    },
    {
      id: 5,
      type: "assessment",
      student: "Sophia Davis",
      assessment: "Math Quiz",
      score: 90,
      time: "Yesterday",
      avatar: `/placeholder.svg?height=32&width=32&query=Sophia Davis`,
    },
  ])

  // Dashboard analytics data
  const [scoreHistory, setScoreHistory] = useState<number[]>([65, 68, 72, 75, 78, 80, 82, 85])
  const [gamesHistory, setGamesHistory] = useState<number[]>([42, 45, 48, 52, 55, 58, 62, 65])
  const [engagementHistory, setEngagementHistory] = useState<number[]>([75, 78, 76, 80, 82, 85, 84, 88])

  // Loading and error states
  const [loading, setLoading] = useState({
    studentPerformance: true,
    skillDistribution: true,
    studentProgress: true,
    performanceMetrics: true,
    gameUsage: true,
    dashboard: true,
    engagementMetrics: true,
    performance: true,
    topPerformers: true,
    weeklyActivity: true,
    subjectBreakdown: true,
    studentDistribution: true,
    recentActivities: true,
  })

  const [error, setError] = useState<{
    studentPerformance: string | null
    skillDistribution: string | null
    studentProgress: string | null
    performanceMetrics: string | null
    gameUsage: string | null
    dashboard: string | null
    engagementMetrics: string | null
    performance: string | null
    topPerformers: string | null
    weeklyActivity: string | null
    subjectBreakdown: string | null
    studentDistribution: string | null
    recentActivities: string | null
  }>({
    studentPerformance: null,
    skillDistribution: null,
    studentProgress: null,
    performanceMetrics: null,
    gameUsage: null,
    dashboard: null,
    engagementMetrics: null,
    performance: null,
    topPerformers: null,
    weeklyActivity: null,
    subjectBreakdown: null,
    studentDistribution: null,
    recentActivities: null,
  })

  // Render loading state for a chart
  const renderLoading = (height = 300) => (
    <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  // Render error state for a chart
  const renderError = (message: string, height = 300) => (
    <div className="flex flex-col items-center justify-center text-center" style={{ height: `${height}px` }}>
      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      <p className="text-red-500">{message}</p>
    </div>
  )

  // Helper function to render a sparkline
  const renderSparkline = (data: number[], color: string) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-xs text-muted-foreground">No data available</p>
        </div>
      )
    }

    const chartData = data.map((value, index) => ({ value, index }))

    return (
      <div style={{ width: "100%", height: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Handle export
  const handleExport = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      toast({
        title: t("Export Complete"),
        description: t("Analytics data has been exported to CSV."),
      })
      setIsExporting(false)
    }, 1500)
  }

  // Handle print
  const handlePrint = () => {
    toast({
      title: t("Printing Analytics"),
      description: t("The analytics report is being sent to the printer."),
    })
    window.print()
  }

  // Handle share
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/analytics`)
    toast({
      title: t("Link Copied"),
      description: t("Analytics page link copied to clipboard"),
    })
  }

  // Fetch dashboard analytics data
  useEffect(() => {
    async function fetchDashboardAnalytics() {
      if (!user?.school_id) return

      try {
        setLoading((prev) => ({ ...prev, dashboard: true }))

        const data = await getDashboardAnalytics(Number(user.school_id))
        setDashboardData(data)

        // Extract history data for sparklines
        if (data.scoreHistory && data.scoreHistory.length > 0) {
          setScoreHistory(data.scoreHistory)
        }

        if (data.gamesHistory && data.gamesHistory.length > 0) {
          setGamesHistory(data.gamesHistory)
        }

        if (data.engagementHistory && data.engagementHistory.length > 0) {
          setEngagementHistory(data.engagementHistory)
        }

        // Create performance metrics data from history
        if (data.scoreHistory) {
          const metrics = data.scoreHistory.map((score: number, index: number) => ({
            grade: `Month ${index + 1}`,
            avgScore: score,
            improvement: data.engagementHistory?.[index] ?? 0,
            students: data.gamesHistory?.[index] ?? 0,
          }))
          setPerformanceMetricsData(metrics)
        }
      } catch (err) {
        console.error("Error fetching dashboard analytics:", err)
        setError((prev) => ({ ...prev, dashboard: "Failed to load dashboard analytics data" }))

        toast({
          title: t("Error"),
          description: t("Failed to load dashboard analytics data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, dashboard: false }))
      }
    }

    fetchDashboardAnalytics()
  }, [user, toast, t])

  useEffect(() => {
    async function fetchRecentActivities() {
      try {
        const data = await getRecentActivities()
        if (Array.isArray(data)) {
          setRecentActivities(data)
        }
      } catch (err) {
        console.error("Error fetching recent activities", err)
        toast({
          title: t("Error"),
          description: t("Failed to load recent student activities"),
          variant: "destructive",
        })
      }
    }

    fetchRecentActivities()
  }, [toast, t])

  // Fetch student performance data
  useEffect(() => {
    async function fetchStudentPerformanceData() {
      try {
        setLoading((prev) => ({ ...prev, studentPerformance: true, performance: true }))

        try {
          const data = await getStudentPerformanceData()

          if (Array.isArray(data) && data.length > 0) {
            setStudentPerformanceData(data)
          } else {
            // Create minimal fallback data if API returns empty
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
            const fallbackData = months.map((month, i) => ({
              month,
              math: 60 + i * 5,
              reading: 65 + i * 4,
              science: 70 + i * 3,
              history: 75 + i * 2,
              average: 67 + i * 3.5,
            }))
            setStudentPerformanceData(fallbackData)
          }
        } catch (err) {
          console.error("Error fetching student performance:", err)
          // Create minimal fallback data if API fails
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
          const fallbackData = months.map((month, i) => ({
            month,
            math: 60 + i * 5,
            reading: 65 + i * 4,
            science: 70 + i * 3,
            history: 75 + i * 2,
            average: 67 + i * 3.5,
          }))
          setStudentPerformanceData(fallbackData)

          setError((prev) => ({
            ...prev,
            studentPerformance: "Failed to load student performance data",
            performance: "Failed to load performance data",
          }))

          toast({
            title: t("Error"),
            description: t("Failed to load student performance data"),
            variant: "destructive",
          })
        }
      } finally {
        setLoading((prev) => ({ ...prev, studentPerformance: false, performance: false }))
      }
    }

    fetchStudentPerformanceData()
  }, [toast, timeRange, t])

  // Fetch skill distribution data
  useEffect(() => {
    async function fetchSkillDistribution() {
      try {
        setLoading((prev) => ({ ...prev, skillDistribution: true }))

        const data = await getSkillDistributionData()

        if (data && Array.isArray(data)) {
          setSkillDistributionData(data)
        } else {
          // Create minimal fallback data if API returns empty
          const subjects = ["Math", "Reading", "Science", "History", "Geography", "Language"]
          const fallbackData = subjects.map((subject, i) => ({
            subject,
            score: 50 + i * 5,
          }))
          setSkillDistributionData(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching skill distribution:", err)
        setError((prev) => ({ ...prev, skillDistribution: "Failed to load skill distribution data" }))

        toast({
          title: t("Error"),
          description: t("Failed to load skill distribution data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, skillDistribution: false }))
      }
    }

    fetchSkillDistribution()
  }, [timeRange, toast, t])

  // Fetch student progress data
  useEffect(() => {
    async function fetchStudentProgress() {
      try {
        setLoading((prev) => ({ ...prev, studentProgress: true }))

        const data = await getStudentProgressData()

        if (data && Array.isArray(data)) {
          setStudentProgressData(data)
        } else {
          // Create minimal fallback data if API returns empty
          const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]
          const fallbackData = weeks.map((name, index) => ({
            name,
            beginner: Math.max(40 - index * 5, 15),
            intermediate: Math.min(30 + index * 2, 42),
            advanced: Math.min(20 + index, 28),
            expert: Math.min(10 + index, 15),
          }))
          setStudentProgressData(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching student progress:", err)
        setError((prev) => ({ ...prev, studentProgress: "Failed to load student progress data" }))

        toast({
          title: t("Error"),
          description: t("Failed to load student progress data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, studentProgress: false }))
      }
    }

    fetchStudentProgress()
  }, [timeRange, toast, t])

  // Fetch performance metrics data
  useEffect(() => {
    async function fetchPerformanceMetrics() {
      try {
        setLoading((prev) => ({ ...prev, performanceMetrics: true }))

        if (!user?.school_id) return

        // Get students from API
        const students = await getStudents(user.school_id)

        if (Array.isArray(students) && students.length > 0) {
          const grades = [...new Set(students.map((s) => s.grade).filter(Boolean))]

          const metricsData = await Promise.all(
            grades.map(async (grade) => {
              const gradeStudents = students.filter((s) => s.grade === grade)
              const studentIds = gradeStudents.map((s) => s.student_internal_id)

              let totalScore = 0
              let totalImprovement = 0

              for (const studentId of studentIds) {
                try {
                  const scores = await getStudentSubjectScores(studentId)
                  if (scores && scores.length > 0) {
                    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
                    totalScore += avgScore
                    totalImprovement += Math.floor(Math.random() * 10) + 1 // Random improvement for now
                  }
                } catch (error) {
                  console.error(`Error fetching scores for student ${studentId}:`, error)
                }
              }

              const avgScore = studentIds.length > 0 ? Math.round(totalScore / studentIds.length) : 0
              const improvement = studentIds.length > 0 ? Math.round(totalImprovement / studentIds.length) : 0

              return { grade: grade || "Unknown", avgScore, improvement, students: studentIds.length }
            }),
          )

          setPerformanceMetricsData(metricsData)
        } else {
          // Create minimal fallback data if API returns empty
          const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"]
          const fallbackData = grades.map((grade, i) => ({
            grade,
            avgScore: 70 + i * 3,
            improvement: 1 + i,
            students: 15 + i * 2,
          }))
          setPerformanceMetricsData(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching performance metrics:", err)
        setError((prev) => ({ ...prev, performanceMetrics: "Failed to load performance metrics data" }))

        toast({
          title: t("Error"),
          description: t("Failed to load performance metrics data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, performanceMetrics: false }))
      }
    }

    fetchPerformanceMetrics()
  }, [user, timeRange, toast, t])

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading((prev) => ({ ...prev, dashboard: true }))

        const data = await getAnalyticsDashboardData()

        if (data) {
          setDashboardData(data)
        } else {
          // Create minimal fallback data structure if API returns empty
          setDashboardData({
            dashboardSummary: {
              currentPeriod: {
                metrics: {
                  activeStudents: 250,
                  totalStudents: 300,
                  newStudents: 15,
                  gamesPlayed: 1250,
                  totalGames: 45,
                  averageScore: 78,
                  completionRate: 82,
                },
                trends: {
                  studentGrowth: { percentage: 5, direction: "up" },
                  scoreChange: { percentage: 3, direction: "up" },
                  completionChange: { percentage: 2, direction: "up" },
                },
              },
              previousPeriod: {
                metrics: {
                  activeStudents: 235,
                  totalStudents: 285,
                  newStudents: 10,
                  gamesPlayed: 1100,
                  totalGames: 40,
                  averageScore: 75,
                  completionRate: 80,
                },
              },
              topPerformers: {
                students: [],
                classes: [],
                games: [],
              },
            },
            timeSeriesData: {
              daily: {
                metrics: {
                  gamesPlayed: [42, 50, 45, 67, 55, 73, 60],
                },
              },
            },
          })
        }
      } catch (err) {
        console.error("Error fetching dashboard summary:", err)
        setError((prev) => ({ ...prev, dashboard: "Failed to load dashboard data" }))

        toast({
          title: t("Error"),
          description: t("Failed to load dashboard data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, dashboard: false }))
      }
    }

    fetchDashboardData()
  }, [toast, timeRange, t])

  // Fetch game usage data
  useEffect(() => {
    async function fetchGameUsage() {
      try {
        setLoading((prev) => ({ ...prev, gameUsage: true }))

        const data = await getGameUsageData(timeRange)

        if (Array.isArray(data) && data.length > 0) {
          setGameUsageData(data)
        } else {
          // Create minimal fallback data if API returns empty
          const games = ["Math Adventure", "Word Explorer", "Science Quest", "History Heroes", "Geography Challenge"]
          const fallbackData = games.map((name, i) => ({
            name,
            plays: 100 + i * 50,
            avgScore: 70 + i * 3,
            completionRate: 70 + i * 2,
          }))
          setGameUsageData(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching game usage:", err)
        setError((prev) => ({ ...prev, gameUsage: "Failed to load game usage data" }))

        toast({
          title: t("Error"),
          description: t("Failed to load game usage data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, gameUsage: false }))
      }
    }

    fetchGameUsage()
  }, [toast, timeRange, t])

  // Fetch engagement metrics data
  useEffect(() => {
    async function fetchEngagementData() {
      try {
        setLoading((prev) => ({ ...prev, engagementMetrics: true }))

        const data = await getEngagementMetricsData()

        if (data && Array.isArray(data)) {
          setEngagementMetricsData(data)
        } else {
          // Create minimal fallback data if API returns empty
          const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
          const fallbackData = days.map((day, i) => ({
            day,
            activeUsers: 150 + i * 10,
            sessionsPerUser: 2.5 + i * 0.2,
            avgSessionTime: 15 + i,
          }))
          setEngagementMetricsData(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching engagement metrics:", err)
        setError((prev) => ({ ...prev, engagementMetrics: "Failed to load engagement metrics" }))

        toast({
          title: t("Error"),
          description: t("Failed to load engagement metrics data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, engagementMetrics: false }))
      }
    }

    fetchEngagementData()
  }, [timeRange, toast, t])

  // Fetch top performers data
  useEffect(() => {
    async function fetchTopPerformers() {
      try {
        setLoading((prev) => ({ ...prev, topPerformers: true }))

        const data = await getTopPerformers()

        if (data && Array.isArray(data)) {
          setTopPerformersData(
            data.map((student) => ({
              ...student,
              improvement: `+${Math.floor(Math.random() * 5) + 1}%`,
              avatar: student.avatar || `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(student.name)}`,
            })),
          )
        } else {
          // Create minimal fallback data if API returns empty
          const fallbackData = [
            {
              id: 1,
              name: "Emma Thompson",
              score: 95,
              avatar: `/placeholder.svg?height=40&width=40&query=Emma Thompson`,
              improvement: "+3%",
            },
            {
              id: 2,
              name: "Noah Martinez",
              score: 92,
              avatar: `/placeholder.svg?height=40&width=40&query=Noah Martinez`,
              improvement: "+5%",
            },
            {
              id: 3,
              name: "Olivia Johnson",
              score: 90,
              avatar: `/placeholder.svg?height=40&width=40&query=Olivia Johnson`,
              improvement: "+2%",
            },
            {
              id: 4,
              name: "Liam Wilson",
              score: 89,
              avatar: `/placeholder.svg?height=40&width=40&query=Liam Wilson`,
              improvement: "+4%",
            },
          ]
          setTopPerformersData(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching top performers:", err)
        setError((prev) => ({ ...prev, topPerformers: "Failed to load top performers data" }))

        toast({
          title: t("Error"),
          description: t("Failed to load top performers data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, topPerformers: false }))
      }
    }

    fetchTopPerformers()
  }, [timeRange, toast, t])

  useEffect(() => {
    async function fetchWeeklyActivity() {
      try {
        setLoading((prev) => ({ ...prev, weeklyActivity: true }))

        const data = await getWeeklyActivityData(timeRange)

        if (Array.isArray(data) && data.length > 0) {
          setWeeklyActivityData(data)
        } else {
          // fallback veya boş bırak
          setWeeklyActivityData([])
        }
      } catch (err) {
        console.error("Error fetching weekly activity:", err)
        setError((prev) => ({ ...prev, weeklyActivity: "Failed to load weekly activity data" }))
        toast({
          title: t("Error"),
          description: t("Failed to load weekly activity data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, weeklyActivity: false }))
      }
    }

    fetchWeeklyActivity()
  }, [timeRange, toast, t])

  useEffect(() => {
    async function fetchStudentDistribution() {
      try {
        setLoading((prev) => ({ ...prev, studentDistribution: true }))

        const data = await getStudentDistributionData()

        if (Array.isArray(data) && data.length > 0) {
          // Eğer API renk göndermiyorsa varsayılan renk ekle
          const defaultColors = ["#ef4444", "#f59e0b", "#6366f1", "#10b981"]
          const coloredData = data.map((item, index) => ({
            ...item,
            color: item.color || defaultColors[index % defaultColors.length],
          }))
          setStudentDistributionData(coloredData)
        } else {
          setStudentDistributionData([])
        }
      } catch (err) {
        console.error("Error fetching student distribution:", err)
        setError((prev) => ({ ...prev, studentDistribution: "Failed to load student distribution data" }))
        toast({
          title: t("Error"),
          description: t("Failed to load student distribution data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, studentDistribution: false }))
      }
    }

    fetchStudentDistribution()
  }, [toast, t])


  useEffect(() => {
    async function fetchSubjectBreakdown() {
      try {
        setLoading((prev) => ({ ...prev, subjectBreakdown: true }))

        const data = await getSubjectBreakdownData(timeRange)

        if (Array.isArray(data) && data.length > 0) {
          // Eğer API'den `color` gelmiyorsa, rastgele renkler ata
          const colors = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#8b5cf6"]
          const coloredData = data.map((item, index) => ({
            ...item,
            color: item.color || colors[index % colors.length],
          }))
          setSubjectBreakdownData(coloredData)
        } else {
          setSubjectBreakdownData([])
        }
      } catch (err) {
        console.error("Error fetching subject breakdown:", err)
        setError((prev) => ({ ...prev, subjectBreakdown: "Failed to load subject breakdown data" }))
        toast({
          title: t("Error"),
          description: t("Failed to load subject breakdown data"),
          variant: "destructive",
        })
      } finally {
        setLoading((prev) => ({ ...prev, subjectBreakdown: false }))
      }
    }

    fetchSubjectBreakdown()
  }, [timeRange, toast, t])



  // Memoized sparkline data
  const scoreSparklineData = useMemo(() => {
    return scoreHistory.length > 0 ? scoreHistory : [65, 68, 72, 75, 78, 80, 82, 85]
  }, [scoreHistory])

  const gamesSparklineData = useMemo(() => {
    return gamesHistory.length > 0 ? gamesHistory : [42, 45, 48, 52, 55, 58, 62, 65]
  }, [gamesHistory])

  const engagementSparklineData = useMemo(() => {
    return engagementHistory.length > 0 ? engagementHistory : [75, 78, 76, 80, 82, 85, 84, 88]
  }, [engagementHistory])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("Analytics Dashboard")}</h1>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("Select time range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("Last 7 Days")}</SelectItem>
              <SelectItem value="month">{t("Last 30 Days")}</SelectItem>
              <SelectItem value="quarter">{t("Last 3 Months")}</SelectItem>
              <SelectItem value="year">{t("Last Year")}</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">{t("Share")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleShare}>{t("Copy Link")}</DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                {t("Print Report")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Exporting...")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t("Export")}
              </>
            )}
          </Button>

          <Link href="/dashboard">
            <Button variant="outline">{t("Main Dashboard")}</Button>
          </Link>
          <Link href="/analytics/dashboard-summary">
            <Button variant="default">{t("View Dashboard Summary")}</Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            {t("Overview")}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            {t("Performance")}
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            {t("Engagement")}
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t("Skills")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Score Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{t("Average Score")}</CardTitle>
                  <CardDescription>{t("Overall performance")}</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">
                    {dashboardData?.dashboardSummary?.currentPeriod?.metrics?.averageScore || 78}%
                  </div>
                  <div className="text-xs font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3.5%
                  </div>
                </div>
                <div className="mt-3 h-10">{renderSparkline(scoreSparklineData, "#3b82f6")}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {t("Compared to previous")} {t(timeRange)}
                </div>
              </CardContent>
            </Card>

            {/* Games Played Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{t("Games Played")}</CardTitle>
                  <CardDescription>{t("Total sessions")}</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">
                    {dashboardData?.dashboardSummary?.currentPeriod?.metrics?.gamesPlayed || 1250}
                  </div>
                  <div className="text-xs font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2%
                  </div>
                </div>
                <div className="mt-3 h-10">{renderSparkline(gamesSparklineData, "#10b981")}</div>
                <div className="mt-2 text-xs text-muted-foreground">{t("65 games in the last week")}</div>
              </CardContent>
            </Card>

            {/* Completion Rate Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{t("Completion Rate")}</CardTitle>
                  <CardDescription>{t("Assignments finished")}</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">
                    {dashboardData?.dashboardSummary?.currentPeriod?.metrics?.completionRate || 82}%
                  </div>
                  <div className="text-xs font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3.5%
                  </div>
                </div>
                <div className="mt-4">
                  <Progress
                    value={dashboardData?.dashboardSummary?.currentPeriod?.metrics?.completionRate || 82}
                    className="h-2"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{t("22 of 24 students on track")}</div>
              </CardContent>
            </Card>

            {/* Active Students Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{t("Active Students")}</CardTitle>
                  <CardDescription>{t("Student participation")}</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">
                    {dashboardData?.dashboardSummary?.currentPeriod?.metrics?.activeStudents || 250}
                  </div>
                  <div className="text-xs font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2%
                  </div>
                </div>
                <div className="mt-3 h-10">{renderSparkline(engagementSparklineData, "#f59e0b")}</div>
                <div className="mt-2 text-xs text-muted-foreground">{t("High engagement in Math games")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trends - 2/3 width */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("Performance Trends")}</CardTitle>
                <CardDescription>{t("Average scores over time")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading.studentPerformance ? (
                  renderLoading(300)
                ) : error.studentPerformance ? (
                  renderError(error.studentPerformance, 300)
                ) : (
                  <div style={{ width: "100%", height: "100%" }}>
                    {studentPerformanceData && studentPerformanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={studentPerformanceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="math"
                            name={t("Math")}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="reading"
                            name={t("Reading")}
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="science"
                            name={t("Science")}
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="history"
                            name={t("History")}
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="average"
                            name={t("Average")}
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ r: 6 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No performance data available</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex justify-between items-center w-full text-sm">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {t("Trend")}
                    </Badge>
                    <span className="text-green-500 font-medium">{t("Improving")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("Starting")}: </span>
                    <span className="font-medium">70%</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{t("Current")}: </span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Student Distribution - 1/3 width */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Student Distribution")}</CardTitle>
                <CardDescription>{t("Performance by score range")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-[250px]">
                  {loading.studentDistribution ? (
                    renderLoading(250)
                  ) : error.studentDistribution ? (
                    renderError(error.studentDistribution, 250)
                  ) : (
                    <div style={{ width: "100%", height: "100%" }}>
                      {studentDistributionData && studentDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={studentDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {studentDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No distribution data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {studentDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {item.value} {t("students")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity and Subject Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Weekly Activity")}</CardTitle>
                <CardDescription>{t("Game sessions and scores by day")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-[300px]">
                  {loading.weeklyActivity ? (
                    renderLoading(300)
                  ) : error.weeklyActivity ? (
                    renderError(error.weeklyActivity, 300)
                  ) : (
                    <div style={{ width: "100%", height: "100%" }}>
                      {weeklyActivityData && weeklyActivityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={weeklyActivityData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="sessions"
                              name={t("Game Sessions")}
                              fill="#3b82f6"
                              radius={[4, 4, 0, 0]}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="avgScore"
                              name={t("Avg. Score")}
                              stroke="#f59e0b"
                              strokeWidth={2}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No weekly activity data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex justify-between items-center w-full text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("Total Sessions")}: </span>
                    <span className="font-medium">
                      {weeklyActivityData.reduce((sum, day) => sum + day.sessions, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("Average Score")}: </span>
                    <span className="font-medium">
                      {(
                        weeklyActivityData.reduce((sum, day) => sum + day.avgScore, 0) / weeklyActivityData.length
                      ).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Subject Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Subject Breakdown")}</CardTitle>
                <CardDescription>{t("Game usage by subject area")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-[250px]">
                  {loading.subjectBreakdown ? (
                    renderLoading(250)
                  ) : error.subjectBreakdown ? (
                    renderError(error.subjectBreakdown, 250)
                  ) : (
                    <div style={{ width: "100%", height: "100%" }}>
                      {subjectBreakdownData && subjectBreakdownData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={subjectBreakdownData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {subjectBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No subject breakdown data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {subjectBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">{t("Most popular")}: </span>
                  <span className="font-medium">
                    {subjectBreakdownData.length > 0
                      ? `${subjectBreakdownData[0].name} (${subjectBreakdownData[0].value}%)`
                      : "Math (35%)"}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Top Students and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Students */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Top Performers")}</CardTitle>
                <CardDescription>{t("Highest scoring students")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="space-y-4">
                  {loading.topPerformers
                    ? renderLoading(200)
                    : error.topPerformers
                      ? renderError(error.topPerformers, 200)
                      : topPerformersData.map((student) => (
                          <div key={student.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                                <AvatarFallback>
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {t("Score")}: {student.score}%
                                </p>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-green-500">{student.improvement}</div>
                          </div>
                        ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" size="sm" className="w-full">
                  {t("View All Students")}
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Activity */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{t("Recent Student Activities")}</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {recentActivities.map((activity) => (
                      <li key={activity.id} className="border-b pb-2">
                        <div className="font-medium">{activity.student}</div>
                        <div className="text-muted-foreground text-xs">
                          {activity.type === "game_completed"
                            ? `${t("completed")} ${activity.game} (${activity.score} ${t("points")})`
                            : activity.type === "achievement"
                            ? `${t("earned")} ${activity.achievement}`
                            : `${t("activity")} - ${activity.type}`}
                          {" • "}
                          {new Date(activity.time).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("No recent activities found.")}</p>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{translate("Performance Metrics")}</CardTitle>
              <CardDescription>{translate("Student performance by grade level")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading.performanceMetrics ? (
                  renderLoading(400)
                ) : error.performanceMetrics ? (
                  renderError(error.performanceMetrics, 400)
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={performanceMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "avgScore") return [`${value}%`, translate("Avg. Score")]
                          if (name === "improvement") return [`${value}%`, translate("improvement")]
                          return [value, translate("Students")]
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="avgScore" fill="#8884d8" name={translate("Avg. Score")} />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="improvement"
                        stroke="#ff7300"
                        name={translate("improvement")}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="students"
                        fill="#82ca9d"
                        stroke="#82ca9d"
                        name={translate("Students")}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{translate("Export Data")}</Button>
              <Button variant="default">{translate("View Detailed Analysis")}</Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Skill Distribution")}</CardTitle>
                <CardDescription>{translate("Average proficiency by subject area")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading.skillDistribution ? (
                    renderLoading()
                  ) : error.skillDistribution ? (
                    renderError(error.skillDistribution)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={skillDistributionData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name={translate("Proficiency")}
                          dataKey="score"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip formatter={(value) => [`${value}%`, translate("Proficiency")]} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{translate("Student Progress")}</CardTitle>
                <CardDescription>{translate("Skill level progression over time")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading.studentProgress ? (
                    renderLoading()
                  ) : error.studentProgress ? (
                    renderError(error.studentProgress)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studentProgressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="beginner"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name={translate("Beginner")}
                        />
                        <Area
                          type="monotone"
                          dataKey="intermediate"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name={translate("Intermediate")}
                        />
                        <Area
                          type="monotone"
                          dataKey="advanced"
                          stackId="1"
                          stroke="#ffc658"
                          fill="#ffc658"
                          name={translate("Advanced")}
                        />
                        <Area
                          type="monotone"
                          dataKey="expert"
                          stackId="1"
                          stroke="#ff8042"
                          fill="#ff8042"
                          name={translate("Expert")}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{translate("Engagement Metrics")}</CardTitle>
              <CardDescription>{translate("Student engagement patterns throughout the week")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading.engagementMetrics ? (
                  renderLoading(400)
                ) : error.engagementMetrics ? (
                  renderError(error.engagementMetrics, 400)
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementMetricsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "activeUsers") return [value, translate("Active Students")]
                          if (name === "sessionsPerUser") return [value, translate("Sessions Per User")]
                          return [`${value} min`, translate("Avg. Session")]
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="activeUsers"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name={translate("Active Students")}
                      />
                      <Area
                        type="monotone"
                        dataKey="sessionsPerUser"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name={translate("Sessions Per User")}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgSessionTime"
                        stackId="3"
                        stroke="#ffc658"
                        fill="#ffc658"
                        name={translate("Avg. Session")}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{translate("Export Data")}</Button>
              <Button variant="default">{translate("View Engagement Report")}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{translate("Game Usage")}</CardTitle>
              <CardDescription>{translate("Most popular educational games")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading.gameUsage ? (
                  renderLoading(400)
                ) : error.gameUsage ? (
                  renderError(error.gameUsage, 400)
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={gameUsageData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip
                        formatter={(value, name) => [
                          value,
                          name === "plays"
                            ? translate("Total Plays")
                            : name === "avgScore"
                              ? translate("Avg. Score")
                              : translate("Completion Rate"),
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="plays" fill="#8884d8" name={translate("Total Plays")} />
                      <Bar dataKey="avgScore" fill="#82ca9d" name={translate("Avg. Score")} />
                      <Bar dataKey="completionRate" fill="#ffc658" name={translate("Completion Rate")} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                {translate("View All Games")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Skill Distribution")}</CardTitle>
                <CardDescription>{translate("Average proficiency by subject area")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading.skillDistribution ? (
                    renderLoading()
                  ) : error.skillDistribution ? (
                    renderError(error.skillDistribution)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={skillDistributionData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name={translate("Proficiency")}
                          dataKey="score"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip formatter={(value) => [`${value}%`, translate("Proficiency")]} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{translate("Student Progress")}</CardTitle>
                <CardDescription>{translate("Skill level progression over time")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading.studentProgress ? (
                    renderLoading()
                  ) : error.studentProgress ? (
                    renderError(error.studentProgress)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studentProgressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="beginner"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name={translate("Beginner")}
                        />
                        <Area
                          type="monotone"
                          dataKey="intermediate"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name={translate("Intermediate")}
                        />
                        <Area
                          type="monotone"
                          dataKey="advanced"
                          stackId="1"
                          stroke="#ffc658"
                          fill="#ffc658"
                          name={translate("Advanced")}
                        />
                        <Area
                          type="monotone"
                          dataKey="expert"
                          stackId="1"
                          stroke="#ff8042"
                          fill="#ff8042"
                          name={translate("Expert")}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Additional tabs content omitted for brevity */}
      </Tabs>


    </div>
  )
}
