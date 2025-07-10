"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart } from "@/components/charts/line-chart"

interface PerformanceChartProps {
  data: {
    month: string
    score: number
  }[]
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Chart</CardTitle>
        <CardDescription>Monthly performance scores</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data}
          index="month"
          categories={["score"]}
          colors={["hsl(var(--chart-1))"]}
          valueFormatter={(number) => `${number}%`}
        />
      </CardContent>
    </Card>
  )
}

export default PerformanceChart
