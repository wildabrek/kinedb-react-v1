"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { ChartContainer, ChartTooltip, LineChart } from "@/components/ui/chart"
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

export function LearningGrowthChart() {
  const [data, setData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])

  useEffect(() => {
    const fetchStudentPerformance = async () => {
      try {
        setLoading(true)
        const response = await apiRequest<PerformanceData[]>("/analytics/student-performance")

        // Extract all subject keys except 'month' and 'average'
        if (response.length > 0) {
          const allSubjects = Object.keys(response[0]).filter((key) => key !== "month" && key !== "average")
          setSubjects(allSubjects)
        }

        setData(response)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Growth</CardTitle>
        <CardDescription>Student performance across subjects over time</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center text-red-500">{error}</div>
        ) : (
          <div className="h-[300px]">
            <ChartContainer>
              <LineChart
                data={data}
                categories={[...subjects, "average"]}
                index="month"
                colors={["#2563eb", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"]}
                valueFormatter={(value) => `${value}%`}
                showLegend
                showXAxis
                showYAxis
                showGridLines
                showTooltip
                customTooltip={
                  <ChartTooltip
                    content={({ payload }) => {
                      const item = payload?.[0]?.payload
                      if (!item) return null
                      return (
                        <div className="flex flex-col gap-2 p-2">
                          <div className="text-sm font-medium">{item.month}</div>
                          {subjects.map((subject) => (
                            <div key={subject} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    subject === "mathematics"
                                      ? "#2563eb"
                                      : subject === "english"
                                        ? "#10b981"
                                        : subject === "science"
                                          ? "#ef4444"
                                          : subject === "history"
                                            ? "#f59e0b"
                                            : "#8b5cf6",
                                }}
                              ></div>
                              <div className="text-sm">
                                {subject.charAt(0).toUpperCase() + subject.slice(1)}: {item[subject]}%
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 border-t pt-1 mt-1">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <div className="text-sm font-medium">Average: {item.average}%</div>
                          </div>
                        </div>
                      )
                    }}
                  />
                }
              />
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
