"use client"

import { CardDescription } from "@/components/ui/card"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, Users, Gamepad2, Award, BarChart } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getAnalyticsDashboardData } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { getDashboardSummary } from "@/lib/api"

interface DashboardSummaryProps {
  data: any
  timeRange: "daily" | "weekly" | "monthly" | "yearly"
}

export default async function DashboardSummaryPage() {
  const summaryData = await getDashboardSummary()

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardSummary data={summaryData} />
        </CardContent>
      </Card>
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
  const [loading, setLoading] = useState()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const data = await getAnalyticsDashboardData()
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError((prev) => ({ ...prev, dashboard: "Failed to load dashboard statistics" }))
        toast({ title: "Error", description: "Failed to load dashboard statistics", variant: "destructive" })
      } finally {
        setLoading((prev) => ({ ...prev, dashboard: false }))
      }
    }

    fetchDashboardStats()
  }, [])
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Summary</h2>

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
        <TabsList>
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
                {(topPerformers?.students || []).map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Score: {student.score}%</p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span>+{student.improvement}%</span>
                    </div>
                  </div>
                ))}
                {(!topPerformers?.students || topPerformers.students.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">No student data available</div>
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
                {(topPerformers?.classes || []).map((cls: any) => (
                  <div key={cls.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Class {cls.name}</p>
                      <p className="text-sm text-muted-foreground">Avg. Score: {cls.averageScore}%</p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span>+{cls.improvement}%</span>
                    </div>
                  </div>
                ))}
                {(!topPerformers?.classes || topPerformers.classes.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">No class data available</div>
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
                {(topPerformers?.games || []).map((game: any) => (
                  <div key={game.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{game.name}</p>
                      <p className="text-sm text-muted-foreground">Plays: {game.popularity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg. Score: {game.avg_score}%</p>
                    </div>
                  </div>
                ))}
                {(!topPerformers?.games || topPerformers.games.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">No game data available</div>
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
                            index: index + 1,
                          }))
                        : Array(7)
                            .fill(0)
                            .map((_, index) => ({ value: 0, index: index + 1 }))
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: "Day", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "Games Played", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value} games`, "Played"]} />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline">
              <h2 className="text-3xl font-bold">
                {value}
                {valueLabel && <span className="text-lg ml-1">{valueLabel}</span>}
              </h2>
              {total && (
                <p className="text-sm text-muted-foreground ml-2">
                  of {total} {totalLabel}
                </p>
              )}
            </div>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
        </div>

        <div className="mt-4 flex items-center text-sm">
          <div className={`flex items-center ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend.direction === "up" ? (
              <ArrowUpRight className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4" />
            )}
            <span>{trend.value}%</span>
          </div>
          <span className="text-muted-foreground ml-2">vs. previous {timeRange}</span>
        </div>
      </CardContent>
    </Card>
  )
}
