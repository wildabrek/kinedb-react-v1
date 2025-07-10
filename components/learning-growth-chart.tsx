"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface PerformanceData {
  month: string
  mathematics?: number
  english?: number
  science?: number
  history?: number
  average: number
  [key: string]: number | string | undefined
}

const chartConfig: ChartConfig = {
  mathematics: {
    label: "Mathematics",
    color: "hsl(var(--chart-1))",
  },
  english: {
    label: "English",
    color: "hsl(var(--chart-2))",
  },
  science: {
    label: "Science",
    color: "hsl(var(--chart-3))",
  },
  history: {
    label: "History",
    color: "hsl(var(--chart-4))",
  },
  average: {
    label: "Average",
    color: "hsl(var(--chart-5))",
  },
}

export function LearningGrowthChart() {
  const [data, setData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])

  useEffect(() => {
    const fetchStudentPerformance = async () => {
      try {
        setLoading(true)

        // Try to fetch real data, fallback to mock data
        try {
          const response = await fetch("/api/analytics/student-performance")
          if (response.ok) {
            const performanceData = await response.json()
            setData(performanceData)

            if (performanceData.length > 0) {
              const allSubjects = Object.keys(performanceData[0]).filter((key) => key !== "month" && key !== "average")
              setSubjects(allSubjects)
            }
          } else {
            throw new Error("API not available")
          }
        } catch (apiError) {
          // Fallback to mock data
          const mockData: PerformanceData[] = [
            { month: "Jan", mathematics: 75, english: 82, science: 78, history: 80, average: 79 },
            { month: "Feb", mathematics: 78, english: 85, science: 80, history: 82, average: 81 },
            { month: "Mar", mathematics: 82, english: 87, science: 85, history: 84, average: 85 },
            { month: "Apr", mathematics: 85, english: 89, science: 87, history: 86, average: 87 },
            { month: "May", mathematics: 88, english: 91, science: 89, history: 88, average: 89 },
            { month: "Jun", mathematics: 90, english: 93, science: 91, history: 90, average: 91 },
          ]

          setData(mockData)
          setSubjects(["mathematics", "english", "science", "history"])
        }

        setError(null)
      } catch (err) {
        console.error("Failed to fetch student performance data:", err)
        setError("Failed to load student performance data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchStudentPerformance()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Growth</CardTitle>
          <CardDescription>Student performance across subjects over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Growth</CardTitle>
          <CardDescription>Student performance across subjects over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Growth</CardTitle>
        <CardDescription>Student performance across subjects over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={{ stroke: "hsl(var(--border))" }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                label={{ value: "Score (%)", angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: any, name: string) => [
                  `${value}%`,
                  chartConfig[name as keyof typeof chartConfig]?.label || name,
                ]}
              />
              <Legend />

              {subjects.map((subject, index) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={`var(--color-${subject})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={chartConfig[subject as keyof typeof chartConfig]?.label || subject}
                />
              ))}

              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--color-average)"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                name="Average"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
