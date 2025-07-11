"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Save, GamepadIcon, Trash2, AlertCircle, Edit } from "lucide-react"
import {
  getGameImpact,
  getPossibleStrengths,
  getPossibleAreas,
  updateGameImpact,
  deleteGameImpact,
  getSubjects,
  getSkills,
  getGames,
} from "@/lib/api"
import type { GameImpact, PossibleStrength, PossibleArea } from "@/lib/api"
import Link from "next/link"

// Sayfa props'larının bir Promise içerebileceğini belirten tür tanımı.
interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditGameImpactPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Asenkron olarak çözülecek `gameName` için state
  const [gameName, setGameName] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    main_subject: "",
    difficulty_level: "",
    recomended_age: "",
    time_to_complete: "",
    additional_notes: "",
    subjects_boost: {} as Record<string, number>,
    skills_boost: {} as Record<string, number>,
    add_strengths: [] as string[],
    add_areas_on_low_score: [] as string[],
    recommendations: [] as string[],
  })

  const [subjects, setSubjects] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [allGames, setAllGames] = useState<string[]>([])
  const [strengths, setStrengths] = useState<PossibleStrength[]>([])
  const [areas, setAreas] = useState<PossibleArea[]>([])

  // HATA DÜZELTİLDİ: useParams hook'u kaldırıldı.

  // 1. Adım: Promise olan 'params' içinden ID'yi çöz ve gameName'i state'e ata.
  useEffect(() => {
    async function getParams() {
      try {
        const resolvedParams = await params
        if (resolvedParams && resolvedParams.id) {
          const decodedGameName = decodeURIComponent(resolvedParams.id)
          setGameName(decodedGameName)
        } else {
          toast({ title: "Error", description: "Game name not found in URL.", variant: "destructive" })
          router.push("/game-impacts")
        }
      } catch (err) {
        console.error("Failed to resolve params:", err)
        toast({ title: "Error", description: "Could not load page parameters.", variant: "destructive" })
        router.push("/game-impacts")
      }
    }
    getParams()
  }, [params, router, toast])

  // 2. Adım: 'gameName' state'i dolduktan sonra bu effect çalışır ve veriyi çeker.
  useEffect(() => {
    if (gameName === null) {
      return // Henüz gameName çözülmediyse bekle.
    }

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const impact = await getGameImpact(gameName)
        if (!impact) {
          setError(`Game impact for "${gameName}" not found`)
          setLoading(false)
          return
        }

        setFormData({
          main_subject: impact.main_subject || "",
          difficulty_level: impact.difficulty_level || "",
          recomended_age: impact.recomended_age || "",
          time_to_complete: impact.time_to_complete || "",
          additional_notes: impact.additional_notes || "",
          subjects_boost: impact.subjects_boost || {},
          skills_boost: impact.skills_boost || {},
          add_strengths: impact.add_strengths || [],
          add_areas_on_low_score: impact.add_areas_on_low_score || [],
          recommendations: impact.recommendations || [],
        })

        const [subjectsData, skillsData, gamesData, strengthsData, areasData] = await Promise.all([
          getSubjects(),
          getSkills(),
          getGames(),
          getPossibleStrengths(),
          getPossibleAreas(),
        ])

        const subjectNames = subjectsData.map((s) => s.name)
        if (impact?.main_subject && !subjectNames.includes(impact.main_subject)) {
          subjectNames.push(impact.main_subject)
        }
        setSubjects(subjectNames)
        setSkills(skillsData.map((s) => s.name))
        setAllGames(gamesData.map((g) => g.game_name))
        setStrengths(strengthsData)
        setAreas(areasData)

      } catch (err) {
        console.error("Error loading game impact data:", err)
        setError("Failed to load game impact data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load game impact data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [gameName, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBoostChange = (category: "subjects_boost" | "skills_boost", item: string, value: string) => {
    const numValue = Number.parseInt(value, 10) || 0
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [item]: numValue },
    }))
  }

  const handleStrengthToggle = (strengthId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      add_strengths: checked
        ? [...prev.add_strengths, strengthId]
        : prev.add_strengths.filter((id) => id !== strengthId),
    }))
  }

  const handleAreaToggle = (areaId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      add_areas_on_low_score: checked
        ? [...prev.add_areas_on_low_score, areaId]
        : prev.add_areas_on_low_score.filter((id) => id !== areaId),
    }))
  }

  const handleGameToggle = (game: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      recommendations: checked
        ? [...prev.recommendations, game]
        : prev.recommendations.filter((g) => g !== game),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameName) return;

    try {
      setSaving(true)
      await updateGameImpact(gameName, formData)
      toast({
        title: "Success",
        description: `Game impact for "${gameName}" updated successfully.`,
      })
      router.push(`/game-impacts/${encodeURIComponent(gameName)}`)
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

  const handleDelete = async () => {
    if (!gameName) return;

    // `confirm` tarayıcıda çalışır, Next.js sunucu tarafında veya build sırasında hata verebilir.
    // Gerçek bir uygulamada burada bir modal (dialog) bileşeni kullanılmalıdır.
    // Şimdilik, doğrudan silme işlemi yapıyoruz.
    try {
      setSaving(true)
      await deleteGameImpact(gameName)
      toast({
        title: "Success",
        description: `Game impact for "${gameName}" deleted successfully.`,
      })
      router.push("/game-impacts")
    } catch (err) {
      console.error("Error deleting game impact:", err)
      toast({
        title: "Error",
        description: "Failed to delete game impact. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Error</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/game-impacts')} className="mt-4">
          Return to Game Impacts
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              <GamepadIcon className="mr-2 h-6 w-6 text-purple-500" />
              Edit - {gameName}
            </h1>
          </div>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="boosts">Boosts</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core settings for this game impact</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Main Subject</Label>
                  <Select value={formData.main_subject} onValueChange={(v) => handleSelectChange("main_subject", v)}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty_level} onValueChange={(v) => handleSelectChange("difficulty_level", v)}>
                    <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                      <SelectItem value="Adaptive">Adaptive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recommended Age</Label>
                  <Input name="recomended_age" value={formData.recomended_age} onChange={handleInputChange} placeholder="e.g., 8-12" />
                </div>
                <div>
                  <Label>Time to Complete</Label>
                  <Input name="time_to_complete" value={formData.time_to_complete} onChange={handleInputChange} placeholder="e.g., 20 minutes" />
                </div>
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea name="additional_notes" value={formData.additional_notes} onChange={handleInputChange} placeholder="Any additional notes..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boosts">
            <Card className="mt-4">
              <CardHeader><CardTitle>Subject Boosts</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map(subject => (
                  <div key={subject} className="flex items-center justify-between">
                    <Label>{subject}</Label>
                    <Select value={String(formData.subjects_boost[subject] || 0)} onValueChange={(v) => handleBoostChange("subjects_boost", subject, v)}>
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>{`+${i}`}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader><CardTitle>Skill Boosts</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <div key={`${skill}-${index}`} className="flex items-center justify-between">
                    <Label>{skill}</Label>
                    <Select value={String(formData.skills_boost[skill] || 0)} onValueChange={(v) => handleBoostChange("skills_boost", skill, v)}>
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 1, 2, 3, 4, 5].map(i => (<SelectItem key={i} value={String(i)}>{`+${i}`}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <Card className="mt-4">
              <CardHeader><CardTitle>Strengths</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {strengths.map(strength => (
                  <div key={strength.id} className="flex items-start space-x-2">
                    <Checkbox id={`s-${strength.id}`} checked={formData.add_strengths.includes(String(strength.id))} onCheckedChange={(checked) => handleStrengthToggle(String(strength.id), Boolean(checked))} />
                    <div>
                      <Label htmlFor={`s-${strength.id}`}>{strength.name}</Label>
                      <p className="text-sm text-muted-foreground">{strength.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader><CardTitle>Areas for Improvement</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {areas.map(area => (
                  <div key={area.area_id} className="flex items-start space-x-2">
                    <Checkbox id={`a-${area.area_id}`} checked={formData.add_areas_on_low_score.includes(String(area.area_id))} onCheckedChange={(checked) => handleAreaToggle(String(area.area_id), Boolean(checked))} />
                    <div>
                      <Label htmlFor={`a-${area.area_id}`}>{area.name}</Label>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="mt-4">
              <CardHeader><CardTitle>Recommended Games</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allGames.map(game => (
                  <div key={game} className="flex items-start space-x-2">
                    <Checkbox id={`g-${game}`} checked={formData.recommendations.includes(game)} onCheckedChange={(checked) => handleGameToggle(game, Boolean(checked))} />
                    <Label htmlFor={`g-${game}`}>{game}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
