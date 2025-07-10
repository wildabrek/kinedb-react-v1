"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  GamepadIcon as GameController,
  Info,
  Edit,
  Trash2,
  List,
  Plus,
  ExternalLink,
  Star,
  Target,
  AlertCircle,
} from "lucide-react"
import { getGameImpacts } from "@/lib/api"
import type { GameImpact } from "@/lib/api"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function GameImpactsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [gameImpacts, setGameImpacts] = useState<Record<string, GameImpact>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { translate: t } = useLanguage()

  useEffect(() => {
    async function loadGameImpacts() {
      try {
        setLoading(true)
        setError(null)

        const data = await getGameImpacts()
        setGameImpacts(data)
      } catch (error) {
        console.error("Error loading game impacts:", error)
        setError(t("Failed to load game impacts. Please try again."))
        toast({
          title: t("Error"),
          description: t("Failed to load game impacts. Please try again."),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadGameImpacts()
  }, [toast, t])

  const handleDeleteGameImpact = async (gameName: string) => {
    if (
      !confirm(t(`Are you sure you want to delete the game impact for "${gameName}"?\n\nThis action cannot be undone.`))
    ) {
      return
    }

    try {
      setLoading(true)
      // In a real app, this would be an API call to delete the game impact
      // await deleteGameImpact(gameName)

      // Simulate API call success
      setTimeout(() => {
        const newGameImpacts = { ...gameImpacts }
        delete newGameImpacts[gameName]
        setGameImpacts(newGameImpacts)
        toast({
          title: t("Success"),
          description: t(`Game impact for "${gameName}" deleted successfully.`),
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error deleting game impact:", error)
      toast({
        title: t("Error"),
        description: t("Failed to delete game impact. Please try again."),
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (loading && Object.keys(gameImpacts).length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">{t("Loading game impacts...")}</p>
        </div>
      </div>
    )
  }

  if (error && Object.keys(gameImpacts).length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/dashboard")}>{t("Return to Dashboard")}</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <GameController className="mr-2 h-6 w-6 text-purple-500" />
          {t("Manage Game Impacts")}
        </h1>
        <Button onClick={() => router.push("/game-impacts/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {t("Add New Game Impact")}
        </Button>
      </div>

      <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t(
            "Game impacts define how each game affects student learning, including subject boosts, skill boosts, strengths, and areas for improvement. These settings determine how student profiles are updated when they play games. Changes here update the <code>game_impacts.json</code> file.",
          )}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 py-3">
            <div className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              <CardTitle className="text-sm">{t("Manage Related Data")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" asChild className="justify-start">
                <Link href="/strengths/manage-possible">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  {t("Manage Possible Strengths")}
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href="/strengths/manage-areas">
                  <Target className="h-4 w-4 mr-2 text-blue-500" />
                  {t("Manage Possible Development Areas")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 py-3">
            <div className="flex items-center">
              <Info className="mr-2 h-4 w-4" />
              <CardTitle className="text-sm">{t("Quick Help")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("Each game can have one impact configuration")}</li>
              <li>{t("Subject boosts determine how much a subject score improves")}</li>
              <li>{t("Strengths are added to student profiles when they excel")}</li>
              <li>{t("Development areas are added when students struggle")}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center">
            <GameController className="mr-2 h-4 w-4" />
            <CardTitle>{t("Game Impacts")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {Object.keys(gameImpacts).length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">{t("Game Name")}</TableHead>
                    <TableHead className="w-[15%]">{t("Main Subject")}</TableHead>
                    <TableHead className="w-[20%]">{t("Subject Boosts")}</TableHead>
                    <TableHead className="w-[20%]">{t("Skill Boosts")}</TableHead>
                    <TableHead className="w-[20%] text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(gameImpacts).map(([gameId, impact]) => (
                    <TableRow key={gameId}>
                      <TableCell className="font-medium">{gameId}</TableCell>
                      <TableCell>{impact.main_subject}</TableCell>
                      <TableCell>
                        {Object.entries(impact.subjects_boost || {})
                          .map(([subject, boost]) => `${subject} (${boost})`)
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        {Object.entries(impact.skills_boost || {})
                          .map(([skill, boost]) => `${skill} (${boost})`)
                          .join(", ")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/game-impacts/${gameId}`)}
                          title={t("View")}
                        >
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                          <span className="sr-only">{t("View")}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/game-impacts/${gameId}/edit`)}
                          title={t("Edit")}
                        >
                          <Edit className="h-4 w-4 text-amber-500" />
                          <span className="sr-only">{t("Edit")}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteGameImpact(gameId)}
                          title={t("Delete")}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">{t("Delete")}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">{t("No game impacts defined yet.")}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
