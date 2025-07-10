import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

interface DefaultProjectCardProps {
  title: string
  description: string
  stats: { label: string; value: React.ReactNode }[]
  action: React.ReactNode // Reverted to original type
}

export default function DefaultProjectCard({ title, description, stats, action }: DefaultProjectCardProps) {
  return (
    <Card className="shadow-lg">
      {" "}
      {/* Added shadow-lg */}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            <span className="text-sm font-semibold">{stat.value}</span>
          </div>
        ))}
        {action} {/* Render the action prop directly */}
      </CardContent>
    </Card>
  )
}
