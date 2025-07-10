"use server"

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai"
import {StudentDataForReport} from "@/actions/gemini-actions"
import { generateStudentReportJson } from "@/actions/gemini-actions"

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

const apiKey = process.env.GOOGLE_GEN_AI_API_KEY
if (!apiKey) {
  throw new Error("GOOGLE_GEN_AI_API_KEY is not set in environment variables.")
}
const genAI = new GoogleGenerativeAI(apiKey)

// Buraya istersen getPromptForJson fonksiyonunu aynen koyabilirsin (daha uzun olduğu için burada özetliyorum)
function getPromptForJson(studentData: StudentDataForReport, language: string): string {
  // Örnek basit prompt, detayları yukarıdaki kodundan al
  return `
Generate JSON report for student: ${studentData.name}
Student Data: ${JSON.stringify(studentData, null, 2)}
Respond ONLY with JSON in the specified format.
`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentData, language } = body

    if (!studentData) {
      return NextResponse.json({ error: "Missing studentData in request body" }, { status: 400 })
    }

    const prompt = getPromptForJson(studentData, language || "en")

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { response_mime_type: "application/json" },
    })

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // JSON parse hataları olabilir, try-catch kullanmak iyi olur
    const report = JSON.parse(responseText)

    return NextResponse.json({ report })
  } catch (error: any) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
  }
}
