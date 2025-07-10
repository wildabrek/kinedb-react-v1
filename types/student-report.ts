// /types/student-report.ts

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
  actionPlan?: {
    title: string
    short_term: {
      title: string
      items: string[]
    }
    medium_term: {
      title: string
      items: string[]
    }
    long_term: {
      title: string
      items: string[]
    }
  }
  recommendedGames: {
    title: string
    content: string
    games: { name: string; reason: string }[]
  }
  futureProjection?: {
    title: string
    content: string
  }
  conclusion: {
    title: string
    content: string
  }
}
