export interface ChartConfig {
  colors: string[]
  valueFormatter: (value: number) => string
  yAxisWidth: number
  showLegend: boolean
  showGrid: boolean
  showXAxis: boolean
  showYAxis: boolean
  showTooltip: boolean
}
