import dummyData from "@/data/dummy-data.json"

// Type definitions for our data
export interface Student {
  id: string
  name: string
  grade: string
  class: string
  avatar: string
  teacher: string
  joinDate: string
  totalGamesPlayed: number
  avgScore: number
  avgTimePerSession: string
  lastActive: string
  status: string
  email: string
  phone: string
  badges: string[]
  strengths: string[]
  areasToImprove: string[]
  subjectScores: { subject: string; score: number }[]
  recentActivity: { date: string; activity: string }[]
}

export interface StudentListItem {
  id: number
  name: string
  grade: string
  avgScore: number
}

export interface RecentGame {
  id: number
  name: string
  date: string
  avgScore: number
}

export interface Class {
  id: number
  name: string
  teacher: string
  students: number
  avgScore: number
  gamesPlayed: number
  lastActive: string
  status: string
  description: string
  schedule: string
  location: string
  studentList?: StudentListItem[]
  recentGames?: RecentGame[]
}

export interface Game {
  id: number
  name: string
  subject: string
  level: string
  plays: number
  avgScore: number
  avgTime: string
  status: string
  description: string
  lastUpdated: string
  creator: string
  skills: string[]
  recentPlayers?: {
    id: number
    name: string
    date: string
    score: number
  }[]
}

export interface GameHistory {
  id: number
  game: string
  date: string
  score: number
  duration: string
  subject: string
  details: string
}

export interface RecentActivity {
  id: number
  type: string
  title: string
  description: string
  time: string
}

export interface TopPerformer {
  id: number
  name: string
  score: number
  avatar: string
}

export interface DashboardStats {
  totalStudents: number
  newStudentsThisWeek: number
  totalClasses: number
  activeClasses: number
  totalGames: number
  newGames: number
  averageScore: number
  scoreChangePercentage: number
}

export interface Project {
  id: number
  name: string
  students: number
  completion: number
  avgScore: number
}

// Export typed data
export const students = dummyData.students as Student[]
export const classes = dummyData.classes as Class[]
export const games = dummyData.games as Game[]
export const gameHistory = dummyData.gameHistory as GameHistory[]
export const recentActivity = dummyData.recentActivity as RecentActivity[]
export const topPerformers = dummyData.topPerformers as {
  math: TopPerformer[]
  english: TopPerformer[]
  science: TopPerformer[]
}
export const dashboardStats = dummyData.dashboardStats as DashboardStats
export const projects = dummyData.projects as Project[]

// Helper functions to get data by ID
export const getStudentById = (id: string): Student | undefined => {
  return students.find((student) => student.id === id)
}

export const getClassById = (id: number): Class | undefined => {
  return classes.find((cls) => cls.id === id)
}

export const getGameById = (id: number): Game | undefined => {
  return games.find((game) => game.id === id)
}

// Fallback data for when a game is not found
export const fallbackGame: Game = {
  id: 0,
  name: "Game Not Found",
  subject: "Unknown",
  level: "Unknown",
  plays: 0,
  avgScore: 0,
  avgTime: "0 min",
  status: "inactive",
  description: "This game could not be found",
  lastUpdated: "Unknown",
  creator: "Unknown",
  skills: [],
  recentPlayers: [],
}

export default dummyData
