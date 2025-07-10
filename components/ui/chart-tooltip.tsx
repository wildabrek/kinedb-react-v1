"use client"
import { cn } from "@/lib/utils"

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  valueFormatter?: (value: number) => string
  categories?: string[]
  colors?: string[]
  className?: string
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value: number) => value.toString(),
  categories = [],
  colors = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"],
  className,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 grid gap-2">
        {payload.map((item, index) => {
          const category = categories.includes(item.dataKey) ? item.dataKey : item.name

          const color = colors[index % colors.length]

          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs font-medium">
                {category}: {valueFormatter(item.value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
