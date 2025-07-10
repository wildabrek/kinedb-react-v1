"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Undo } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { getGame, updateGame, getSubjects } from "@/lib/api"

export default function GameEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams()

  const [game, setGame] = useState<any>(null)
  const [initialGame, setInitialGame] = useState<any>(null)
  const [subjects, setSubjects] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [gameData, subjectsData] = await Promise.all([
          getGame(String(id)),
          getSubjects()
        ])
        setGame({ ...gameData })
        setInitialGame({ ...gameData })
        setSubjects(subjectsData.map((s: any) => s.name))
      } catch (error) {
        toast({ title: "Error", description: "Failed to load data.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, toast])

  const handleSave = async () => {
    if (!game) return
    setIsSubmitting(true)
    try {
      const updatedGame = {
        ...game,
        level: String(game.level),
        difficulty_level: Number(game.difficulty_level),
      }
      await updateGame(Number(id), updatedGame)
      toast({ title: "Success", description: `Game '${game.game_name}' updated successfully.` })
      router.push(`/games/${id}`)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update game.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setGame((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleReset = () => {
    setGame({ ...initialGame })
    toast({ title: "Reset", description: "Changes have been discarded." })
  }

  if (loading || !game) {
    return <div className="p-6 text-center">Loading game data...</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Game</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
          <CardDescription>Update your game details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="game_name">Game Name</Label>
              <Input id="game_name" value={game.game_name || ""} onChange={(e) => handleChange("game_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={game.subject || ""} onValueChange={(v) => handleChange("subject", v)}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={String(game.level) || ""} onValueChange={(v) => handleChange("level", v)}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grade 1-2</SelectItem>
                  <SelectItem value="2">Grade 3-4</SelectItem>
                  <SelectItem value="3">Grade 5-6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Difficulty</Label>
              <Select value={String(game.difficulty_level) || ""} onValueChange={(v) => handleChange("difficulty_level", v)}>
                <SelectTrigger id="difficulty_level">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={game.description || ""} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time_limit">Time Limit (minutes)</Label>
              <Input id="time_limit" type="number" value={game.time_limit || 0} onChange={(e) => handleChange("time_limit", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points_per_question">Points Per Question</Label>
              <Input id="points_per_question" type="number" value={game.points_per_question || 0} onChange={(e) => handleChange("points_per_question", Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="status" checked={game.status === "active"} onCheckedChange={(checked) => handleChange("status", checked ? "active" : "inactive")} />
            <Label htmlFor="status">Active Game</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          <Undo className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
