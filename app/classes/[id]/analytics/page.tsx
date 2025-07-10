"use client"

import { useState, useEffect } from "react"
import { useRouter,useParams } from "next/navigation"
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
import { PerformanceChart } from "@/components/performance-chart"
import { GameUsageChart } from "@/components/game-usage-chart"
import { SkillProgressChart } from "@/components/skill-progress-chart"
import { SubjectPerformanceChart } from "@/components/subject-performance-chart"
import { LearningGrowthChart } from "@/components/learning-growth-chart"
import { GameCompletionChart } from "@/components/game-completion-chart"
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

// Sample data - in a real app, this would come from an API based on the ID
const classData = {
  id: 1,
  name: "3A",
  teacher: "Ms. Johnson",
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
}

// Sample data for subject performance
const subjectPerformanceData = [
  { subject: "Math", score: 85, classAverage: 78 },
  { subject: "Science", score: 82, classAverage: 75 },
  { subject: "Reading", score: 88, classAverage: 80 },
  { subject: "Writing", score: 79, classAverage: 72 },
  { subject: "Social Studies", score: 81, classAverage: 76 },
]

// Sample data for learning growth
const learningGrowthData = [
  { month: "Sep", score: 70 },
  { month: "Oct", score: 72 },
  { month: "Nov", score: 75 },
  { month: "Dec", score: 78 },
  { month: "Jan", score: 82 },
  { month: "Feb", score: 85 },
]

// Sample data for game completion
const gameCompletionData = [
  { name: "Math Blaster", score: 85, plays: 12, completionRate: 95, avgTime: "5:30", achievements: 8 },
  { name: "Word Wizard", score: 78, plays: 10, completionRate: 90, avgTime: "4:45", achievements: 6 },
  { name: "Science Quest", score: 82, plays: 8, completionRate: 85, avgTime: "6:15", achievements: 7 },
  { name: "History Explorer", score: 75, plays: 6, completionRate: 80, avgTime: "5:00", achievements: 5 },
  { name: "Coding Adventure", score: 88, plays: 9, completionRate: 92, avgTime: "7:30", achievements: 9 },
]

// Sample data for skill radar
const skillRadarData = {
  "Critical Thinking": 85,
  "Problem Solving": 82,
  Reading: 78,
  Writing: 75,
  Math: 88,
  Science: 80,
}

// Sample data for student performance distribution
const studentDistributionData = [
  { name: "90-100%", value: 5, color: "#10b981" },
  { name: "80-89%", value: 8, color: "#3b82f6" },
  { name: "70-79%", value: 6, color: "#6366f1" },
  { name: "60-69%", value: 3, color: "#f59e0b" },
  { name: "Below 60%", value: 2, color: "#ef4444" },
]

// Sample data for weekly activity
const weeklyActivityData = [
  { day: "Mon", sessions: 45, avgScore: 82 },
  { day: "Tue", sessions: 52, avgScore: 85 },
  { day: "Wed", sessions: 38, avgScore: 79 },
  { day: "Thu", sessions: 65, avgScore: 88 },
  { day: "Fri", sessions: 48, avgScore: 84 },
]

// Sample data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "game_completed",
    student: "Emma Thompson",
    game: "Math Blaster",
    score: 92,
    time: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    type: "achievement",
    student: "Noah Martinez",
    achievement: "Problem Solver",
    game: "Science Quest",
    time: "3 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    type: "improvement",
    student: "Olivia Johnson",
    subject: "Reading",
    improvement: "+15%",
    time: "5 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    type: "game_completed",
    student: "Liam Wilson",
    game: "Word Wizard",
    score: 85,
    time: "Yesterday",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 5,
    type: "assessment",
    student: "Sophia Davis",
    assessment: "Math Quiz",
    score: 90,
    time: "Yesterday",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

// Sample data for top students
const topStudents = [
  { id: 1, name: "Emma Thompson", score: 95, avatar: "/placeholder.svg?height=40&width=40", improvement: "+3%" },
  { id: 2, name: "Noah Martinez", score: 92, avatar: "/placeholder.svg?height=40&width=40", improvement: "+5%" },
  { id: 3, name: "Olivia Johnson", score: 90, avatar: "/placeholder.svg?height=40&width=40", improvement: "+2%" },
  { id: 4, name: "Liam Wilson", score: 89, avatar: "/placeholder.svg?height=40&width=40", improvement: "+4%" },
]

// Sample data for subject breakdown
const subjectBreakdownData = [
  { name: "Math", value: 35, color: "#3b82f6" },
  { name: "Science", value: 25, color: "#10b981" },
  { name: "Reading", value: 20, color: "#f59e0b" },
  { name: "Writing", value: 15, color: "#6366f1" },
  { name: "Social Studies", value: 5, color: "#ec4899" },
]

// Sample data for sparklines
const scoreSparklineData = [65, 68, 72, 75, 78, 80, 82, 85]
const gamesSparklineData = [42, 45, 48, 52, 55, 58, 62, 65]
const engagementSparklineData = [75, 78, 76, 80, 82, 85, 84, 88]

export default function ClassAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const {id} = useParams()
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleExport = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Analytics data for Class ${classData.name} has been exported.`,
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
    navigator.clipboard.writeText(`${window.location.origin}/classes/${id}/analytics`)
    toast({
      title: "Link Copied",
      description: "Analytics page link copied to clipboard",
    })
  }

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href={`/classes/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to class details</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Class Analytics: {classData.name}</h1>
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
                    className={`text-xs font-medium ${classData.trendDirection === "up" ? "text-green-500" : "text-red-500"} flex items-center`}
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
                <div className="mt-2 text-xs text-muted-foreground">22 of 24 students on track</div>
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
                    <LineChart data={learningGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                    <span className="font-medium">85%</span>
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
                </div>
                <div className="mt-4 space-y-2">
                  {studentDistributionData.map((item) => (
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

          {/* Weekly Activity and Subject Breakdown */}
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
                    <BarChart data={weeklyActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
              <CardFooter className="border-t px-6 py-4">
                <div className="flex justify-between items-center w-full text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Sessions: </span>
                    <span className="font-medium">248</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average Score: </span>
                    <span className="font-medium">83.6%</span>
                  </div>
                </div>
              </CardFooter>
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
                  <span className="text-muted-foreground">Most popular: </span>
                  <span className="font-medium">Math (35%)</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Top Students and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Students */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest scoring students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
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
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" size="sm" className="w-full">
                  View All Students
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest student interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar} alt={activity.student} />
                        <AvatarFallback>
                          {activity.student
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{activity.student}</p>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        {activity.type === "game_completed" && (
                          <p className="text-xs">
                            Completed <span className="font-medium">{activity.game}</span> with a score of{" "}
                            <span className="font-medium">{activity.score}%</span>
                          </p>
                        )}
                        {activity.type === "achievement" && (
                          <p className="text-xs">
                            Earned <span className="font-medium">{activity.achievement}</span> achievement in{" "}
                            <span className="font-medium">{activity.game}</span>
                          </p>
                        )}
                        {activity.type === "improvement" && (
                          <p className="text-xs">
                            Improved <span className="font-medium">{activity.subject}</span> score by{" "}
                            <span className="font-medium text-green-500">{activity.improvement}</span>
                          </p>
                        )}
                        {activity.type === "assessment" && (
                          <p className="text-xs">
                            Completed <span className="font-medium">{activity.assessment}</span> with a score of{" "}
                            <span className="font-medium">{activity.score}%</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Performance breakdown by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <SubjectPerformanceChart data={subjectPerformanceData} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Development</CardTitle>
                <CardDescription>Progress in key skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SkillProgressChart />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Pace</CardTitle>
                <CardDescription>Speed of progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LearningGrowthChart data={learningGrowthData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Usage</CardTitle>
              <CardDescription>Most played games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <GameCompletionChart data={gameCompletionData} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
                <CardDescription>Average scores by game</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <GameCompletionChart data={gameCompletionData} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Spent</CardTitle>
                <CardDescription>Average time per game session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <GameUsageChart height={300} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Individual student rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <PerformanceChart title="" description="" timeRange={timeRange} classId={id} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Levels</CardTitle>
                <CardDescription>Student participation rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <GameUsageChart height={300} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Trends</CardTitle>
                <CardDescription>Progress over time by student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LearningGrowthChart data={learningGrowthData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
