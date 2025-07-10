import type React from "react"
// Update the interface and add default props
interface GameUsageChartProps {
  data?: {
    game: string
    plays: number
  }[]
  height?: number
}

const GameUsageChart: React.FC<GameUsageChartProps> = ({
  data = [
    { game: "Math Blaster", plays: 150 },
    { game: "Word Wizard", plays: 120 },
    { game: "Science Quest", plays: 100 },
    { game: "History Explorer", plays: 80 },
    { game: "Coding Adventure", plays: 90 },
  ],
  height = 300,
}) => {
  const chartConfig = {
    plays: {
      label: "Plays",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div style={{ height: `${height}px` }}>
      <div className="text-sm font-medium mb-4">Game Usage</div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm">{item.game}</span>
            <span className="text-sm font-medium">{item.plays} plays</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Add both named and default export
export { GameUsageChart }
export default GameUsageChart
