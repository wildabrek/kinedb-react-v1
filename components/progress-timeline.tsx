"use client"

import { Card, CardContent } from "@/components/ui/card"

export function ProgressTimeline() {
  const timelineData = [
    {
      month: "September",
      events: [
        { title: "Initial Assessment", description: "Baseline skills evaluation completed" },
        { title: "Learning Plan Created", description: "Personalized learning objectives established" },
      ],
    },
    {
      month: "October",
      events: [
        { title: "First Progress Check", description: "Showing improvement in math and reading" },
        { title: "Game Engagement Analysis", description: "Identified preferred learning activities" },
      ],
    },
    {
      month: "November",
      events: [
        { title: "Mid-Term Assessment", description: "On track with grade-level expectations" },
        { title: "Parent-Teacher Conference", description: "Discussed strengths and areas for growth" },
      ],
    },
    {
      month: "December",
      events: [
        { title: "End of Term Evaluation", description: "Consistent progress across all subjects" },
        { title: "Holiday Learning Plan", description: "Supplemental activities for break period" },
      ],
    },
    {
      month: "January",
      events: [
        { title: "New Term Goals", description: "Updated learning objectives for second semester" },
        { title: "Skill Gap Analysis", description: "Identified specific areas needing attention" },
      ],
    },
    {
      month: "February",
      events: [
        { title: "Current Assessment", description: "Showing significant improvement in key areas" },
        { title: "Learning Strategy Adjustment", description: "Refined approach based on recent performance" },
      ],
    },
  ]

  return (
    <div className="relative pl-6 border-l border-muted space-y-8">
      {timelineData.map((period, index) => (
        <div key={index} className="relative">
          <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-primary"></div>
          <div className="mb-2 font-medium">{period.month}</div>
          <div className="space-y-3">
            {period.events.map((event, eventIndex) => (
              <Card key={eventIndex} className="border-dashed">
                <CardContent className="p-3">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-muted-foreground">{event.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
