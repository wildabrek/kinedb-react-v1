"use client"

import { useEffect, useState } from "react"
import {getRecentActivity, RecentActivityItem} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2Icon, BookOpen, Users, Award } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
//import { recentActivity } from "@/utils/data" // Import recent activity from our data utility

export default function RecentActivity() {
  const [activities, setActivities] = useState<RecentActivityItem[]>([])
  const { translate: t } = useLanguage()
  useEffect(() => {
    getRecentActivity()
      .then(setActivities)
      .catch((err) => console.error("Recent activity fetch error:", err))
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "game":
        return <Gamepad2Icon className="h-5 w-5 text-purple-500" />
      case "class":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "student":
        return <Users className="h-5 w-5 text-green-500" />
      case "achievement":
        return <Award className="h-5 w-5 text-yellow-500" />
      default:
        return <Gamepad2Icon className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "game":
        return { text: "Game", variant: "default" as const }
      case "class":
        return { text: "Class", variant: "secondary" as const }
      case "student":
        return { text: "Student", variant: "outline" as const }
      case "achievement":
        return { text: "Achievement", variant: "default" as const }
      default:
        return { text: type, variant: "outline" as const }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Recent Activity")}</CardTitle>
        <CardDescription>{t("Latest activities across the platform")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3">
              <div className="bg-muted p-2 rounded-full">{getActivityIcon(act.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t(act.title)}</h3>
                  <Badge variant={getActivityBadge(act.type).variant}>
                    {t(getActivityBadge(act.type).text)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{act.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
