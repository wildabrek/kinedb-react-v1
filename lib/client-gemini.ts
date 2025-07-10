// lib/client-gemini.ts
import {studentData} from "./api"
export async function generateStudentReportJson(studentData, language = "en") {
  try {
    const response = await fetch("/api/generate-student-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentData, language }),
    })
    const json = await response.json()
    return json
  } catch (error) {
    console.error("Client error generating student report:", error)
    return { error: "Failed to generate report." }
  }
}
