export interface LineChartRenderingConfig {
  // Renamed to avoid conflict with ChartConfig in chart.tsx
  colors: string[]
  valueFormatter: (value: number) => string
  yAxisWidth: number
  showLegend: boolean
  showGrid: boolean
  showXAxis: boolean
  showYAxis: boolean
  showTooltip: boolean
}
