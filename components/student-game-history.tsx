"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gamepad2Icon as GameController2, Star, Clock, Info, Play, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useActions } from "@/contexts/action-context"
import { useLanguage } from "@/contexts/language-context"
import { getStudentGamePlays, getGameById } from "@/lib/api"

interface GameHistoryItem {
  id: number
  game: string
  gameId: number
  subject: string
  score: number
  duration: string
  date: string
  details?: string
}

interface StudentGameHistoryProps {
  studentId: number
}

export default function StudentGameHistory({ studentId }: StudentGameHistoryProps) {
  const { translate:t } = useLanguage()
  const { toast } = useToast()
  const { viewDetails } = useActions()
  const [selectedGame, setSelectedGame] = useState<GameHistoryItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGameHistory() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch student game plays from API
        const gamePlays = await getStudentGamePlays(studentId)

        if (gamePlays && gamePlays.length > 0) {
          // Process game plays to get game details
          const historyItems = await Promise.all(
            gamePlays.map(async (play) => {
              // Get game details
              const game = await getGameById(play.game_id)

              return {
                id: play.id,
                game: game?.game_name || `Game ${play.game_id}`,
                gameId: play.game_id,
                subject: game?.subject || "Unknown",
                score: play.score,
                duration: play.duration || "15 min",
                date: new Date(play.played_at).toLocaleDateString(),
                details: `Played ${game?.game_name || `Game ${play.game_id}`} with a score of ${play.score}%.`,
              }
            }),
          )

          // Sort by date (most recent first)
          historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          setGameHistory(historyItems)
        } else {
          // If no data, set empty array
          setGameHistory([])
        }
      } catch (err) {
        console.error("Error fetching game history:", err)
        setError("Failed to load game history")
        setGameHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameHistory()
  }, [studentId])

  const handlePlayAgain = (gameId: number) => {
    toast({
      title: t("Starting Game"),
      description: `${t("Launching game session for")} ${gameHistory.find((g) => g.gameId === gameId)?.game}`,
    })
  }

  const handleViewDetails = (game: GameHistoryItem) => {
    setSelectedGame(game)
    setDetailsOpen(true)
  }

  const handleViewGameDetails = (gameId: number) => {
    viewDetails("game", gameId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (gameHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <GameController2 className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
        <p className="text-muted-foreground">{t("No game history available")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("This student hasn't played any games yet")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {gameHistory.map((activity, index) => (
        <div
          key={activity.id ?? `${activity.gameId}-${activity.playedAt ?? index}`}
          className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
        >
          <div className="bg-primary/10 p-2 rounded-md">
            <GameController2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{activity.game}</div>
              <Badge variant="outline">{activity.subject}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>
                  {t("Score")}: {activity.score}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {t("Duration")}: {activity.duration}
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">{activity.date}</div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewDetails(activity)}>
              <Info className="h-4 w-4" />
              <span className="sr-only">{t("View Details")}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handlePlayAgain(activity.gameId)}>
              <Play className="h-4 w-4" />
              <span className="sr-only">{t("Play Again")}</span>
            </Button>
          </div>
        </div>
      ))}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGame?.game} {t("Details")}
            </DialogTitle>
            <DialogDescription>
              {t("Session from")} {selectedGame?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">{t("Subject")}</p>
                <p className="text-sm">{selectedGame?.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("Score")}</p>
                <p className="text-sm">{selectedGame?.score}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("Duration")}</p>
                <p className="text-sm">{selectedGame?.duration}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("Date")}</p>
                <p className="text-sm">{selectedGame?.date}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{t("Session Details")}</p>
              <p className="text-sm">{selectedGame?.details}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              {t("Close")}
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => selectedGame && handleViewGameDetails(selectedGame.gameId)}>
                <Info className="mr-2 h-4 w-4" />
                {t("Game Details")}
              </Button>
              <Button onClick={() => selectedGame && handlePlayAgain(selectedGame.gameId)}>
                <Play className="mr-2 h-4 w-4" />
                {t("Play Again")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
