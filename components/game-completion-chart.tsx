"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface GameData {
  name: string
  score: number
  plays: number
  completionRate: number
  avgTime: string
  achievements: number
}

interface GameCompletionChartProps {
  data: GameData[]
}

export function GameCompletionChart({ data }: GameCompletionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
        <YAxis yAxisId="right" orientation="right" domain={[0, Math.max(...data.map((d) => d.plays)) * 1.2]} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "score") return [`${value}%`, "Score"]
            return [value, "Plays"]
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="score" name="Score (%)" fill="#8884d8" />
        <Bar yAxisId="right" dataKey="plays" name="Number of Plays" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}
