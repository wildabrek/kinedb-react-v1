"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { getPerformanceChartData } from "@/lib/api"

interface PerformanceChartProps {
  title?: string
  description?: string
  timeRange?: string
  classId?: string | number
  data?: {
    month: string
    score: number
  }[]
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title = "Performance Chart",
  description = "Monthly performance scores",
  timeRange = "Last 30 Days",
  classId,
  data: propData,
}) => {
  const [data, setData] = useState(propData || [])
  const [loading, setLoading] = useState(!propData)

  useEffect(() => {
    if (!propData) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const chartData = await getPerformanceChartData(timeRange)
          setData(chartData || [])
        } catch (error) {
          console.error("Error fetching performance data:", error)
          // Fallback data
          setData([
            { month: "Jan", score: 75 },
            { month: "Feb", score: 78 },
            { month: "Mar", score: 82 },
            { month: "Apr", score: 85 },
            { month: "May", score: 88 },
            { month: "Jun", score: 90 },
          ])
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [timeRange, propData])

  const chartConfig: ChartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--chart-1))",
    },
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-score)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { PerformanceChart }
export default PerformanceChart
