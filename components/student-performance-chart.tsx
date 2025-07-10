"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { getStudentSubjectScores } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface PerformanceData {
  date: string
  math: number
  english: number
  science: number
  [key: string]: number | string
}

// Generate sample data for timeframes when API data isn't available
const generateSampleData = (timeframe: string): PerformanceData[] => {
  if (timeframe === "week") {
    return [
      { date: "Monday", math: 85, english: 78, science: 82 },
      { date: "Tuesday", math: 88, english: 80, science: 84 },
      { date: "Wednesday", math: 90, english: 82, science: 86 },
      { date: "Thursday", math: 87, english: 85, science: 88 },
      { date: "Friday", math: 92, english: 87, science: 90 },
    ]
  } else if (timeframe === "month") {
    return [
      { date: "Week 1", math: 85, english: 78, science: 82 },
      { date: "Week 2", math: 88, english: 80, science: 84 },
      { date: "Week 3", math: 90, english: 82, science: 86 },
      { date: "Week 4", math: 87, english: 85, science: 88 },
    ]
  } else {
    return [
      { date: "Jan", math: 85, english: 78, science: 82 },
      { date: "Feb", math: 88, english: 80, science: 84 },
      { date: "Mar", math: 90, english: 82, science: 86 },
      { date: "Apr", math: 87, english: 85, science: 88 },
      { date: "May", math: 92, english: 87, science: 90 },
      { date: "Jun", math: 94, english: 89, science: 91 },
    ]
  }
}

interface StudentPerformanceChartProps {
  studentId: number
}

export default function StudentPerformanceChart({ studentId }: StudentPerformanceChartProps) {
  const { translate:t } = useLanguage()
  const [timeframe, setTimeframe] = useState("month")
  const [data, setData] = useState<PerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])

  useEffect(() => {
    async function fetchPerformanceData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch student subject scores from API
        const subjectScores = await getStudentSubjectScores(studentId)

        if (subjectScores && subjectScores.length > 0) {
          // Get unique subjects
          const uniqueSubjects = Array.from(new Set(subjectScores.map((score) => score.subject)))
          setSubjects(uniqueSubjects)

          // For now, we'll use the sample data structure but populate with real subject scores
          // In a real app, you would have historical data with dates
          const performanceData = generateSampleData(timeframe)

          // Update the performance data with real subject scores where available
          performanceData.forEach((dataPoint) => {
            uniqueSubjects.forEach((subject) => {
              const score = subjectScores.find((s) => s.subject === subject)
              if (score) {
                // Add the subject score to the data point if it exists
                dataPoint[subject.toLowerCase()] = score.score
              }
            })
          })

          setData(performanceData)
        } else {
          // If no data, use sample data
          setData(generateSampleData(timeframe))
          setSubjects(["math", "english", "science"])
        }
      } catch (err) {
        console.error("Error fetching performance data:", err)
        setError("Failed to load performance data")
        // Fall back to sample data
        setData(generateSampleData(timeframe))
        setSubjects(["math", "english", "science"])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformanceData()
  }, [studentId, timeframe])

  // When timeframe changes, update the data
  useEffect(() => {
    // In a real app, you would fetch new data based on the timeframe
    // For now, we'll just use the sample data
    setData(generateSampleData(timeframe))
  }, [timeframe])

  // Calculate chart dimensions
  const chartWidth = 600
  const chartHeight = 300
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Calculate scales
  const xScale = innerWidth / (data.length - 1)
  const yMax = 100 // Max possible score
  const yScale = innerHeight / yMax

  // Generate line paths
  const generateLinePath = (key: string) => {
    return data
      .map((d, i) => {
        const x = padding.left + i * xScale
        const y = chartHeight - padding.bottom - (d[key] as number) * yScale
        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  // Define colors for subjects
  const subjectColors: Record<string, string> = {
    math: "rgb(59, 130, 246)", // blue
    english: "rgb(16, 185, 129)", // green
    science: "rgb(249, 115, 22)", // orange
    history: "rgb(139, 92, 246)", // purple
    geography: "rgb(236, 72, 153)", // pink
    art: "rgb(234, 179, 8)", // yellow
  }

  // Default colors for any other subjects
  const defaultColors = [
    "rgb(59, 130, 246)",
    "rgb(16, 185, 129)",
    "rgb(249, 115, 22)",
    "rgb(139, 92, 246)",
    "rgb(236, 72, 153)",
    "rgb(234, 179, 8)",
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4 flex justify-end">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("Select timeframe")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t("Last 7 Days")}</SelectItem>
            <SelectItem value="month">{t("Last 30 Days")}</SelectItem>
            <SelectItem value="year">{t("Last Year")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full h-[250px] overflow-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="rgba(0,0,0,0.2)"
          />

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="rgba(0,0,0,0.2)"
          />

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={padding.left + i * xScale}
              y={chartHeight - padding.bottom + 15}
              fontSize="10"
              textAnchor="middle"
              fill="currentColor"
            >
              {d.date}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <text
              key={tick}
              x={padding.left - 10}
              y={chartHeight - padding.bottom - tick * yScale}
              fontSize="10"
              textAnchor="end"
              dominantBaseline="middle"
              fill="currentColor"
            >
              {tick}%
            </text>
          ))}

          {/* Grid lines */}
          {[25, 50, 75].map((tick) => (
            <line
              key={tick}
              x1={padding.left}
              y1={chartHeight - padding.bottom - tick * yScale}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom - tick * yScale}
              stroke="rgba(0,0,0,0.1)"
              strokeDasharray="4"
            />
          ))}

          {/* Data lines */}
          {subjects.map((subject, index) => (
            <path
              key={subject}
              d={generateLinePath(subject.toLowerCase())}
              fill="none"
              stroke={subjectColors[subject.toLowerCase()] || defaultColors[index % defaultColors.length]}
              strokeWidth="2"
            />
          ))}

          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              {subjects.map((subject, subjectIndex) => (
                <circle
                  key={`${i}-${subject}`}
                  cx={padding.left + i * xScale}
                  cy={chartHeight - padding.bottom - (d[subject.toLowerCase()] as number) * yScale}
                  r="4"
                  fill={subjectColors[subject.toLowerCase()] || defaultColors[subjectIndex % defaultColors.length]}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center mt-2 gap-4">
        {subjects.map((subject, index) => (
          <div key={subject} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1"
              style={{
                backgroundColor: subjectColors[subject.toLowerCase()] || defaultColors[index % defaultColors.length],
              }}
            ></div>
            <span className="text-xs">{t(subject.charAt(0).toUpperCase() + subject.slice(1))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
