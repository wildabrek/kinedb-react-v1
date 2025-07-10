"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Undo } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Sample data - in a real app, this would come from an API based on the ID
const gameData = {
  id: 1,
  name: "Math Blaster",
  subject: "Mathematics",
  level: "Grade 3-4",
  description: "A fun game to practice math skills",
  status: "active",
  skills: ["Addition", "Subtraction", "Multiplication", "Division"],
  difficulty: "medium",
  timeLimit: 15,
  pointsPerQuestion: 10,
}

export default function GameEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [game, setGame] = useState(gameData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {id} = useParams()
  const handleSave = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Game Updated",
        description: `${game.name} has been updated successfully.`,
      })
      setIsSubmitting(false)
      router.push(`/games/${id}`)
    }, 1000)
  }

  const handleReset = () => {
    setGame(gameData)
    toast({
      title: "Changes Reset",
      description: "All changes have been discarded.",
    })
  }

  const updateGame = (key: string, value: any) => {
    setGame((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href={`/games/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to game details</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Game</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
          <CardDescription>Edit game details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name</Label>
              <Input id="name" value={game.name} onChange={(e) => updateGame("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={game.subject} onChange={(e) => updateGame("subject", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={game.level} onValueChange={(value) => updateGame("level", value)}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 1-2">Grade 1-2</SelectItem>
                  <SelectItem value="Grade 3-4">Grade 3-4</SelectItem>
                  <SelectItem value="Grade 5-6">Grade 5-6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={game.difficulty} onValueChange={(value) => updateGame("difficulty", value)}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={game.description}
              onChange={(e) => updateGame("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={game.timeLimit}
                onChange={(e) => updateGame("timeLimit", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsPerQuestion">Points Per Question</Label>
              <Input
                id="pointsPerQuestion"
                type="number"
                value={game.pointsPerQuestion}
                onChange={(e) => updateGame("pointsPerQuestion", Number.parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={game.status === "active"}
              onCheckedChange={(checked) => updateGame("status", checked ? "active" : "inactive")}
            />
            <Label htmlFor="status">Active Game</Label>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
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
