// types/index.ts
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
