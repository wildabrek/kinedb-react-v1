import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { StudentDataForReport } from "@/types" // ya da doğru import path'i

const apiKey = process.env.GOOGLE_GEN_AI_API_KEY

if (!apiKey) {
  throw new Error("GOOGLE_GEN_AI_API_KEY is not set in environment variables.")
}

const genAI = new GoogleGenerativeAI(apiKey)

function getPromptForJson(studentData: StudentDataForReport, language: string): string {
  return `
Generate a JSON-formatted student performance report based on the following data.

Language: ${language}

Student Data:
${JSON.stringify(studentData, null, 2)}

Instructions:
- Respond ONLY with valid JSON.
- No explanation, comments, or text outside of the JSON.
- Structure the report using fields like:
{
  "overallAssessment": { "title": "...", "content": "..." },
  "strengths": { "title": "...", "content": "...", "items": ["...", "..."] },
  "developmentSuggestions": { "title": "...", "content": "...", "items": ["...", "..."] },
  "actionPlan": {
    "title": "...",
    "short_term": { "title": "...", "items": ["..."] },
    "medium_term": { "title": "...", "items": ["..."] },
    "long_term": { "title": "...", "items": ["..."] }
  },
  "recommendedGames": { "title": "...", "content": "...", "games": [{ "name": "...", "reason": "..." }] },
  "futureProjection": { "title": "...", "content": "..." },
  "conclusion": { "title": "...", "content": "..." }
}
  `.trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentData, language = "en" } = body

    if (!studentData) {
      return NextResponse.json({ error: "Missing studentData in request body" }, { status: 400 })
    }

    const prompt = getPromptForJson(studentData, language)

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const report = JSON.parse(text)

    return NextResponse.json({ report })
  } catch (error: any) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      {
        error:
          error?.message ||
          "An error occurred while generating the report. Please try again.",
      },
      { status: 500 },
    )
  }
}
