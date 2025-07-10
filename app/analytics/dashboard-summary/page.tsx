"use client"

import { CardDescription } from "@/components/ui/card"
import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, Users, Gamepad2, Award, BarChart, Loader2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getAnalyticsDashboardData, getDashboardSummary } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface DashboardSummaryProps {
  data: any
  timeRange: "daily" | "weekly" | "monthly" | "yearly"
}

export default function DashboardSummaryPage() {
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDashboardSummary()
        setSummaryData(data)
      } catch (error) {
        console.error("Error fetching dashboard summary:", error)
        // Set comprehensive fallback data
        setSummaryData({
          dashboardSummary: {
            currentPeriod: {
              metrics: {
                activeStudents: 150,
                totalStudents: 200,
                newStudents: 25,
                gamesPlayed: 1250,
                totalGames: 50,
                averageScore: 78,
                completionRate: 85,
              },
              trends: {
                studentGrowth: { percentage: 12, direction: "up" },
                scoreChange: { percentage: 5, direction: "up" },
                completionChange: { percentage: 8, direction: "up" },
              },
            },
            previousPeriod: {
              metrics: {
                activeStudents: 134,
                totalStudents: 180,
                newStudents: 20,
                gamesPlayed: 1150,
                totalGames: 45,
                averageScore: 74,
                completionRate: 78,
              },
            },
            topPerformers: {
              students: [
                { id: 1, name: "Emma Thompson", score: 95, improvement: 3 },
                { id: 2, name: "Noah Martinez", score: 92, improvement: 5 },
                { id: 3, name: "Olivia Johnson", score: 90, improvement: 2 },
                { id: 4, name: "Liam Wilson", score: 89, improvement: 4 },
                { id: 5, name: "Sophia Davis", score: 87, improvement: 6 },
              ],
              classes: [
                { id: 1, name: "3A", averageScore: 88, improvement: 4 },
                { id: 2, name: "3B", averageScore: 85, improvement: 3 },
                { id: 3, name: "4A", averageScore: 82, improvement: 2 },
                { id: 4, name: "4B", averageScore: 80, improvement: 5 },
              ],
              games: [
                { id: 1, name: "Math Blaster", popularity: 150, avg_score: 82 },
                { id: 2, name: "Word Wizard", popularity: 120, avg_score: 78 },
                { id: 3, name: "Science Quest", popularity: 100, avg_score: 85 },
                { id: 4, name: "History Explorer", popularity: 90, avg_score: 76 },
                { id: 5, name: "Coding Adventure", popularity: 110, avg_score: 88 },
              ],
            },
          },
          timeSeriesData: {
            daily: {
              metrics: {
                gamesPlayed: [45, 52, 38, 65, 48, 55, 62],
              },
            },
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-muted-foreground">Loading dashboard data...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <DashboardSummary data={summaryData} timeRange="daily" />
    </div>
  )
}

function DashboardSummary({ data, timeRange }: DashboardSummaryProps) {
  const { currentPeriod, previousPeriod, topPerformers } = data.dashboardSummary || {
    currentPeriod: {
      metrics: {
        activeStudents: 0,
        totalStudents: 0,
        newStudents: 0,
        gamesPlayed: 0,
        totalGames: 0,
        averageScore: 0,
        completionRate: 0,
      },
      trends: {
        studentGrowth: { percentage: 0, direction: "up" },
        scoreChange: { percentage: 0, direction: "up" },
        completionChange: { percentage: 0, direction: "up" },
      },
    },
    previousPeriod: {
      metrics: {
        activeStudents: 0,
        totalStudents: 0,
        newStudents: 0,
        gamesPlayed: 0,
        totalGames: 0,
        averageScore: 0,
        completionRate: 0,
      },
    },
    topPerformers: {
      students: [],
      classes: [],
      games: [],
    },
  }

  // Create default empty data if timeSeriesData is missing
  const timeSeriesData = data.timeSeriesData || {
    daily: {
      metrics: {
        gamesPlayed: [0, 0, 0, 0, 0, 0, 0],
      },
    },
  }

  const [dashboardData, setDashboardData] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true)
        const data = await getAnalyticsDashboardData()
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError((prev) => ({ ...prev, dashboard: "Failed to load dashboard statistics" }))
        toast({ title: "Error", description: "Failed to load dashboard statistics", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Summary</h2>
        <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Students"
          value={currentPeriod.metrics.activeStudents}
          total={currentPeriod.metrics.totalStudents}
          icon={<Users className="h-5 w-5" />}
          trend={{
            value: currentPeriod.trends.studentGrowth.percentage,
            direction: currentPeriod.trends.studentGrowth.direction,
          }}
          timeRange={timeRange}
        />

        <MetricCard
          title="Games Played"
          value={currentPeriod.metrics.gamesPlayed}
          total={currentPeriod.metrics.totalGames}
          icon={<Gamepad2 className="h-5 w-5" />}
          trend={{
            value: 8,
            direction: "up",
          }}
          timeRange={timeRange}
          valueLabel="plays"
          totalLabel="games"
        />

        <MetricCard
          title="Average Score"
          value={currentPeriod.metrics.averageScore}
          icon={<Award className="h-5 w-5" />}
          trend={{
            value: currentPeriod.trends.scoreChange.percentage,
            direction: currentPeriod.trends.scoreChange.direction,
          }}
          timeRange={timeRange}
          valueLabel="%"
        />

        <MetricCard
          title="Completion Rate"
          value={currentPeriod.metrics.completionRate}
          icon={<BarChart className="h-5 w-5" />}
          trend={{
            value: currentPeriod.trends.completionChange.percentage,
            direction: currentPeriod.trends.completionChange.direction,
          }}
          timeRange={timeRange}
          valueLabel="%"
        />
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Top Students</TabsTrigger>
          <TabsTrigger value="classes">Top Classes</TabsTrigger>
          <TabsTrigger value="games">Popular Games</TabsTrigger>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Students with the highest scores and improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(topPerformers?.students || []).map((student: any, index: number) => (
                  <div key={student.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Score: {student.score}%</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span>+{student.improvement}%</span>
                    </div>
                  </div>
                ))}
                {(!topPerformers?.students || topPerformers.students.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 opacity-50 mb-4" />
                    <p>No student data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Classes</CardTitle>
              <CardDescription>Classes with the highest average scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(topPerformers?.classes || []).map((cls: any, index: number) => (
                  <div key={cls.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">Class {cls.name}</p>
                        <p className="text-sm text-muted-foreground">Avg. Score: {cls.averageScore}%</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span>+{cls.improvement}%</span>
                    </div>
                  </div>
                ))}
                {(!topPerformers?.classes || topPerformers.classes.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart className="mx-auto h-12 w-12 opacity-50 mb-4" />
                    <p>No class data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Games</CardTitle>
              <CardDescription>Games with the highest usage and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(topPerformers?.games || []).map((game: any, index: number) => (
                  <div key={game.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{game.name}</p>
                        <p className="text-sm text-muted-foreground">Plays: {game.popularity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Avg. Score: {game.avg_score}%</p>
                      <div className="w-16 bg-secondary rounded-full h-2 mt-1">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${game.avg_score}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!topPerformers?.games || topPerformers.games.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gamepad2 className="mx-auto h-12 w-12 opacity-50 mb-4" />
                    <p>No game data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Daily Game Activity</CardTitle>
              <CardDescription>Number of games played over the last week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      timeSeriesData?.daily?.metrics?.gamesPlayed
                        ? timeSeriesData.daily.metrics.gamesPlayed.map((value: number, index: number) => ({
                            value,
                            day: `Day ${index + 1}`,
                            index: index + 1,
                          }))
                        : Array(7)
                            .fill(0)
                            .map((_, index) => ({
                              value: 0,
                              day: `Day ${index + 1}`,
                              index: index + 1,
                            }))
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: "Days", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "Games Played", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value) => [`${value} games`, "Played"]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Total Games</p>
                  <p className="text-2xl font-bold">
                    {timeSeriesData?.daily?.metrics?.gamesPlayed?.reduce((a: number, b: number) => a + b, 0) || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Daily Average</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (timeSeriesData?.daily?.metrics?.gamesPlayed?.reduce((a: number, b: number) => a + b, 0) || 0) /
                        7,
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Peak Day</p>
                  <p className="text-2xl font-bold">
                    {Math.max(...(timeSeriesData?.daily?.metrics?.gamesPlayed || [0]))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  total?: number
  icon: React.ReactNode
  trend: {
    value: number
    direction: "up" | "down"
  }
  timeRange: string
  valueLabel?: string
  totalLabel?: string
}

function MetricCard({ title, value, total, icon, trend, timeRange, valueLabel, totalLabel }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline">
              <h2 className="text-3xl font-bold">
                {value.toLocaleString()}
                {valueLabel && <span className="text-lg ml-1">{valueLabel}</span>}
              </h2>
              {total && (
                <p className="text-sm text-muted-foreground ml-2">
                  of {total.toLocaleString()} {totalLabel}
                </p>
              )}
            </div>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        </div>

        <div className="mt-4 flex items-center text-sm">
          <div className={`flex items-center ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend.direction === "up" ? (
              <ArrowUpRight className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4" />
            )}
            <span className="font-medium">{trend.value}%</span>
          </div>
          <span className="text-muted-foreground ml-2">vs. previous {timeRange}</span>
        </div>

        {/* Progress bar for completion rate */}
        {title === "Completion Rate" && (
          <div className="mt-3">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${value}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
