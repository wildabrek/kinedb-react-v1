// lib/generate-student-report.ts

import { GoogleGenerativeAI } from "@google/generative-ai"

export interface StudentDataForReport {
  name: string
  grade?: string
  avg_score?: number
  games_played?: number
  strengths: string[]
  developmentAreas: string[]
  badges?: string[]
  subjectScores?: { subject: string; score: number }[]
  gameScores: {
    game: string
    score: number
    skills: string[]
  }[]
  skills?: { skill: string; score: number }[]
  allGames: {
    id: number
    game_name: string
    description: string
  }[]
}

function getPromptForJson(studentData: StudentDataForReport, language: string): string {
  return `
Generate a structured JSON report for this student in ${language}:

Student Data:
${JSON.stringify(studentData, null, 2)}

ONLY return a valid JSON structure with no explanation.
`
}

export async function generateStudentReportJson(studentData: StudentDataForReport, language = "en") {
  if (typeof window === "undefined") {
    throw new Error("generateStudentReportJson must be called on the client side.")
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai")
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEN_AI_API_KEY

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_GEN_AI_API_KEY in environment variables.")
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  })

  const prompt = getPromptForJson(studentData, language)
  const result = await model.generateContent(prompt)
  const responseText = result.response.text()

  try {
    return JSON.parse(responseText)
  } catch (err) {
    console.error("Failed to parse Gemini response:", responseText)
    throw new Error("Invalid JSON returned from Gemini.")
  }
}
