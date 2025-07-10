import { Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GameScoreIndicatorProps {
  score: number | null | undefined
  isFinal?: boolean
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export function GameScoreIndicator({ score, isFinal = false, showIcon = true, size = "md" }: GameScoreIndicatorProps) {
  if (score === null || score === undefined) return null

  // Determine variant based on score
  const variant = score >= 80 ? "success" : score >= 60 ? "warning" : "destructive"

  // Determine size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-lg px-3 py-1",
  }

  // Determine styles based on whether it's a final score
  const styles = isFinal
    ? "bg-green-100 text-green-800 border-green-500 dark:bg-green-900 dark:text-green-300 dark:border-green-600"
    : ""

  return (
    <Badge variant={variant} className={`${sizeClasses[size]} ${styles}`}>
      {showIcon && <Trophy className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} mr-2`} />}
      {isFinal ? "Final Skor: " : "Skor: "}
      {score}
    </Badge>
  )
}
