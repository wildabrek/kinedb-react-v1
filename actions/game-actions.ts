"use server"

import { redirect } from "next/navigation"
import { updateGame } from "@/lib/api"

export async function updateGameAction(gameId: string, formData: FormData) {
  try {
    // Extract form data
    const gameData = {
      game_name: formData.get("game_name") as string,
      level: formData.get("level") as string,
      genre: formData.get("genre") as string,
      description: formData.get("description") as string,
      main_subject: formData.get("main_subject") as string,
    }

    // Extract subjects_boost (key-value pairs)
    const subjects_boost: { [key: string]: number } = {}
    const subjectKeys = Array.from(formData.keys()).filter((key) => key.startsWith("subjects_boost_"))
    subjectKeys.forEach((key) => {
      const subject = key.replace("subjects_boost_", "")
      const value = Number.parseInt(formData.get(key) as string)
      if (!isNaN(value)) {
        subjects_boost[subject] = value
      }
    })

    // Extract skills_boost (key-value pairs)
    const skills_boost: { [key: string]: number } = {}
    const skillKeys = Array.from(formData.keys()).filter((key) => key.startsWith("skills_boost_"))
    skillKeys.forEach((key) => {
      const skill = key.replace("skills_boost_", "")
      const value = Number.parseInt(formData.get(key) as string)
      if (!isNaN(value)) {
        skills_boost[skill] = value
      }
    })

    // Extract add_strengths (array of IDs)
    const add_strengths: string[] = []
    const strengthKeys = Array.from(formData.keys()).filter((key) => key.startsWith("add_strengths_"))
    strengthKeys.forEach((key) => {
      const strengthId = key.replace("add_strengths_", "")
      if (formData.get(key) === "on") {
        add_strengths.push(strengthId)
      }
    })

    // Extract add_areas_on_low_score (array of IDs)
    const add_areas_on_low_score: string[] = []
    const areaKeys = Array.from(formData.keys()).filter((key) => key.startsWith("add_areas_on_low_score_"))
    areaKeys.forEach((key) => {
      const areaId = key.replace("add_areas_on_low_score_", "")
      if (formData.get(key) === "on") {
        add_areas_on_low_score.push(areaId)
      }
    })

    // Extract recommendations (array of game names)
    const recommendations: string[] = []
    const recoKeys = Array.from(formData.keys()).filter((key) => key.startsWith("recommendations_"))
    recoKeys.forEach((key) => {
      const gameName = key.replace("recommendations_", "")
      if (formData.get(key) === "on") {
        recommendations.push(gameName)
      }
    })

    // Combine all data
    const updateData = {
      ...gameData,
      gameImpacts: {
        main_subject: gameData.main_subject,
        subjects_boost,
        skills_boost,
        add_strengths,
        add_areas_on_low_score,
        recommendations,
      },
    }

    // Update the game
    await updateGame(gameId, updateData)

    // Redirect to the game details page
    redirect(`/games/${gameId}`)
  } catch (error) {
    console.error("Error updating game:", error)
    throw new Error("Failed to update game")
  }
}
