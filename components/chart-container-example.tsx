"use client"

import { LineChart } from "./charts/line-chart"
import { ChartContainer } from "./ui/chart"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ChartContainerExample() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [empty, setEmpty] = useState(false)

  const data = [
    { month: "Jan", Sales: 100, Revenue: 200 },
    { month: "Feb", Sales: 150, Revenue: 300 },
    { month: "Mar", Sales: 200, Revenue: 400 },
    { month: "Apr", Sales: 120, Revenue: 250 },
    { month: "May", Sales: 180, Revenue: 350 },
    { month: "Jun", Sales: 250, Revenue: 500 },
  ]

  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    setEmpty(false)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Randomly show different states for demonstration
      const random = Math.random()
      if (random < 0.2) {
        setError("Failed to load chart data")
      } else if (random < 0.4) {
        setEmpty(true)
      }
    }, 1500)
  }

  const chartConfig = {
    Sales: { label: "Sales", color: "hsl(var(--chart-1))" },
    Revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Monthly sales and revenue data</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">Loading...</div>
            ) : error ? (
              <div className="flex h-full items-center justify-center text-red-500">{error}</div>
            ) : empty ? (
              <div className="flex h-full items-center justify-center">No data available.</div>
            ) : (
              <LineChart
                data={data}
                categories={["Sales", "Revenue"]}
                index="month"
                valueFormatter={(value) => `$${value}`}
              />
            )}
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full text-sm text-muted-foreground">
            <div>Last updated: 2 hours ago</div>
            <div>Source: Sales Department</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
