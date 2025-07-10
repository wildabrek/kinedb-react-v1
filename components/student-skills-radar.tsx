"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { getStudentSkills } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

interface SkillData {
  skill: string
  value: number
}

interface StudentSkillsRadarProps {
  studentId: number
}

export default function StudentSkillsRadar({ studentId }: StudentSkillsRadarProps) {
  const { translate: t } = useLanguage()
  const [skills, setSkills] = useState<SkillData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkillsData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch student skills from API
        const studentSkills = await getStudentSkills(studentId)

        if (studentSkills && studentSkills.length > 0) {
          // Transform the API data to the format needed for the radar chart
          const skillsData = studentSkills.map((skill) => ({
            skill: skill.skill,
            // Generate a random value between 60-95 for demo purposes
            // In a real app, this would come from the API
            value: skill.is_strength ? Math.floor(Math.random() * 15) + 80 : Math.floor(Math.random() * 20) + 60,
          }))

          setSkills(skillsData)
        } else {
          // If no data, use sample data
          setSkills([
            { skill: "Problem Solving", value: 85 },
            { skill: "Critical Thinking", value: 75 },
            { skill: "Memory", value: 90 },
            { skill: "Pattern Recognition", value: 80 },
            { skill: "Logical Reasoning", value: 70 },
            { skill: "Spatial Awareness", value: 65 },
          ])
        }
      } catch (err) {
        console.error("Error fetching skills data:", err)
        setError("Failed to load skills data")
        // Fall back to sample data
        setSkills([
          { skill: "Problem Solving", value: 85 },
          { skill: "Critical Thinking", value: 75 },
          { skill: "Memory", value: 90 },
          { skill: "Pattern Recognition", value: 80 },
          { skill: "Logical Reasoning", value: 70 },
          { skill: "Spatial Awareness", value: 65 },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkillsData()
  }, [studentId])

  // Calculate coordinates for radar chart
  const calculateCoordinates = () => {
    const centerX = 150
    const centerY = 150
    const radius = 100
    const angleStep = (2 * Math.PI) / skills.length

    return skills.map((skill, index) => {
      const angle = index * angleStep - Math.PI / 2 // Start from top
      const distance = (skill.value / 100) * radius
      const x = centerX + distance * Math.cos(angle)
      const y = centerY + distance * Math.sin(angle)

      return {
        x,
        y,
        labelX: centerX + (radius + 20) * Math.cos(angle),
        labelY: centerY + (radius + 20) * Math.sin(angle),
        skill,
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">{t("No skills data available")}</p>
      </div>
    )
  }

  const coordinates = calculateCoordinates()
  const points = coordinates.map((coord) => `${coord.x},${coord.y}`).join(" ")

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* Background circles */}
        {[20, 40, 60, 80, 100].map((percent, i) => (
          <circle key={i} cx="150" cy="150" r={percent} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        ))}

        {/* Axis lines */}
        {coordinates.map((coord, i) => (
          <line
            key={i}
            x1="150"
            y1="150"
            x2={150 + 100 * Math.cos((i * (2 * Math.PI)) / skills.length - Math.PI / 2)}
            y2={150 + 100 * Math.sin((i * (2 * Math.PI)) / skills.length - Math.PI / 2)}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon */}
        <polygon points={points} fill="rgba(59, 130, 246, 0.5)" stroke="rgb(59, 130, 246)" strokeWidth="2" />

        {/* Data points */}
        {coordinates.map((coord, i) => (
          <circle key={i} cx={coord.x} cy={coord.y} r="4" fill="rgb(59, 130, 246)" />
        ))}

        {/* Labels */}
        {coordinates.map((coord, i) => (
          <text
            key={i}
            x={coord.labelX}
            y={coord.labelY}
            fontSize="10"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
          >
            {coord.skill.skill}
          </text>
        ))}
      </svg>
    </div>
  )
}
