"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Save, GamepadIcon } from "lucide-react"
import {getPossibleStrengths, getPossibleAreas, getAllGames, createGameImpact, getSubjects} from "@/lib/api"
import type { PossibleStrength, PossibleArea, Game } from "@/lib/api"
import { useEffect } from "react"
import Link from "next/link"

export default function NewGameImpactPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [strengths, setStrengths] = useState<PossibleStrength[]>([])
  const [areas, setAreas] = useState<PossibleArea[]>([])
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    game_name: "",
    main_subject: "",
    difficulty_level: "",         // ✅ backend ile uyumlu
    recomended_age: "",           // ✅ yazım hatasına birebir uy
    time_to_complete: "",
    additional_notes: "",         // ✅ backend "notes" değil, bu
    subjects_boost: {} as Record<string, number>,
    skills_boost: {} as Record<string, number>,
    add_strengths: [] as string[],
    add_areas_on_low_score: [] as string[],
    recommendations: [] as string[],
  })


  const [allgames, setAllGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  // Available subjects and skills
  const skills = ["Critical Thinking", "Problem Solving", "Creativity", "Communication", "Collaboration", "Focus"]
  const games = [
    "Math Adventure",
    "Word Explorer",
    "Science Quest",
    "History Heroes",
    "Logic Lab",
    "Geometry Genius",
    "Reading Detective",
    "Eco Explorer",
    "World Time Travel",
  ]
  type Subject = { subject_id: string, name: string }
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllGames()
        setAllGames(data)
        setLoading(true)
        // Load strengths and areas for reference
        const [strengthsData, areasData, subjectsData] = await Promise.all([getPossibleStrengths(), getPossibleAreas(), getSubjects()])

        setStrengths(strengthsData)
        setAreas(areasData)
        setSubjects(subjectsData)

      } catch (err) {
        console.error("Error loading reference data:", err)
        setError("Failed to load reference data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load reference data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBoostChange = (category: "subjects_boost" | "skills_boost", item: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: numValue,
      },
    }))
  }

  const handleStrengthToggle = (strengthId: string) => {
    setFormData((prev) => {
      const isSelected = prev.add_strengths.includes(strengthId)
      return {
        ...prev,
        add_strengths: isSelected
          ? prev.add_strengths.filter((id) => id !== strengthId)
          : [...prev.add_strengths, strengthId],
      }
    })
  }

  const handleAreaToggle = (areaId: string) => {
    const id = String(areaId)
    setFormData((prev) => {
      const isSelected = prev.add_areas_on_low_score.includes(id)
      return {
        ...prev,
        add_areas_on_low_score: isSelected
          ? prev.add_areas_on_low_score.filter((aid) => aid !== id)
          : [...prev.add_areas_on_low_score, id],
      }
    })
  }

  const handleGameToggle = (game: string) => {
    setFormData((prev) => {
      const isSelected = prev.recommendations.includes(game)
      return {
        ...prev,
        recommendations: isSelected ? prev.recommendations.filter((g) => g !== game) : [...prev.recommendations, game],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.game_name) {
        toast({
          title: "Error",
          description: "Game name is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.main_subject) {
        toast({
          title: "Error",
          description: "Main subject is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.difficulty_level) {
        toast({
          title: "Error",
          description: "Difficulty level is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.recomended_age) {
        toast({
          title: "Error",
          description: "Recommended age is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.additional_notes) {
        toast({
          title: "Error",
          description: "Additional notes are required",
          variant: "destructive",
        })
        return
      }

      try {
        setSaving(true)
        await createGameImpact(formData) // ✅ gerçek API çağrısı
        toast({
          title: "Success",
          description: `Game impact for "${formData.game_name}" created successfully.`,
        })
        router.push(`/game-impacts/${encodeURIComponent(formData.game_name)}`)
      } catch (err) {
        console.error("Error saving game impact:", err)
        toast({
          title: "Error",
          description: "Failed to save game impact. Please try again.",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }


  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading reference data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <GamepadIcon className="mr-2 h-6 w-6 text-purple-500" />
            Create New Game Impact
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core settings for this game impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="game_name">Game</Label>
                <Select
                    value={formData.game_name}
                    onValueChange={(value) => handleSelectChange("game_name", value)}
                >
                  <SelectTrigger id="game_name">
                    <SelectValue placeholder="Select a game"/>
                  </SelectTrigger>
                  <SelectContent>
                    {allgames.map((game) => (
                        <SelectItem key={game.game_id} value={game.game_name}>{game.game_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_subject">Main Subject</Label>
                <Select
                    value={formData.main_subject}
                    onValueChange={(value) => handleSelectChange("main_subject", value)}
                    required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject"/>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                        <SelectItem key={subject.subject_id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select value={formData.difficulty_level} onValueChange={(value) => handleSelectChange("difficulty_level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Adaptive">Adaptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recomended_age">Recommended Age</Label>
                <Input
                    id="recomended_age"
                    name="recomended_age"
                    value={formData.recomended_age}
                    onChange={handleInputChange}
                    placeholder="e.g., 8-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_to_complete">Time to Complete</Label>
                <Input
                    id="time_to_complete"
                    name="time_to_complete"
                    value={formData.time_to_complete}
                    onChange={handleInputChange}
                    placeholder="e.g., 15-20 minutes"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any extra information about this game</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                  id="additional_notes"
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Enter any additional notes about this game..."
                  className="min-h-[150px]"
              />
            </CardContent>
          </Card>

          {/* Subject Boosts */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Boosts</CardTitle>
              <CardDescription>How much each subject improves when playing this game</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.subject_id} className="flex items-center justify-between">
                    <Label htmlFor={`subject-${subject.subject_id}`} className="flex-grow">
                      {subject.name}
                    </Label>

                    <Select
                      value={String(formData.subjects_boost[subject.name] || 0)}
                      onValueChange={(value) => handleBoostChange("subjects_boost", subject.name, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="0" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">+1</SelectItem>
                        <SelectItem value="2">+2</SelectItem>
                        <SelectItem value="3">+3</SelectItem>
                        <SelectItem value="4">+4</SelectItem>
                        <SelectItem value="5">+5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Boosts */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Boosts</CardTitle>
              <CardDescription>How much each skill improves when playing this game</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between">
                    <Label htmlFor={`skill-${skill}`} className="flex-grow">
                      {skill}
                    </Label>
                    <Select
                      value={String(formData.skills_boost[skill] || 0)}
                      onValueChange={(value) => handleBoostChange("skills_boost", skill, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="0" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">+1</SelectItem>
                        <SelectItem value="2">+2</SelectItem>
                        <SelectItem value="3">+3</SelectItem>
                        <SelectItem value="4">+4</SelectItem>
                        <SelectItem value="5">+5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Potential Strengths */}
          <Card>
            <CardHeader>
              <CardTitle>Potential Strengths</CardTitle>
              <CardDescription>Strengths that may be identified when a student excels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((strength) => (
                    <div key={strength.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`strength-${strength.id}`}
                        checked={formData.add_strengths.includes(String(strength.id))}
                        onCheckedChange={() => handleStrengthToggle(String(strength.id))}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`strength-${strength.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {strength.name}
                        </Label>
                        {strength.description && (
                          <p className="text-sm text-muted-foreground">{strength.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No potential strengths available.{" "}
                    <Link href="/strengths/manage-possible" className="text-blue-500 hover:underline">
                      Add some first
                    </Link>
                    .
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle>Development Areas</CardTitle>
              <CardDescription>Areas that may need improvement when a student struggles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {areas.length > 0 ? (
                  areas.map((area) => (
                    <div key={area.area_id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`area-${String(area.area_id)}`}
                        checked={formData.add_areas_on_low_score.includes(String(area.area_id))}
                        onCheckedChange={() => handleAreaToggle(area.area_id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`area-${String(area.area_id)}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {area.name}
                        </Label>
                        {area.description && <p className="text-sm text-muted-foreground">{area.description}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No development areas available.{" "}
                    <Link href="/strengths/manage-areas" className="text-blue-500 hover:underline">
                      Add some first
                    </Link>
                    .
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Recommendations */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Game Recommendations</CardTitle>
              <CardDescription>Games that are recommended based on this game's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {games.map((game) => (
                  <div key={game} className="flex items-start space-x-2">
                    <Checkbox
                      id={`game-${game}`}
                      checked={formData.recommendations.includes(game)}
                      onCheckedChange={() => handleGameToggle(game)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`game-${game}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {game}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end mt-6 space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className={`h-4 w-4 ${saving ? "hidden" : "mr-2"}`} />
            Create Game Impact
          </Button>
        </div>
      </form>
    </div>
  )
}
