"use client"

import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface LineChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
}

export function LineChart({
  data,
  index,
  categories = [],
  colors,
  valueFormatter = (value) => value.toString(),
}: LineChartProps) {
  const chartConfig = categories.reduce((acc, category, i) => {
    acc[category] = {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      color: colors?.[i] || `hsl(var(--chart-${i + 1}))`,
    }
    return acc
  }, {} as ChartConfig)

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <RechartsLineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => (typeof value === "string" ? value.slice(0, 3) : value)}
        />
        <YAxis tickFormatter={valueFormatter} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent formatter={(value) => (typeof value === "number" ? valueFormatter(value) : value)} />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {categories.map((category) => (
          <Line
            key={category}
            dataKey={category}
            type="monotone"
            stroke={`var(--color-${category})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  )
}
