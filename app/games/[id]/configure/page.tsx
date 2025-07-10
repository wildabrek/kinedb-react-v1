"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Undo, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Sample data - in a real app, this would come from an API based on the ID
const gameData = {
  id: 1,
  name: "Math Blaster",
  subject: "Mathematics",
  level: "Grade 3-4",
  description: "A fun game to practice math skills",
  difficulty: 3,
  timeLimit: 15,
  soundEnabled: true,
  hintEnabled: true,
  pointsPerQuestion: 10,
  negativePoints: false,
  topics: ["Addition", "Subtraction", "Multiplication", "Division"],
  availableTopics: ["Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Decimals"],
  visuals: {
    theme: "space",
    characterType: "astronaut",
    colorScheme: "blue",
  },
  accessibility: {
    largeText: false,
    highContrast: false,
    screenReaderSupport: true,
    keyboardNavigation: true,
  },
}

export default function GameConfigPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [config, setConfig] = useState(gameData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const {id} = useParams()
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Configuration Saved",
        description: `The configuration for ${config.name} has been updated.`,
      })

      router.push(`/games/${id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(gameData)
    toast({
      title: "Configuration Reset",
      description: "All changes have been discarded.",
    })
  }

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => {
      // Handle nested properties
      if (key.includes(".")) {
        const [parent, child] = key.split(".")
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value,
          },
        }
      }

      return {
        ...prev,
        [key]: value,
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading game configuration...</p>
        </div>
      </div>
    )
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
        <h1 className="text-2xl font-bold">Configure Game</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{config.name}</CardTitle>
          <CardDescription>Configure game settings and parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="visuals">Visuals</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Game Name</Label>
                  <Input id="name" value={config.name} onChange={(e) => updateConfig("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={config.subject}
                    onChange={(e) => updateConfig("subject", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Grade Level</Label>
                  <Select value={config.level} onValueChange={(value) => updateConfig("level", value)}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 1-2">Grade 1-2</SelectItem>
                      <SelectItem value="Grade 3-4">Grade 3-4</SelectItem>
                      <SelectItem value="Grade 5-6">Grade 5-6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={config.description}
                    onChange={(e) => updateConfig("description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsPerQuestion">Points Per Question</Label>
                  <Input
                    id="pointsPerQuestion"
                    type="number"
                    min="1"
                    max="100"
                    value={config.pointsPerQuestion}
                    onChange={(e) => updateConfig("pointsPerQuestion", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="negativePoints"
                    checked={config.negativePoints}
                    onCheckedChange={(checked) => updateConfig("negativePoints", checked)}
                  />
                  <Label htmlFor="negativePoints">Enable Negative Points for Wrong Answers</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="content" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <Label>Selected Topics</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {config.availableTopics.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topic-${topic}`}
                          checked={config.topics.includes(topic)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateConfig("topics", [...config.topics, topic])
                            } else {
                              updateConfig(
                                "topics",
                                config.topics.filter((t) => t !== topic),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={`topic-${topic}`}>{topic}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="visuals" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={config.visuals.theme} onValueChange={(value) => updateConfig("visuals.theme", value)}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="space">Space</SelectItem>
                      <SelectItem value="ocean">Ocean</SelectItem>
                      <SelectItem value="jungle">Jungle</SelectItem>
                      <SelectItem value="desert">Desert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="characterType">Character Type</Label>
                  <Select
                    value={config.visuals.characterType}
                    onValueChange={(value) => updateConfig("visuals.characterType", value)}
                  >
                    <SelectTrigger id="characterType">
                      <SelectValue placeholder="Select character type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="astronaut">Astronaut</SelectItem>
                      <SelectItem value="diver">Diver</SelectItem>
                      <SelectItem value="explorer">Explorer</SelectItem>
                      <SelectItem value="scientist">Scientist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select
                    value={config.visuals.colorScheme}
                    onValueChange={(value) => updateConfig("visuals.colorScheme", value)}
                  >
                    <SelectTrigger id="colorScheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="difficulty">Difficulty Level (1-5)</Label>
                      <span>{config.difficulty}</span>
                    </div>
                    <Slider
                      id="difficulty"
                      min={1}
                      max={5}
                      step={1}
                      value={[config.difficulty]}
                      onValueChange={(value) => updateConfig("difficulty", value[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                      <span>{config.timeLimit}</span>
                    </div>
                    <Slider
                      id="timeLimit"
                      min={5}
                      max={30}
                      step={5}
                      value={[config.timeLimit]}
                      onValueChange={(value) => updateConfig("timeLimit", value[0])}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="soundEnabled"
                      checked={config.soundEnabled}
                      onCheckedChange={(checked) => updateConfig("soundEnabled", checked)}
                    />
                    <Label htmlFor="soundEnabled">Enable Sound Effects</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hintEnabled"
                      checked={config.hintEnabled}
                      onCheckedChange={(checked) => updateConfig("hintEnabled", checked)}
                    />
                    <Label htmlFor="hintEnabled">Enable Hints</Label>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Accessibility Options</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="largeText"
                          checked={config.accessibility.largeText}
                          onCheckedChange={(checked) => updateConfig("accessibility.largeText", checked)}
                        />
                        <Label htmlFor="largeText">Large Text</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="highContrast"
                          checked={config.accessibility.highContrast}
                          onCheckedChange={(checked) => updateConfig("accessibility.highContrast", checked)}
                        />
                        <Label htmlFor="highContrast">High Contrast</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="screenReaderSupport"
                          checked={config.accessibility.screenReaderSupport}
                          onCheckedChange={(checked) => updateConfig("accessibility.screenReaderSupport", checked)}
                        />
                        <Label htmlFor="screenReaderSupport">Screen Reader Support</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="keyboardNavigation"
                          checked={config.accessibility.keyboardNavigation}
                          onCheckedChange={(checked) => updateConfig("accessibility.keyboardNavigation", checked)}
                        />
                        <Label htmlFor="keyboardNavigation">Keyboard Navigation</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <Undo className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
