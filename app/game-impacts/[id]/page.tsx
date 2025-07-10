"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Edit, GamepadIcon, Target, Star, BookOpen, Zap, AlertCircle } from "lucide-react"
import { getGameImpact, getPossibleStrengths, getPossibleAreas } from "@/lib/api"
import type { GameImpact, PossibleStrength, PossibleArea } from "@/lib/api"

export default function GameImpactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [gameImpact, setGameImpact] = useState<GameImpact | null>(null)
  const [strengths, setStrengths] = useState<PossibleStrength[]>([])
  const [areas, setAreas] = useState<PossibleArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {id} = useParams()
  const gameName = decodeURIComponent(id)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Load game impact data
        const impact = await getGameImpact(gameName)
        if (!impact) {
          setError(`Game impact for "${gameName}" not found`)
          return
        }
        setGameImpact(impact)

        // Load strengths and areas for reference
        const [strengthsData, areasData] = await Promise.all([getPossibleStrengths(), getPossibleAreas()])

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

  // Helper function to get strength label by ID
  const getStrengthLabel = (id: string | number) => {
    const strength = strengths.find((s) => String(s.id) === String(id));
    return strength ? strength.name : id;
  };
  const getStrengthName = (id: string) => {
    const strength = strengths.find((s) => s.id === id)
    return strength ? strength.name : id
  }


  // Helper function to get area label by ID
  const getAreaLabel = (id: string) => {
    const area = areas.find((a) => a.area_id === Number(id))
    return area ? area.name : id
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading game impact data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button className="mt-4" onClick={() => router.push("/game-impacts")}>
              Return to Game Impacts
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameImpact) {
    return null
  }
  console.log("Strengths list:", strengths)

  console.log(gameImpact.game_name)
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
            {gameName}
          </h1>
        </div>
        <Button onClick={() => router.push(`/game-impacts/${encodeURIComponent(gameName)}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Game Impact
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Subject and Boosts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
              Subject Information
            </CardTitle>
            <CardDescription>How this game affects subject scores and skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Main Subject</h3>
              <Badge variant="outline" className="text-base py-1 px-3 bg-blue-50">
                {gameImpact.main_subject}
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Subject Boosts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(gameImpact.subjects_boost || {}).map(([subject, boost]) => (
                  <div key={subject} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{subject}</span>
                    <Badge variant={Number(boost) > 2 ? "default" : "secondary"}>+{boost}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Skill Boosts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(gameImpact.skills_boost || {}).map(([skill, boost]) => (
                  <div key={skill} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{skill}</span>
                    <Badge variant={Number(boost) > 2 ? "default" : "secondary"}>+{boost}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-amber-500" />
              Game Settings
            </CardTitle>
            <CardDescription>Configuration and difficulty settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Difficulty Level</h3>
              <p>{gameImpact.difficulty_level || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Recommended Age</h3>
              <p>{gameImpact.recomended_age || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Time to Complete</h3>
              <p>{gameImpact.time_to_complete || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Potential Strengths
            </CardTitle>
            <CardDescription>Strengths that may be identified when a student excels</CardDescription>
          </CardHeader>
          <CardContent>
            {gameImpact.add_strengths && gameImpact.add_strengths.length > 0 ? (
              <div className="space-y-2">
                {gameImpact.add_strengths.map((strengthId) => (
                  <Badge key={strengthId} variant="outline" className="mr-2 mb-2 bg-yellow-50">
                    {getStrengthLabel(strengthId)}

                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No potential strengths defined</p>
            )}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-red-500" />
              Development Areas
            </CardTitle>
            <CardDescription>Areas that may need improvement when a student struggles</CardDescription>
          </CardHeader>
          <CardContent>
            {gameImpact.add_areas_on_low_score && gameImpact.add_areas_on_low_score.length > 0 ? (
              <div className="space-y-2">
                {gameImpact.add_areas_on_low_score.map((areaName) => (
                  <Badge key={areaName} variant="outline" className="mr-2 mb-2 bg-red-50">
                    {getAreaLabel(areaName)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No development areas defined</p>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-green-500" />
              Recommended Games
            </CardTitle>
            <CardDescription>Games recommended based on this game's performance</CardDescription>
          </CardHeader>
          <CardContent>
            {gameImpact.recommendations && gameImpact.recommendations.length > 0 ? (
              <div className="space-y-2">
                {gameImpact.recommendations.map((game) => (
                  <Badge key={game} variant="outline" className="mr-2 mb-2 bg-green-50">
                    {game}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No game recommendations defined</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {gameImpact.additional_notes ? (
              <p>{gameImpact.additional_notes}</p>
            ) : (
              <p className="text-muted-foreground">No additional notes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

}
