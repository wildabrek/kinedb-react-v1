import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Loader2 } from "lucide-react"
import { ChartContainer as BaseChartContainer, type ChartConfig as BaseChartConfig } from "../chart" // Import from new chart.tsx

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
  children: React.ReactNode
  height?: number
  footer?: React.ReactNode
  action?: React.ReactNode
  chartConfig?: BaseChartConfig // Renamed prop to pass styling config to BaseChartContainer
}

export function ChartContainer({
  title,
  description,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = "No data available",
  children,
  height = 350,
  footer,
  action,
  className,
  chartConfig, // Destructure new prop
  ...props
}: ChartContainerProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      {(title || description) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-0", { "pt-6": !title && !description })}>
        <div style={{ height: `${height}px` }} className="relative w-full">
          {/* Always render the base chart container and its children */}
          <BaseChartContainer config={chartConfig || {}} height={height}>
            {children}
          </BaseChartContainer>

          {/* Overlay loading, error, or empty states */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            </div>
          )}
          {empty &&
            !loading &&
            !error && ( // Only show empty if not loading/error
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            )}
        </div>
      </CardContent>
      {footer && <div className="px-6 py-4 border-t">{footer}</div>}
    </Card>
  )
}

export function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: `${height}px` }} className="w-full">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
