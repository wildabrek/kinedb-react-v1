"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SkillProgressData {
  month: string
  score: number
}

interface SkillProgressChartProps {
  data: SkillProgressData[]
}

export function SkillProgressChart({ data }: SkillProgressChartProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Beceri Gelişimi</CardTitle>
        <CardDescription>Belirli bir beceride aylık ortalama puan.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" name="Puan" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
