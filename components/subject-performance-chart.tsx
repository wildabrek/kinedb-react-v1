"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SubjectPerformanceData {
  month: string
  math: number
  science: number
  english: number
}

interface SubjectPerformanceChartProps {
  data: SubjectPerformanceData[]
}

export function SubjectPerformanceChart({ data }: SubjectPerformanceChartProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Konu Performansı</CardTitle>
        <CardDescription>Farklı konulardaki ortalama puanlar.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="math" name="Matematik" stroke="#8884d8" />
            <Line type="monotone" dataKey="science" name="Fen Bilgisi" stroke="#82ca9d" />
            <Line type="monotone" dataKey="english" name="İngilizce" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
