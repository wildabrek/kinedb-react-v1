"use server"

import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai"

// This interface defines the shape of the student data expected by the action.
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
  skills?: { skill: string; score: number }[] // Added skills to the report data
  allGames: {
    id: number
    game_name: string
    description: string
  }[]
}

// Helper function for creating a delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// YENİ ALANLAR EKLENDİ: AIReport arayüzünü güncelliyoruz
export interface AIReport {
  overallAssessment: {
    title: string
    content: string
  }
  strengths: {
    title: string
    content: string
    items: string[]
  }
  developmentSuggestions: {
    title: string
    content: string
    items: string[]
  }
  recommendedGames: {
    title: string
    content: string
    games: {
      name: string
      reason: string
    }[]
  }
  // YENİ: Eylem Planı bölümü
  actionPlan: {
    title: string
    short_term: { title: string; items: string[] }
    medium_term: { title: string; items: string[] }
    long_term: { title: string; items: string[] }
  }
  // YENİ: Gelecek Yorumu bölümü
  futureProjection: {
    title: string
    content: string
  }
  conclusion: {
    title: string
    content: string
  }
}

const apiKey = process.env.GOOGLE_GEN_AI_API_KEY
if (!apiKey) {
  throw new Error("GOOGLE_GEN_AI_API_KEY is not set in environment variables.")
}
const genAI = new GoogleGenerativeAI(apiKey)

const languagePrompts = {
  tr: {
    promptTitle: `Kapsamlı Öğrenci Gelişim Raporu Oluştur`,
    instructions: `Yukarıdaki verileri kullanarak, [studentName] için bir gelişim raporu özeti oluştur. Rapor; öğrencinin güçlü yönlerini, gelişim önerilerini, uygun oyun önerilerini, kısa-orta-uzun vadeli bir eylem planını ve öğrencinin gelecekteki gelişim potansiyeli üzerine bir yorumu içermelidir. Oyun önerilerini SADECE yukarıda verilen 'Mevcut Oyunların Listesi' içinden seçmelisin. Yanıtın SADECE aşağıda belirtilen JSON formatında olmalıdır, başka hiçbir metin, açıklama veya markdown formatı ekleme:`,
    jsonFields: {
      overallAssessment: `Genel Değerlendirme`,
      strengths: `Güçlü Yönler`,
      developmentSuggestions: `Gelişim Önerileri`,
      recommendedGames: `Önerilen Oyunlar`,
      actionPlan: "Önerilen Eylem Planı",
      short_term: "Kısa Vadeli Hedefler (1-2 Hafta)",
      medium_term: "Orta Vadeli Hedefler (1-2 Ay)",
      long_term: "Uzun Vadeli Hedefler (3-6 Ay)",
      futureProjection: "Gelecek Gelişim Yorumu",
      conclusion: `Sonuç`,
      title: `baslik`,
      content: `icerik`,
      items: `maddeler`,
      games: `oyunlar`,
      name: `isim`,
      reason: `sebep`,
    },
  },
  en: {
    promptTitle: `Generate Comprehensive Student Progress Report`,
    instructions: `Using the data above, create a progress report summary for [studentName]. The report must include the student's strengths, suggestions for development, suitable game recommendations, a short-medium-long term action plan, and a projection about the student's future development potential. You MUST choose game recommendations ONLY from the 'List of Available Games' provided. Your response MUST be ONLY in the following JSON format, with no other text, explanations, or markdown formatting:`,
    jsonFields: {
      overallAssessment: `Overall Assessment`,
      strengths: `Strengths`,
      developmentSuggestions: `Development Suggestions`,
      recommendedGames: `Recommended Games`,
      actionPlan: "Suggested Action Plan",
      short_term: "Short-term Goals (1-2 Weeks)",
      medium_term: "Medium-term Goals (1-2 Months)",
      long_term: "Long-term Goals (3-6 Months)",
      futureProjection: "Future Development Projection",
      conclusion: `Conclusion`,
      title: `title`,
      content: `content`,
      items: `items`,
      games: `games`,
      name: `name`,
      reason: `reason`,
    },
  },
  es: {
    promptTitle: `Generar Informe Comprendensivo de Progreso del Estudiante`,
    instructions: `Usando los datos anteriores, crea un resumen del informe de progreso para [studentName]. El informe debe incluir las fortalezas del estudiante, sugerencias para el desarrollo, recomendaciones de juegos adecuados, un plan de acción a corto, mediano y largo plazo, y una proyección sobre el potencial de desarrollo futuro del estudiante. DEBES elegir recomendaciones de juegos SOLO de la 'Lista de Juegos Disponibles' proporcionada. Tu respuesta DEBE estar SOLO en el siguiente formato JSON, sin ningún otro texto, explicaciones o formato markdown:`,
    jsonFields: {
      overallAssessment: `Evaluación General`,
      strengths: `Fortalezas`,
      developmentSuggestions: `Sugerencias de Desarrollo`,
      recommendedGames: `Juegos Recomendados`,
      actionPlan: "Plan de Acción Sugerido",
      short_term: "Objetivos a Corto Plazo (1-2 Semanas)",
      medium_term: "Objetivos a Medio Plazo (1-2 Meses)",
      long_term: "Objetivos a Largo Plazo (3-6 Meses)",
      futureProjection: "Proyección de Desarrollo Futuro",
      conclusion: `Conclusión`,
      title: `título`,
      content: `contenido`,
      items: `elementos`,
      games: `juegos`,
      name: `nombre`,
      reason: `razón`,
    },
  },
  fr: {
    promptTitle: `Générer un Rapport Complet sur le Progrès de l'Étudiant`,
    instructions: `En utilisant les données ci-dessus, créez un résumé du rapport de progression pour [studentName]. Le rapport doit inclure les forces de l'élève, les suggestions de développement, les recommandations de jeux appropriées, un plan d'action court, moyen et long terme, et une projection sur le potentiel de développement futur de l'élève. Vous DEVEZ choisir les recommandations de jeux SEULEMENT parmi la 'Liste des Jeux Disponibles' fournie. Votre réponse DOIT être SEULEMENT dans le format JSON suivant, sans aucun autre texte, explication ou formatage markdown:`,
    jsonFields: {
      overallAssessment: `Évaluation Générale`,
      strengths: `Forces`,
      developmentSuggestions: `Suggestions de Développement`,
      recommendedGames: `Jeux Recommandés`,
      actionPlan: "Plan d'Action Suggéré",
      short_term: "Objectifs à Court Terme (1-2 Semaines)",
      medium_term: "Objectifs à Moyen Terme (1-2 Mois)",
      long_term: "Objectifs à Long Terme (3-6 Mois)",
      futureProjection: "Projection sur le Développement Futur",
      conclusion: `Fazit`,
      title: `titre`,
      content: `contenu`,
      items: `éléments`,
      games: `jeux`,
      name: `nom`,
      reason: `raison`,
    },
  },
  de: {
    promptTitle: `Kompletten Schülerfortschrittsbericht erstellen`,
    instructions: `Verwenden Sie die obigen Daten, um einen Fortschrittsberichtszusammenfassung für [studentName] zu erstellen. Der Bericht muss die Stärken des Schülers, Vorschläge für die Entwicklung, geeignete Spielvorschläge, einen kurzen-mittleren-langen Aktionsplan und eine Prognose über den zukünftigen Entwicklungspotenzial des Schülers enthalten. Wählen Sie Spielvorschläge NUR aus der bereitgestellten 'Liste der verfügbaren Spiele'. Ihre Antwort DARF NUR im folgenden JSON-Format sein, ohne weitere Texte, Erläuterungen oder Markdown-Formatierung:`,
    jsonFields: {
      overallAssessment: `Gesamtbeurteilung`,
      strengths: `Stärken`,
      developmentSuggestions: `Entwicklungsvorschläge`,
      recommendedGames: `Empfohlene Spiele`,
      actionPlan: "Vorgeschlagener Aktionsplan",
      short_term: "Kurzfristige Ziele (1-2 Wochen)",
      medium_term: "Mittelfristige Ziele (1-2 Monate)",
      long_term: "Langfristige Ziele (3-6 Monate)",
      futureProjection: "Zukünftige Entwicklungsvorhersage",
      conclusion: `Fazit`,
      title: `titel`,
      content: `inhalt`,
      items: `punkte`,
      games: `spiele`,
      name: `name`,
      reason: `grund`,
    },
  },
}

// YENİ ALANLAR EKLENDİ: Prompt'u güncelliyoruz
function getPromptForJson(studentData: StudentDataForReport, language: string): string {
  const langMap: { [key: string]: any } = {
    tr: {
      promptTitle: `Kapsamlı Öğrenci Gelişim Raporu Oluştur`,
      instructions: `Yukarıdaki verileri kullanarak, [studentName] için bir gelişim raporu özeti oluştur. Rapor; öğrencinin güçlü yönlerini, gelişim önerilerini, uygun oyun önerilerini, kısa-orta-uzun vadeli bir eylem planını ve öğrencinin gelecekteki gelişim potansiyeli üzerine bir yorumu içermelidir. Oyun önerilerini SADECE yukarıda verilen 'Mevcut Oyunların Listesi' içinden seçmelisin. Yanıtın SADECE aşağıda belirtilen JSON formatında olmalıdır, başka hiçbir metin, açıklama veya markdown formatı ekleme:`,
      jsonFields: {
        overallAssessment: `Genel Değerlendirme`,
        strengths: `Güçlü Yönler`,
        developmentSuggestions: `Gelişim Önerileri`,
        recommendedGames: `Önerilen Oyunlar`,
        actionPlan: "Önerilen Eylem Planı",
        short_term: "Kısa Vadeli Hedefler (1-2 Hafta)",
        medium_term: "Orta Vadeli Hedefler (1-2 Ay)",
        long_term: "Uzun Vadeli Hedefler (3-6 Ay)",
        futureProjection: "Gelecek Gelişim Yorumu",
        conclusion: `Sonuç`,
        title: `baslik`,
        content: `icerik`,
        items: `maddeler`,
        games: `oyunlar`,
        name: `isim`,
        reason: `sebep`,
      },
    },
    en: {
      promptTitle: `Generate Comprehensive Student Progress Report`,
      instructions: `Using the data above, create a progress report summary for [studentName]. The report must include the student's strengths, suggestions for development, suitable game recommendations, a short-medium-long term action plan, and a projection about the student's future development potential. You MUST choose game recommendations ONLY from the 'List of Available Games' provided. Your response MUST be ONLY in the following JSON format, with no other text, explanations, or markdown formatting:`,
      jsonFields: {
        overallAssessment: `Overall Assessment`,
        strengths: `Strengths`,
        developmentSuggestions: `Development Suggestions`,
        recommendedGames: `Recommended Games`,
        actionPlan: "Suggested Action Plan",
        short_term: "Short-term Goals (1-2 Weeks)",
        medium_term: "Medium-term Goals (1-2 Months)",
        long_term: "Long-term Goals (3-6 Months)",
        futureProjection: "Future Development Projection",
        conclusion: `Conclusion`,
        title: `title`,
        content: `content`,
        items: `items`,
        games: `games`,
        name: `name`,
        reason: `reason`,
      },
    },
    es: {
      promptTitle: `Generar Informe Comprendensivo de Progreso del Estudiante`,
      instructions: `Usando los datos anteriores, crea un resumen del informe de progreso para [studentName]. El informe debe incluir las fortalezas del estudiante, sugerencias para el desarrollo, recomendaciones de juegos adecuados, un plan de acción a corto, mediano y largo plazo, y una proyección sobre el potencial de desarrollo futuro del estudiante. DEBES elegir recomendaciones de juegos SOLO de la 'Lista de Juegos Disponibles' proporcionada. Tu respuesta DEBE estar SOLO en el siguiente formato JSON, sin ningún otro texto, explicaciones o formato markdown:`,
      jsonFields: {
        overallAssessment: `Evaluación General`,
        strengths: `Fortalezas`,
        developmentSuggestions: `Sugerencias de Desarrollo`,
        recommendedGames: `Juegos Recomendados`,
        actionPlan: "Plan de Acción Sugerido",
        short_term: "Objetivos a Corto Plazo (1-2 Semanas)",
        medium_term: "Objetivos a Medio Plazo (1-2 Meses)",
        long_term: "Objetivos a Largo Plazo (3-6 Meses)",
        futureProjection: "Proyección de Desarrollo Futuro",
        conclusion: `Conclusión`,
        title: `título`,
        content: `contenido`,
        items: `elementos`,
        games: `juegos`,
        name: `nombre`,
        reason: `razón`,
      },
    },
    fr: {
      promptTitle: `Générer un Rapport Complet sur le Progrès de l'Étudiant`,
      instructions: `En utilisant les données ci-dessus, créez un résumé du rapport de progression pour [studentName]. Le rapport doit inclure les forces de l'élève, les suggestions de développement, les recommandations de jeux appropriées, un plan d'action court, moyen et long terme, et une projection sur le potentiel de développement futur de l'élève. Vous DEVEZ choisir les recommandations de jeux SEULEMENT parmi la 'Liste des Jeux Disponibles' fournie. Votre réponse DOIT être SEULEMENT dans le format JSON suivant, sans aucun autre texte, explication ou formatage markdown:`,
      jsonFields: {
        overallAssessment: `Évaluation Générale`,
        strengths: `Forces`,
        developmentSuggestions: `Suggestions de Développement`,
        recommendedGames: `Jeux Recommandés`,
        actionPlan: "Plan d'Action Suggéré",
        short_term: "Objectifs à Court Terme (1-2 Semaines)",
        medium_term: "Objectifs à Moyen Terme (1-2 Mois)",
        long_term: "Objectifs à Long Terme (3-6 Mois)",
        futureProjection: "Projection sur le Développement Futur",
        conclusion: `Fazit`,
        title: `titre`,
        content: `contenu`,
        items: `éléments`,
        games: `jeux`,
        name: `nom`,
        reason: `raison`,
      },
    },
    de: {
      promptTitle: `Kompletten Schülerfortschrittsbericht erstellen`,
      instructions: `Verwenden Sie die obigen Daten, um einen Fortschrittsberichtszusammenfassung für [studentName] zu erstellen. Der Bericht muss die Stärken des Schülers, Vorschläge für die Entwicklung, geeignete Spielvorschläge, einen kurzen-mittleren-langen Aktionsplan und eine Prognose über den zukünftigen Entwicklungspotenzial des Schülers enthalten. Wählen Sie Spielvorschläge NUR aus der bereitgestellten 'Liste der verfügbaren Spiele'. Ihre Antwort DARF NUR im folgenden JSON-Format sein, ohne weitere Texte, Erläuterungen oder Markdown-Formatierung:`,
      jsonFields: {
        overallAssessment: `Gesamtbeurteilung`,
        strengths: `Stärken`,
        developmentSuggestions: `Entwicklungsvorschläge`,
        recommendedGames: `Empfohlene Spiele`,
        actionPlan: "Vorgeschlagener Aktionsplan",
        short_term: "Kurzfristige Ziele (1-2 Wochen)",
        medium_term: "Mittelfristige Ziele (1-2 Monate)",
        long_term: "Langfristige Ziele (3-6 Monate)",
        futureProjection: "Zukünftige Entwicklungsvorhersage",
        conclusion: `Fazit`,
        title: `titel`,
        content: `inhalt`,
        items: `punkte`,
        games: `spiele`,
        name: `name`,
        reason: `grund`,
      },
    },
  }

  const l = langMap[language] || langMap.en

  // Not: Prompt'un başlık bölümü sadeleştirildi.
  return `
# ${l.promptTitle}
Student Data: ${JSON.stringify(studentData, null, 2)}
---
${l.instructions}
\`\`\`json
{
  "overallAssessment": { "title": "${l.jsonFields.overallAssessment}", "content": "..." },
  "strengths": { "title": "${l.jsonFields.strengths}", "content": "...", "items": ["..."] },
  "developmentSuggestions": { "title": "${l.jsonFields.developmentSuggestions}", "content": "...", "items": ["..."] },
  "recommendedGames": { "title": "${l.jsonFields.recommendedGames}", "content": "...", "games": [{ "name": "...", "reason": "..." }] },
  "actionPlan": {
    "title": "${l.jsonFields.actionPlan}",
    "short_term": { "title": "${l.jsonFields.short_term}", "items": ["..."] },
    "medium_term": { "title": "${l.jsonFields.medium_term}", "items": ["..."] },
    "long_term": { "title": "${l.jsonFields.long_term}", "items": ["..."] }
  },
  "futureProjection": { "title": "${l.jsonFields.futureProjection}", "content": "..." },
  "conclusion": { "title": "${l.jsonFields.conclusion}", "content": "..." }
}
\`\`\`
`
}

export async function generateStudentReportSummary(
  studentData: StudentDataForReport,
  language: keyof typeof languagePrompts = "en",
): Promise<{ summary: string } | { error: string }> {
  console.log(`Generating report for student ${studentData.name} in ${language}...`)

  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const prompts = languagePrompts[language] || languagePrompts.en

      const studentDataString = `
      - Name: ${studentData.name}
      - Grade: ${studentData.grade || "N/A"}
      - Overall Average Score: ${studentData.avg_score || "N/A"}%
      - Total Games Played: ${studentData.games_played || 0}
      - Identified Strengths: ${studentData.strengths.join(", ") || "None identified yet."}
      - Areas for Improvement: ${studentData.developmentAreas.join(", ") || "None identified yet."}
      - Badges: ${studentData.badges?.join(", ") || "None."}
      - Subject Scores: ${
        studentData.subjectScores && studentData.subjectScores.length > 0
          ? studentData.subjectScores.map((s) => `${s.subject}: ${s.score}%`).join(", ")
          : "N/A"
      }
      - Recent Game Performance and Skills Shown:
        ${
          studentData.gameScores && studentData.gameScores.length > 0
            ? studentData.gameScores
                .map(
                  (game) => `  - Game: ${game.game}, Score: ${game.score}%, Skills: ${game.skills.join(", ") || "N/A"}`,
                )
                .join("\n")
            : "No recent game data available."
        }
      - Overall Skills: ${
        studentData.skills && studentData.skills.length > 0
          ? studentData.skills.map((s) => `${s.skill}: ${s.score}%`).join(", ")
          : "N/A"
      }
    `

      const prompt = `
      ${prompts.system}

      Student Data:
      ${studentDataString}

      Generate the report now.
    `

      const result = await model.generateContent(prompt)
      const response = result.response
      const summary = response.text()

      if (!summary) {
        console.error(`Received empty response from Gemini API on attempt ${attempt}.`)
        // Don't retry on empty response, it's likely a content issue.
        return { error: "Failed to generate summary: Empty response from AI model." }
      }

      console.log(`Report generated successfully for student ${studentData.name}.`)
      return { summary } // Success! Exit the function.
    } catch (error: any) {
      lastError = error
      console.error(`Error on attempt ${attempt} communicating with Gemini API:`, error.message)

      // Check for retryable errors (503 for overloaded, 429 for rate limited)
      const isRetryable = error.message.includes("503") || error.message.includes("429")

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000 // Exponential backoff with jitter
        console.log(`Model is busy. Retrying in ${Math.round(delay / 1000)}s...`)
        await sleep(delay)
      } else {
        // Not a retryable error or max retries reached, break the loop and handle the error below.
        break
      }
    }
  }

  // If the loop finished due to an error
  console.error("Failed to communicate with Gemini API after all retries:", lastError)

  let errorMessage = "Failed to communicate with the AI model after several attempts."
  if (lastError) {
    if (lastError.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key. Please check your server configuration."
    } else if (lastError.message.includes("429") || lastError.message.includes("503")) {
      errorMessage = "The AI model is currently busy. Please try again in a few moments."
    } else if (lastError.message.includes("500")) {
      errorMessage = "The AI model server encountered an error. Please try again later."
    }
  }

  return { error: errorMessage }
}

// `generateStudentReportJson` fonksiyonu aynı kalır, çünkü sadece prompt'u değiştirmemiz yeterli.
export async function generateStudentReportJson(
  studentData: StudentDataForReport,
  language: keyof typeof languagePrompts = "en",
): Promise<{ report?: AIReport; error?: string }> {
  console.log(`Generating JSON report for student ${studentData.name} in ${language}...`)

  try {
    const generationConfig: GenerationConfig = {
      response_mime_type: "application/json",
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig })

    const prompt = getPromptForJson(studentData, language)

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    const report: AIReport = JSON.parse(responseText)

    console.log(`JSON report generated successfully for student ${studentData.name}.`)
    return { report }
  } catch (error: any) {
    console.error("Error generating or parsing JSON report from Gemini API:", error)
    let errorMessage = "Failed to generate AI report."
    if (error.message.includes("JSON")) {
      errorMessage = "Failed to process AI response. The format was invalid."
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key. Please check your server configuration."
    }
    return { error: errorMessage }
  }
}
