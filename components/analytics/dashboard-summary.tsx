"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, BarChart3, Users, Gamepad2, BookOpen, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { TimeRange } from "@/types/analytics"

interface DashboardSummaryProps {
  data: any // Replace with proper type from analytics.ts
  timeRange?: TimeRange
}

export function DashboardSummary({ data, timeRange = "monthly" }: DashboardSummaryProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRange)
  const [activeTab, setActiveTab] = useState("overview")

  const currentPeriod = data.dashboardSummary.currentPeriod
  const previousPeriod = data.dashboardSummary.previousPeriod
  const topPerformers = data.dashboardSummary.topPerformers

  // Helper function to render trend indicator
  const renderTrendIndicator = (trend: { percentage: number; direction: string }) => {
    return (
      <div
        className={`flex items-center text-xs font-medium ${trend.direction === "up" ? "text-green-500" : "text-red-500"}`}
      >
        {trend.direction === "up" ? (
          <ArrowUpIcon className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDownIcon className="h-3 w-3 mr-1" />
        )}
        {trend.percentage}%
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Summary</h2>
        <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as TimeRange)}>
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
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <CardDescription>Total active students</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">{currentPeriod.metrics.activeStudents}</div>
              {renderTrendIndicator(currentPeriod.trends.studentGrowth)}
            </div>
            <div className="mt-4">
              <Progress
                value={(currentPeriod.metrics.activeStudents / currentPeriod.metrics.totalStudents) * 100}
                className="h-2"
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {currentPeriod.metrics.newStudents} new students in this period
            </div>
          </CardContent>
        </Card>

        {/* Games Played Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <CardDescription>Total sessions</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">{currentPeriod.metrics.gamesPlayed}</div>
              <div className="text-xs font-medium text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+
                {(
                  ((currentPeriod.metrics.gamesPlayed - previousPeriod.metrics.gamesPlayed) /
                    previousPeriod.metrics.gamesPlayed) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="mt-4 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.timeSeriesData.daily.metrics.gamesPlayed.map((value: number, index: number) => ({
                    value,
                    index,
                  }))}
                >
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {currentPeriod.metrics.totalGames} total games available
            </div>
          </CardContent>
        </Card>

        {/* Average Score Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <CardDescription>Overall performance</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">{currentPeriod.metrics.averageScore}%</div>
              {renderTrendIndicator(currentPeriod.trends.scoreChange)}
            </div>
            <div className="mt-4">
              <Progress value={currentPeriod.metrics.averageScore} className="h-2" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Compared to {previousPeriod.metrics.averageScore}% in previous period
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CardDescription>Games finished</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">{currentPeriod.metrics.completionRate}%</div>
              {renderTrendIndicator(currentPeriod.trends.completionChange)}
            </div>
            <div className="mt-4">
              <Progress value={currentPeriod.metrics.completionRate} className="h-2" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Compared to {previousPeriod.metrics.completionRate}% in previous period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Top Performers */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Top Students</TabsTrigger>
          <TabsTrigger value="classes">Top Classes</TabsTrigger>
          <TabsTrigger value="games">Top Games</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Highest scoring students across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.students.map((student: any, index: number) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">Score: {student.score}%</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-500">
                      +{student.improvement}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Classes</CardTitle>
              <CardDescription>Highest scoring classes across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.classes.map((classItem: any, index: number) => (
                  <div key={classItem.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Class {classItem.name}</p>
                        <p className="text-xs text-muted-foreground">Avg. Score: {classItem.avgScore}%</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-500">
                      +{classItem.improvement}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Games</CardTitle>
              <CardDescription>Games with highest engagement and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.games.map((game: any, index: number) => (
                  <div key={game.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{game.name}</p>
                        <p className="text-xs text-muted-foreground">Plays: {game.popularity}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{game.avgScore}% avg. score</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
