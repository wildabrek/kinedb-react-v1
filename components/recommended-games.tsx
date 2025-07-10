"use client"

import { useEffect, useState } from "react"
import { getRecommendedGames, getAllGames } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import {Gamepad2Icon as GameController2, Trophy} from "lucide-react"

interface Game {
  game_id: number
  game_name: string
  description?: string
}

interface RecommendedGamesProps {
  studentId: number
}

interface RecommendedGame {
  id: number
  student_id: number
  game_id: number
  recommendation_date?: string
  reason?: string
  priority?: number
  status?: string
  recommended_by?: number
  target_skill_id?: number
  target_area_id?: number
}

export function RecommendedGames({ studentId }: RecommendedGamesProps) {
  const [games, setGames] = useState<RecommendedGame[]>([])
  const [gameList, setGameList] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recommended, allGames] = await Promise.all([
          getRecommendedGames(studentId),
          getAllGames(),
        ])
        setGames(recommended)
        setGameList(allGames)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [studentId])

  const getGameName = (id: number) => {
    return gameList.find((g) => g.game_id === id)?.game_name || `Game #${id}`
  }

  return (
    <div className="space-y-2">
      {games.map((game) => (
        <div key={game.game_id} className="flex flex-wrap gap-3">
          <button
            className="flex items-center gap-2 bg-muted/80 px-4 py-2 rounded-full hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium">{getGameName(game.game_id)}</span>
          </button>
        </div>
      ))}
    </div>
  )
}
