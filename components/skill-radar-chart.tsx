"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

interface SkillRadarChartProps {
  data: Record<string, number>
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  // Convert the data object to the format required by the RadarChart
  const chartData = Object.entries(data).map(([subject, value]) => ({
    subject,
    value,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Skills" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
