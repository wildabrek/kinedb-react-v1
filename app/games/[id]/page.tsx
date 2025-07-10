"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Edit, Pencil, Trash2, Settings, Play } from "lucide-react"
import Link from "next/link"
import { useActions } from "@/contexts/action-context"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { PerformanceChart } from "@/components/performance-chart"
// Import API functions from lib/api
import { getGameById, getGameSkills, getRecentPlayers, deleteGame } from "@/lib/api"
import type { Game } from "@/lib/api"

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { id } = useParams()
  const { deleteItem, editItem, configureItem, exportData } = useActions()
  const [activeTab, setActiveTab] = useState("overview")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const gameId = Number.parseInt(id as string)
  // Initialize state with proper types
  const [gameData, setGameData] = useState<Game | null>(null)
  const [gameSkills, setGameSkills] = useState<string[]>([])
  const [recentPlayers, setRecentPlayers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [game, setGame] = useState<GameType | null>(null)

  useEffect(() => {
    if (!id) return
    getGameById(Number(id)).then(setGame).catch(console.error)
  }, [id])
  // Fetch game data, skills, and recent players
  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true)
      try {
        // Fetch game details
        const game = await getGameById(Number(gameId))

        if (!game) {
          setError("Game not found")
          setIsLoading(false)
          return
        }

        setGameData(game)

        // Fetch game skills
        try {
          const skillsData = await getGameSkills(gameId)
          if (skillsData) {
            setGameSkills(skillsData.map((skill) => skill.skill))
          }
        } catch (skillError) {
          console.error("Error fetching game skills:", skillError)
          // Don't set error state, just log it - we still have the game data
        }

        // Fetch recent players
        try {
          const playersData = await getRecentPlayers(gameId)
          if (playersData) {
            // Format the players data for display
            const formattedPlayers = await Promise.all(
              playersData.map(async (player) => {
                return {
                  id: player.student_id,
                  name: player.name || `Student ${player.student_id}`,
                  date: new Date(player.played_at || Date.now()).toLocaleDateString(),
                  score: player.score,
                }
              }),
            )
            setRecentPlayers(formattedPlayers)
          }
        } catch (playersError) {
          console.error("Error fetching recent players:", playersError)
          // Don't set error state, just log it - we still have the game data
        }
      } catch (error) {
        console.error("Error fetching game data:", error)
        setError("Failed to load game data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load game data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameData()
  }, [gameId, toast])

  // Set the active tab based on the URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "players", "analytics"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleEditGame = () => {
    editItem("game", id)
  }

  const handleConfigureGame = () => {
    configureItem("game", id)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteGame(gameId)
      toast({
        title: "Game deleted",
        description: `${gameData?.game_name || "Game"} has been deleted successfully.`,
      })
      setDeleteDialogOpen(false)
      router.push("/games")
    } catch (error) {
      console.error("Error deleting game:", error)
      toast({
        title: "Error",
        description: "Failed to delete game. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    exportData("game", id)
  }

  const handlePlayGame = () => {
    // Navigate to the play setup page instead of showing a toast
    router.push(`/games/${id}/play-setup`)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to games</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Game Details</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading game details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !gameData) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to games</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Game Details</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Game Not Found</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {error || "The requested game could not be found or has been deleted."}
            </p>
            <Button asChild>
              <Link href="/games">Return to Games</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to games</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Game Details</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" onClick={handleConfigureGame}>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button size="sm" onClick={handleEditGame}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Game
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Game info card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{gameData.game_name}</CardTitle>
              <CardDescription>{gameData.description || "No description available"}</CardDescription>
            </div>
            <Badge variant={gameData.status === "active" ? "default" : "secondary"}>
              {gameData.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Subject</div>
              <div className="font-medium">{gameData.subject || "Not specified"}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="font-medium">{gameData.level || "Not specified"}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Creator</div>
              <div className="font-medium">{gameData.creator || "Unknown"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <p className="text-sm font-medium">Total Plays</p>
                <p className="text-xl font-bold">{gameData.plays || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-xl font-bold">{gameData.avg_score ? `${gameData.avg_score?.toFixed(1)}%` : "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <p className="text-sm font-medium">Average Time</p>
                <p className="text-xl font-bold">{gameData.avg_time || "N/A"}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Overview, Players, Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Recent Players</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Game Skills</CardTitle>
              <CardDescription>Skills practiced in this game</CardDescription>
            </CardHeader>
            <CardContent>
              {gameSkills && gameSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gameSkills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No skills have been added to this game.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle>Recent Players</CardTitle>
              <CardDescription>Students who recently played this game</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPlayers && recentPlayers.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-left font-medium">Date</th>
                        <th className="p-3 text-left font-medium">Score</th>
                        <th className="p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPlayers.map((player: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{player.name}</td>
                          <td className="p-3">{player.date}</td>
                          <td className="p-3">{player.score}%</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/students/${player.id}`}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">View Student</span>
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No recent players for this game.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Game Analytics</CardTitle>
              <CardDescription>Performance metrics for this game</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart
                title="Game Performance"
                description="Student performance in this game over time"
                gameId={id as string}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handlePlayGame}>
          <Play className="mr-2 h-4 w-4" />
          Play Game
        </Button>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Game"
        description={`Are you sure you want to delete ${gameData.game_name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
