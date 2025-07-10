"use client"
import * as React from "react"
import { Legend, Tooltip as RechartsTooltip, type TooltipProps } from "recharts"
import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Chart Container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    className?: string
  }
>(({ config, className, children, ...props }, ref) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null)
  const [activeChart, setActiveChart] = React.useState<keyof typeof config | null>(null)

  React.useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      container.style.setProperty("--chart-width", `${container.offsetWidth}px`)
      container.style.setProperty("--chart-height", `${container.offsetHeight}px`)
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <ChartContext.Provider value={{ chartContainerRef, activeChart, setActiveChart, config }}>
      <div
        ref={ref}
        data-chart-container
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-polar-grid_line]:stroke-border/50 [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-radial-bar-sector]:stroke-border",
          className,
        )}
        {...props}
      >
        <div ref={chartContainerRef} className="h-full w-full">
          {children}
        </div>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

// Context
type ChartContextProps = {
  chartContainerRef: React.RefObject<HTMLDivElement>
  activeChart: keyof ChartConfig | null
  setActiveChart: React.Dispatch<React.SetStateAction<keyof ChartConfig | null>>
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

// Tooltip
const ChartTooltip = RechartsTooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<TooltipProps<any, any>, "label" | "payload"> & {
      className?: string
      indicator?: "line" | "dot" | "dashed"
      hideLabel?: boolean
      hideIndicator?: boolean
      formatter?: (value: any, name: any, item: any, index: number) => React.ReactNode
    }
>(
  (
    { className, indicator = "dot", label, payload, hideLabel = false, hideIndicator = false, formatter, ...props },
    ref,
  ) => {
    const { config } = useChart()

    if (!payload || !payload.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
        {...props}
      >
        {!hideLabel && label && <div className="font-medium text-foreground">{label}</div>}
        <div className="grid gap-1.5">
          {payload.map((item, i) => {
            const name = item.name
            const value = item.value
            const color = item.color || "hsl(var(--chart-1))"
            const indicatorColor = config[name as keyof typeof config]?.color || color

            return (
              <div
                key={item.dataKey}
                className="flex w-full items-center justify-between [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  {!hideIndicator && (
                    <span
                      className={cn("h-2.5 w-2.5 shrink-0 rounded-[2px]", {
                        "bg-[--color-indicator]": indicator === "dot",
                        "ring-1 ring-inset ring-[--color-indicator]": indicator === "line",
                        "border-2 border-dashed border-[--color-indicator] bg-transparent": indicator === "dashed",
                      })}
                      style={{ "--color-indicator": indicatorColor } as React.CSSProperties}
                    />
                  )}
                  <span className="text-muted-foreground">{config[name as keyof typeof config]?.label || name}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatter ? formatter(value, name, item, i) : value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Legend
const ChartLegend = Legend

const legendVariants = cva("flex items-center gap-2", {
  variants: {
    direction: {
      horizontal: "flex-row",
      vertical: "flex-col items-start",
    },
  },
  defaultVariants: {
    direction: "horizontal",
  },
})

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    VariantProps<typeof legendVariants> & {
      payload?: any[]
      className?: string
      onItemClick?: (item: any) => void
    }
>(({ className, direction, payload, onItemClick, ...props }, ref) => {
  const { config } = useChart()

  if (!payload || !payload.length) {
    return null
  }

  return (
    <div ref={ref} className={cn(legendVariants({ direction }), className)} {...props}>
      {payload.map((item) => {
        const name = item.value
        const color = item.color || "hsl(var(--chart-1))"
        const indicatorColor = config[name as keyof typeof config]?.color || color

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => onItemClick?.(item)}
          >
            <div className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: indicatorColor }} />
            <span className="text-muted-foreground">{config[name as keyof typeof config]?.label || name}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

// Config
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<string, string> })
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
  type ChartConfig,
}
