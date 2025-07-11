"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Calendar,
  Loader2,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Award,
  Activity,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  getStudentsByClassId,
  getTeachers,
  getClass,
  getClassGameUsage,
  getClassSubjectPerformance,
  getClassLearningGrowth,
  getClassWeeklyActivity,
  getClassDistribution,
  getClassSubjectBreakdown,
  getClassTopPerformers,
} from "@/lib/api"
import GameUsageChart from "@/components/game-usage-chart" // Assuming this component exists
import { useAuth } from "@/contexts/auth-context" // Import useAuth hook from contexts
import { useLanguage } from "@/contexts/language-context" // Import useLanguage hook from contexts
import RecentActivityComponent from "@/components/recent-activity" // Import the new RecentActivityComponent

interface PageProps {
  params: Promise<{ id: string }>
}

interface ClassData {
  class_id: string
  class_name: string
  teacher_id: string
  teacher: string
  students: number
  avgScore: number
  gamesPlayed: number
  lastActive: string
  status: string
  trend: string
  trendDirection: "up" | "down"
  completionRate: number
  attendanceRate: number
  engagementScore: number
}

// Sample data for fallback
const defaultSubjectPerformanceData = [
  { subject: "Math", score: 85, classAverage: 78 },
  { subject: "Science", score: 82, classAverage: 75 },
  { subject: "Reading", score: 88, classAverage: 80 },
  { subject: "Writing", score: 79, classAverage: 72 },
  { subject: "Social Studies", score: 81, classAverage: 76 },
]

const defaultLearningGrowthData = [
  { month: "Sep", score: 70 },
  { month: "Oct", score: 72 },
  { month: "Nov", score: 75 },
  { month: "Dec", score: 78 },
  { month: "Jan", score: 82 },
  { month: "Feb", score: 85 },
]

const defaultStudentDistributionData = [
  { name: "90-100%", value: 5, color: "#10b981" },
  { name: "80-89%", value: 8, color: "#3b82f6" },
  { name: "70-79%", value: 6, color: "#6366f1" },
  { name: "60-69%", value: 3, color: "#f59e0b" },
  { name: "Below 60%", value: 2, color: "#ef4444" },
]

const defaultWeeklyActivityData = [
  { day: "Mon", sessions: 45, avgScore: 82 },
  { day: "Tue", sessions: 52, avgScore: 85 },
  { day: "Wed", sessions: 38, avgScore: 79 },
  { day: "Thu", sessions: 65, avgScore: 88 },
  { day: "Fri", sessions: 48, avgScore: 84 },
]

const defaultSubjectBreakdownData = [
  { name: "Math", value: 35, color: "#3b82f6" },
  { name: "Science", value: 25, color: "#10b981" },
  { name: "Reading", value: 20, color: "#f59e0b" },
  { name: "Writing", value: 15, color: "#6366f1" },
  { name: "Social Studies", value: 5, color: "#ec4899" },
]

const defaultTopStudents = [
  { id: 1, name: "Emma Thompson", score: 95, avatar: "/placeholder.svg?height=40&width=40", improvement: "+3%" },
  { id: 2, name: "Noah Martinez", score: 92, avatar: "/placeholder.svg?height=40&width=40", improvement: "+5%" },
  { id: 3, name: "Olivia Johnson", score: 90, avatar: "/placeholder.svg?height=40&width=40", improvement: "+2%" },
  { id: 4, name: "Liam Wilson", score: 89, avatar: "/placeholder.svg?height=40&width=40", improvement: "+4%" },
]

const defaultGameUsageData = [
  { game: "Math Blaster", plays: 150 },
  { game: "Word Wizard", plays: 120 },
  { game: "Science Quest", plays: 100 },
  { game: "History Explorer", plays: 80 },
  { game: "Coding Adventure", plays: 90 },
]

export default function ClassAnalyticsPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const [classId, setClassId] = useState<string | null>(null)
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [gameUsageData, setGameUsageData] = useState<any[]>(defaultGameUsageData)

  const { user } = useAuth()
  const { translate: t } = useLanguage()
  const currentSchoolId = user?.school_id

  // Get the ID from params
  useEffect(() => {
    async function getParams() {
      try {
        const resolvedParams = await params
        if (resolvedParams && resolvedParams.id) {
          setClassId(resolvedParams.id)
        } else {
          toast({ title: "Error", description: "Class ID not found in URL.", variant: "destructive" })
          router.push("/classes")
        }
      } catch (err) {
        console.error("Failed to resolve params:", err)
        toast({ title: "Error", description: "Could not load page parameters.", variant: "destructive" })
        router.push("/classes")
      }
    }
    getParams()
  }, [params, router, toast])

  // Fetch data when classId is available
  useEffect(() => {
    if (!classId || !currentSchoolId) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch class data, teachers, and students
        const [fetchedClass, allTeachers] = await Promise.all([
          getClass(classId), // Use specific getClass function
          getTeachers(), // Use specific getTeachers function
        ])

        // Fetch students for this class
        const students = await getStudentsByClassId(Number(classId), Number(currentSchoolId))

        // Find the teacher name
        const teacher = allTeachers.find((t) => t.teacher_id === fetchedClass.teacher_id)
        const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}`.trim() : "Unknown Teacher"

        // Calculate metrics from student data
        const avgScore =
          students.length > 0 ? students.reduce((sum, s) => sum + (s.avg_score || 0), 0) / students.length : 0

        const totalGamesPlayed = students.reduce((sum, s) => sum + (s.games_played || 0), 0)

        // Transform the API response to match our ClassData interface
        const transformedClassData: ClassData = {
          class_id: fetchedClass.class_id || classId,
          class_name: fetchedClass.class_name || fetchedClass.name || "Unknown Class",
          teacher_id: fetchedClass.teacher_id || "",
          teacher: teacherName,
          students: students.length,
          avgScore: Math.round(avgScore),
          gamesPlayed: totalGamesPlayed,
          lastActive: fetchedClass.lastActive || fetchedClass.last_active || "Unknown",
          status: fetchedClass.status || "active",
          trend: "+2.5%", // Default trend
          trendDirection: "up",
          completionRate: Math.min(90, Math.round(avgScore * 0.9)), // Estimate based on avgScore
          attendanceRate: 92, // Default value
          engagementScore: Math.min(95, Math.round(avgScore * 1.1)), // Estimate based on avgScore
        }

        setClassData(transformedClassData)

        // Fetch all analytics data concurrently
        const [
          subjectPerformance,
          learningGrowth,
          studentDistribution,
          weeklyActivity,
          subjectBreakdown,
          topStudents,
          gameUsage,
        ] = await Promise.all([
          getClassSubjectPerformance(Number(classId), Number(currentSchoolId)).catch((e) => {
            console.warn("Subject performance data not available, using defaults:", e)
            return defaultSubjectPerformanceData
          }),
          getClassLearningGrowth(Number(classId), timeRange, Number(currentSchoolId)).catch((e) => {
            console.warn("Learning growth data not available, using defaults:", e)
            return defaultLearningGrowthData
          }),
          getClassDistribution(Number(classId), Number(currentSchoolId)).catch((e) => {
            console.warn("Student distribution data not available, using defaults:", e)
            return defaultStudentDistributionData
          }),
          getClassWeeklyActivity(Number(classId), Number(currentSchoolId)).catch((e) => {
            console.warn("Weekly activity data not available, using defaults:", e)
            return defaultWeeklyActivityData
          }),
          getClassSubjectBreakdown(Number(classId), Number(currentSchoolId)).catch((e) => {
            console.warn("Subject breakdown data not available, using defaults:", e)
            return defaultSubjectBreakdownData
          }),
          getClassTopPerformers(Number(classId), Number(currentSchoolId)).catch((e) => {
            console.warn("Top students data not available, using defaults:", e)
            return defaultTopStudents
          }),
          getClassGameUsage(Number(classId), Number(currentSchoolId)).catch((e) => {
            console.warn("Game usage data not available, using defaults:", e)
            return defaultGameUsageData
          }),
        ])

        setAnalyticsData({
          subjectPerformance,
          learningGrowth,
          studentDistribution,
          weeklyActivity,
          subjectBreakdown,
          topStudents,
        })
        setGameUsageData(gameUsage)
      } catch (error) {
        console.error("Failed to fetch class data:", error)
        toast({
          title: "Error Loading Data",
          description: "Could not retrieve data for this class. Using sample data.",
          variant: "destructive",
        })

        // Set fallback class data
        setClassData({
          class_id: classId,
          class_name: `Class ${classId}`,
          teacher_id: "unknown",
          teacher: "Unknown Teacher",
          students: 24,
          avgScore: 85,
          gamesPlayed: 520,
          lastActive: "Today, 11:30 AM",
          status: "active",
          trend: "+2.5%",
          trendDirection: "up",
          completionRate: 78,
          attendanceRate: 92,
          engagementScore: 88,
        })

        setAnalyticsData({
          subjectPerformance: defaultSubjectPerformanceData,
          learningGrowth: defaultLearningGrowthData,
          studentDistribution: defaultStudentDistributionData,
          weeklyActivity: defaultWeeklyActivityData,
          subjectBreakdown: defaultSubjectBreakdownData,
          topStudents: defaultTopStudents,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [classId, timeRange, currentSchoolId, toast])

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Analytics data for ${classData?.class_name} has been exported.`,
      })
      setIsExporting(false)
    }, 1500)
  }

  const handlePrint = () => {
    toast({
      title: "Printing Analytics",
      description: "The analytics report is being sent to the printer.",
    })
    window.print()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/classes/${classId}/analytics`)
    toast({
      title: "Link Copied",
      description: "Analytics page link copied to clipboard",
    })
  }

  // Helper function to render a sparkline
  const renderSparkline = (data: number[], color: string) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data.map((value, index) => ({ value, index }))}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Class Not Found</h2>
          <p className="mt-2">Unable to load class information.</p>
          <Button className="mt-4" onClick={() => router.push("/classes")}>
            Go Back to Classes
          </Button>
        </div>
      </div>
    )
  }

  const scoreSparklineData = [65, 68, 72, 75, 78, 80, 82, classData.avgScore]
  const gamesSparklineData = [42, 45, 48, 52, 55, 58, 62, Math.floor(classData.gamesPlayed / 10)]
  const engagementSparklineData = [75, 78, 76, 80, 82, 85, 84, classData.engagementScore]

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9 bg-transparent">
          <Link href={`/classes/${classId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to class details</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Class Analytics: {classData.class_name}</h1>
          <p className="text-sm text-muted-foreground">
            Teacher: {classData.teacher} • {classData.students} Students • Last active: {classData.lastActive}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleShare}>Copy Link</DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Score Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <CardDescription>Overall performance</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">{classData.avgScore}%</div>
                  <div
                    className={`text-xs font-medium ${
                      classData.trendDirection === "up" ? "text-green-500" : "text-red-500"
                    } flex items-center`}
                  >
                    {classData.trendDirection === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {classData.trend}
                  </div>
                </div>
                <div className="mt-3 h-10">{renderSparkline(scoreSparklineData, "#3b82f6")}</div>
                <div className="mt-2 text-xs text-muted-foreground">Compared to previous {timeRange}</div>
              </CardContent>
            </Card>

            {/* Games Played Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                  <CardDescription>Total sessions</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">{classData.gamesPlayed}</div>
                  <div className="text-xs font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2%
                  </div>
                </div>
                <div className="mt-3 h-10">{renderSparkline(gamesSparklineData, "#10b981")}</div>
                <div className="mt-2 text-xs text-muted-foreground">65 games in the last week</div>
              </CardContent>
            </Card>

            {/* Completion Rate Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CardDescription>Assignments finished</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">{classData.completionRate}%</div>
                  <div className="text-xs font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3.5%
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={classData.completionRate} className="h-2" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {Math.floor((classData.completionRate / 100) * classData.students)} of {classData.students} students
                  on track
                </div>
              </CardContent>
            </Card>

            {/* Engagement Score Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                  <CardDescription>Student participation</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">{classData.engagementScore}</div>
                  <div className="text-xs font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2%
                  </div>
                </div>
                <div className="mt-3 h-10">{renderSparkline(engagementSparklineData, "#f59e0b")}</div>
                <div className="mt-2 text-xs text-muted-foreground">High engagement in Math games</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trends - 2/3 width */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Class average scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData?.learningGrowth || defaultLearningGrowthData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Average Score"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex justify-between items-center w-full text-sm">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      Trend
                    </Badge>
                    <span className="text-green-500 font-medium">Improving</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Starting: </span>
                    <span className="font-medium">70%</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-medium">{classData.avgScore}%</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Student Distribution - 1/3 width */}
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>Performance by score range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData?.studentDistribution || defaultStudentDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {(analyticsData?.studentDistribution || defaultStudentDistributionData).map(
                          (entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {(analyticsData?.studentDistribution || defaultStudentDistributionData).map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value} students</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Component */}
          {classId && <RecentActivityComponent classId={classId} />}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Performance breakdown by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData?.subjectPerformance || defaultSubjectPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Class Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="classAverage" name="School Average" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Game sessions and scores by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={defaultWeeklyActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="sessions"
                        name="Game Sessions"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgScore"
                        name="Avg. Score"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Subject Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Breakdown</CardTitle>
                <CardDescription>Game usage by subject area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={defaultSubjectBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {defaultSubjectBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Usage</CardTitle>
                <CardDescription>Most played games in this class</CardDescription>
              </CardHeader>
              <CardContent>
                <GameUsageChart data={gameUsageData} height={400} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
                <CardDescription>Average scores by game</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={gameUsageData.map((game) => ({ ...game, avgScore: Math.floor(Math.random() * 20) + 75 }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="game" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avgScore" name="Average Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Individual student rankings and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData?.topStudents || defaultTopStudents).map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">Score: {student.score}%</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-500">{student.improvement}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Overview</CardTitle>
              <CardDescription>Summary statistics for this class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{classData.students}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{classData.avgScore}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{classData.gamesPlayed}</div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
