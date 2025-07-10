/**
 * Utility functions for game score persistence
 */

// Type for storing game scores
export interface StoredGameScores {
  [gameId: string]: {
    [studentId: string]: number
  }
}

// Save a finalized score to localStorage
export function saveGameScore(gameId: number | string, studentId: number | string, score: number): boolean {
  try {
    const storedScores: StoredGameScores = JSON.parse(localStorage.getItem("finalizedGameScores") || "{}")
    const gameKey = `game_${gameId}`

    if (!storedScores[gameKey]) {
      storedScores[gameKey] = {}
    }

    storedScores[gameKey][studentId] = score
    localStorage.setItem("finalizedGameScores", JSON.stringify(storedScores))

    console.log(`Score finalized and persisted for student ${studentId} in game ${gameId}: ${score}`)
    return true
  } catch (err) {
    console.error("Failed to persist score to localStorage:", err)
    return false
  }
}

// Get all finalized scores for a specific game
export function getGameScores(gameId: number | string): Record<string, number> | null {
  try {
    const storedScores: StoredGameScores = JSON.parse(localStorage.getItem("finalizedGameScores") || "{}")
    const gameKey = `game_${gameId}`

    return storedScores[gameKey] || null
  } catch (err) {
    console.error("Failed to retrieve game scores:", err)
    return null
  }
}

// Get a specific student's finalized score
export function getStudentGameScore(gameId: number | string, studentId: number | string): number | null {
  try {
    const storedScores: StoredGameScores = JSON.parse(localStorage.getItem("finalizedGameScores") || "{}")
    const gameKey = `game_${gameId}`

    if (storedScores[gameKey] && storedScores[gameKey][studentId] !== undefined) {
      return storedScores[gameKey][studentId]
    }

    return null
  } catch (err) {
    console.error("Failed to retrieve student score:", err)
    return null
  }
}

// Clear all finalized scores for a specific game
export function clearGameScores(gameId: number | string): boolean {
  try {
    const storedScores: StoredGameScores = JSON.parse(localStorage.getItem("finalizedGameScores") || "{}")
    const gameKey = `game_${gameId}`

    if (storedScores[gameKey]) {
      delete storedScores[gameKey]
      localStorage.setItem("finalizedGameScores", JSON.stringify(storedScores))
      return true
    }

    return false
  } catch (err) {
    console.error("Failed to clear game scores:", err)
    return false
  }
}

// Check if a student has a finalized score
export function hasStudentFinishedGame(gameId: number | string, studentId: number | string): boolean {
  return getStudentGameScore(gameId, studentId) !== null
}
