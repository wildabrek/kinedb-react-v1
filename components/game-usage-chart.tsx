"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart } from "@/components/charts/chart-bar"

interface GameUsageChartProps {
  data: {
    game: string
    plays: number
  }[]
}

const GameUsageChart: React.FC<GameUsageChartProps> = ({ data }) => {
  const chartConfig = {
    plays: {
      label: "Plays",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Usage</CardTitle>
        <CardDescription>Number of plays per game</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart data={data} title="" description="" config={chartConfig} />
      </CardContent>
    </Card>
  )
}

export default GameUsageChart
