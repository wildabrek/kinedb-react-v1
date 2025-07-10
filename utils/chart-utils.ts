/**
 * Formats a percentage value for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Formats a large number with thousands separators
 */
export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Formats a percentage change with + or - sign
 */
export function formatPercentageChange(change: number): string {
  const sign = change >= 0 ? "+" : ""
  return `${sign}${change.toFixed(1)}%`
}

/**
 * Generates a palette of colors for charts
 */
export function generateColorPalette(count: number): string[] {
  const baseColors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#ef4444", // red
  ]

  // If we need more colors than in our base palette, we'll cycle through them
  const palette: string[] = []
  for (let i = 0; i < count; i++) {
    palette.push(baseColors[i % baseColors.length])
  }

  return palette
}
