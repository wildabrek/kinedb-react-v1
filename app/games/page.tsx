"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  Download,
  Filter,
  Gamepad2Icon as GameController2,
  MoreHorizontal,
  PlusCircle,
  Search,
  Settings,
  Eye,
  Pencil,
  Trash2,
  Play,
  BarChart,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { getGames, deleteGame, type Game } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

export default function GamesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [allGames, setAllGames] = useState<Game[]>([])
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { translate: t } = useLanguage()

  // Fetch games data
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true)
        const gamesData = await getGames()

        // Format the games data to match the expected structure
        const formattedGames = gamesData.map((game) => ({
          ...game,
          id: game.game_id,
          name: game.game_name,
          subject: game.subject || "General",
          level: game.level || "Beginner",
          plays: game.plays || 0,
          avgScore: game.avg_score || 0,
          avgTime: game.avg_time || "0:00",
          status: game.status || "active",
        }))

        setAllGames(formattedGames)
        setFilteredGames(formattedGames)
      } catch (error) {
        console.error("Error fetching games:", error)
        setError("Failed to load games. Please try again.")
        toast({
          title: t("Error"),
          description: t("Failed to load games."),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [t, toast])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === "") {
      setFilteredGames(allGames)
    } else {
      const filtered = allGames.filter(
        (game) =>
          game.name.toLowerCase().includes(query.toLowerCase()) ||
          (game.subject && game.subject.toLowerCase().includes(query.toLowerCase())),
      )
      setFilteredGames(filtered)
    }
  }

  const handleAddGame = () => {
    toast({
      title: t("Create New Game"),
      description: t("Creating a new game"),
    })
    router.push("/games/create")
  }

  const handleExport = () => {
    toast({
      title: t("Export Started"),
      description: t("Exporting game data as CSV"),
    })

    // Simulate export process
    setTimeout(() => {
      toast({
        title: t("Export Complete"),
        description: t("Game data has been exported successfully"),
      })
    }, 1500)
  }

  const handleFilter = () => {
    toast({
      title: t("Filter Games"),
      description: t("Opening filter options"),
    })
    // In a real app, this would open a filter dialog
  }

  const handleDeleteClick = (game: any) => {
    setSelectedGame(game)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedGame) {
      try {
        await deleteGame(selectedGame.id)

        toast({
          title: t("Game Deleted"),
          description: t("Game {{name}} has been deleted successfully", { name: selectedGame.game_name }),
        })

        // Remove the deleted game from the filtered list
        setFilteredGames((prev) => prev.filter((g) => g.id !== selectedGame.id))
        setAllGames((prev) => prev.filter((g) => g.id !== selectedGame.id))
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error("Error deleting game:", error)
        toast({
          title: t("Error"),
          description: t("Failed to delete game. Please try again."),
          variant: "destructive",
        })
      }
    }
  }

  const handlePlayGame = (gameId: number) => {
    // Navigate to the play setup page
    router.push(`/games/${gameId}/play-setup`)
  }

  const handleViewDetails = (gameId: number) => {
  const game = allGames.find((g) => g.id === gameId)
  if (!game) {
    toast({
      title: t("Error"),
      description: t("Game not found."),
      variant: "destructive",
    })
    return
  }

  toast({
    title: t("Viewing Details"),
    description: `${t("Navigating to game details for")} ${game.name}`,
  })
  router.push(`/games/${gameId}`)
}


  const handleEditGame = (gameId: number) => {
    const game = allGames.find((g) => g.id === gameId)
    toast({
      title: t("Edit Game"),
      description: t("Editing game information for {{name}}", { name: game?.name }),
    })
    router.push(`/games/${gameId}/edit`)
  }

  const handleConfigureGame = (gameId: number) => {
    const game = allGames.find((g) => g.id === gameId)
    toast({
      title: t("Configure Game"),
      description: t("Configuring settings for {{name}}", { name: game?.name }),
    })
    router.push(`/games/${gameId}/configure`)
  }

  const handleViewAnalytics = (gameId: number) => {
    const game = allGames.find((g) => g.id === gameId)
    toast({
      title: t("View Analytics"),
      description: t("Viewing analytics for {{name}}", { name: game?.name }),
    })
    // Make sure this route exists or create it
    router.push(`/games/${gameId}?tab=analytics`)
  }

  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === id ? null : id)
  }

  // Close menu when clicking outside
  const handleClickOutside = () => {
    setOpenMenuId(null)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">{t("Loading games...")}</h2>
        <p className="text-muted-foreground">{t("Please wait while we fetch the games data")}</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">{t("Error loading games")}</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>{t("Try Again")}</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" onClick={handleClickOutside}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("Games")}</h1>
        <Button onClick={handleAddGame}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("Add Game")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("Search games...")}
            className="w-full pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleFilter}>
            <Filter className="h-4 w-4" />
            {t("Filter")}
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {t("Export")}
          </Button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/10">
          <GameController2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("No games found")}</h3>
          <p className="text-muted-foreground mb-6">{t("Try adjusting your search or filters")}</p>
          <Button onClick={handleAddGame}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("Add Game")}
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Game")}</TableHead>
                <TableHead>{t("Subject")}</TableHead>
                <TableHead>{t("Level")}</TableHead>
                <TableHead>{t("Total Plays")}</TableHead>
                <TableHead>{t("Avg. Score")}</TableHead>
                <TableHead>{t("Avg. Time")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <GameController2 className="h-5 w-5 text-slate-600" />
                      </div>
                      <span className="font-medium">{game.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{t(game.subject || "")}</TableCell>
                  <TableCell>{game.level}</TableCell>
                  <TableCell>{game.plays}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full ${
                            game.avgScore >= 80
                              ? "bg-green-500"
                              : game.avgScore >= 70
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                          }`}
                          style={{ width: `${game.avgScore}%` }}
                        />
                      </div>
                      <span>{game.avgScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{game.avgTime}</TableCell>
                  <TableCell>
                    <Badge variant={game.status === "active" ? "default" : "secondary"}>
                      {game.status === "active" ? t("Active") : t("Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => toggleMenu(game.id, e)}>
                        <span className="sr-only">{t("Open menu")}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === game.id && (
                        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDetails(game.id)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {t("View Details")}
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditGame(game.id)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("Edit")}
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleConfigureGame(game.id)
                              }}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              {t("Settings")}
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewAnalytics(game.id)
                              }}
                            >
                              <BarChart className="mr-2 h-4 w-4" />
                              {t("Analytics")}
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayGame(game.id)
                              }}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              {t("Play Game")}
                            </button>
                            <hr className="my-1" />
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(game)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("Delete")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("Delete Game")}
        description={t("Are you sure you want to delete {{name}}? This action cannot be undone.", {
          name: selectedGame?.name,
        })}
        onConfirm={handleDeleteConfirm}
        confirmText={t("Delete")}
        variant="destructive"
      />
    </div>
  )
}
