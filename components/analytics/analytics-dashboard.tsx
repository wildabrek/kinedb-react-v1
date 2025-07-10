"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { BarChart3, Users, Gamepad2, BookOpen, Download, RefreshCw } from "lucide-react"
import { formatNumber, formatPercentageChange, generateColorPalette } from "@/utils/chart-utils"

type TimeRange = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"

interface AnalyticsDashboardProps {
  data: any
  timeRange?: TimeRange
}

export function AnalyticsDashboard({ data, timeRange = "monthly" }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRange)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  const COLORS = generateColorPalette(10)

  // Extract data for charts based on time range
  let timeLabels: string[] = []
  if (selectedTimeRange === "daily") {
    timeLabels = data.timeSeriesData.daily.dates || []
  } else if (selectedTimeRange === "weekly") {
    timeLabels = data.timeSeriesData.weekly.weeks || []
  } else if (selectedTimeRange === "monthly") {
    timeLabels = data.timeSeriesData.monthly.months || []
  } else if (selectedTimeRange === "quarterly") {
    timeLabels = data.timeSeriesData.quarterly.quarters || []
  } else {
    timeLabels = data.timeSeriesData.yearly.years || []
  }

  const performanceMetrics = data.timeSeriesData[selectedTimeRange]?.metrics || {}

  const chartData = timeLabels.map((label, index) => ({
    name: label,
    score: performanceMetrics.averageScores ? performanceMetrics.averageScores[index] : 0,
    active: performanceMetrics.activeUsers ? performanceMetrics.activeUsers[index] : 0,
    games: performanceMetrics.gamesPlayed ? performanceMetrics.gamesPlayed[index] : 0,
  }))

  const subjectPerformanceData = data.studentAnalytics.detailedMetrics.bySubject.map((subject) => ({
    subject: subject.subject,
    score: subject.avgScore,
    fullMark: 100,
  }))

  const studentDistributionData = [
    { name: "90-100", value: data.studentAnalytics.overview.performanceDistribution["90-100"] },
    { name: "80-89", value: data.studentAnalytics.overview.performanceDistribution["80-89"] },
    { name: "70-79", value: data.studentAnalytics.overview.performanceDistribution["70-79"] },
    { name: "60-69", value: data.studentAnalytics.overview.performanceDistribution["60-69"] },
    { name: "Below 60", value: data.studentAnalytics.overview.performanceDistribution.below60 },
  ]

  const handleTimeRangeChange = (value: string) => {
    setIsLoading(true)
    setSelectedTimeRange(value as TimeRange)

    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  const handleRefresh = () => {
    setIsLoading(true)

    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Last 24 hours</SelectItem>
              <SelectItem value="weekly">Last 7 days</SelectItem>
              <SelectItem value="monthly">Last 30 days</SelectItem>
              <SelectItem value="quarterly">Last 90 days</SelectItem>
              <SelectItem value="yearly">Last 365 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <CardDescription>All students</CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.dashboardSummary.currentPeriod.metrics.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(data.dashboardSummary.currentPeriod.trends.scoreChange.percentage)} from last
                  month
                </p>
                <div className="mt-4 h-[80px]">
                  {isLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.slice(-5)}>
                        <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
                        <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <CardDescription>Student engagement</CardDescription>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.dashboardSummary.currentPeriod.metrics.activeStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(data.dashboardSummary.currentPeriod.trends.studentGrowth.percentage)} from
                  last month
                </p>
                <div className="mt-4 h-[80px]">
                  {isLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.slice(-5)}>
                        <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        <Tooltip formatter={(value) => [value, "Active Students"]} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                  <CardDescription>Total sessions</CardDescription>
                </div>
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.dashboardSummary.currentPeriod.metrics.gamesPlayed)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(data.dashboardSummary.currentPeriod.trends.engagementChange.percentage)} from
                  last month
                </p>
                <div className="mt-4 h-[80px]">
                  {isLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.slice(-5)}>
                        <Bar dataKey="games" fill="#f59e0b" />
                        <Tooltip formatter={(value) => [value, "Games Played"]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CardDescription>Games finished</CardDescription>
                </div>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.dashboardSummary.currentPeriod.metrics.completionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentageChange(data.dashboardSummary.currentPeriod.trends.completionChange.percentage)} from
                  last month
                </p>
                <div className="mt-4 h-[80px]">
                  {isLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.slice(-5)}>
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                        <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Student performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Average Score"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Performance across all subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectPerformanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Performance" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>Distribution by performance bands</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {studentDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} students`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Performance metrics across all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.studentAnalytics.detailedMetrics.byClass.map((c) => ({
                        name: c.className,
                        score: c.avgScore,
                        games: c.avgGamesPlayed,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="score" name="Average Score" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="games" name="Games Played" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Class Performance</CardTitle>
              <CardDescription>Performance metrics across all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.classAnalytics.detailedMetrics.byTeacher.map((t) => ({
                        name: t.teacher,
                        score: t.avgScore,
                        students: t.studentCount,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="score" name="Average Score" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="students" name="Student Count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Game Usage</CardTitle>
              <CardDescription>Usage metrics across all games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.gameAnalytics.detailedMetrics.bySubject.map((s) => ({
                        name: s.subject,
                        plays: s.totalPlays,
                        score: s.avgScore,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="plays" name="Total Plays" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="score" name="Average Score" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
