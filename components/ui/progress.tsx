"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// 1. Bileşenin props tipini genişleterek "indicatorClassName" prop'unu ekleyin.
type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps // 2. Genişletilmiş yeni tipi burada kullanın.
>(({ className, value, indicatorClassName, ...props }, ref) => ( // 3. "indicatorClassName" prop'unu props'tan ayırın.
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
    {...props} // Artık "indicatorClassName" bu ...props içinde değil.
  >
    <ProgressPrimitive.Indicator
      // 4. "indicatorClassName"'i burada "cn" fonksiyonu ile birleştirerek kullanın.
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }