"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Search, Users, Play, X, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {useAuth} from "@/contexts/auth-context";

export default function GamePlaySetupPage() {
  const router = useRouter()
  const { id } = useParams()
  const gameId = Number.parseInt(id as string)
  const { toast } = useToast()
  const {user} = useAuth()

  // State for loading
  const [isLoading, setIsLoading] = useState(true)
  const [gameData, setGameData] = useState<any>(null)
  const [allClasses, setAllClasses] = useState<any[]>([])

  // State for class selection and student management
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<any[]>([])
  const [availableStudents, setAvailableStudents] = useState<any[]>([])

  // Fetch game data and classes on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        // Fetch game data
        const gameResponse = await fetch(`http://localhost:8000/games/${gameId}`)
        if (!gameResponse.ok) throw new Error(`Failed to load game: ${gameResponse.status}`)
        const game = await gameResponse.json()
        setGameData(game || { name: `Game ${gameId}`, description: "No description available" })

        // Fetch classes
        const classesResponse = await fetch("http://localhost:8000/classes")
        if (!classesResponse.ok) throw new Error(`Failed to load classes: ${classesResponse.status}`)
        const classesData = await classesResponse.json()
        setAllClasses(classesData || [])
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load game data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [gameId, toast])

  // Load class data when selected
  useEffect(() => {
    if (selectedClassId) {
      const fetchClassData = async () => {
        try {
          const classResponse = await fetch(`http://localhost:8000/classes/${selectedClassId}`)
          if (!classResponse.ok) throw new Error(`Failed to load class: ${classResponse.status}`)
          const classData = await classResponse.json()
          setSelectedClass(classData || null)

          if (classData?.studentList) {
            setAvailableStudents(
              classData.studentList.map((student: any) => {
                return {
                  ...student,
                  name: student.name || `Student ${student.id || "?"}`,
                  selected: false,
                }
              }),
            )
            setSelectedStudents([])
          } else {
            setAvailableStudents([])
          }
        } catch (error) {
          console.error("Error loading class data:", error)
          toast({
            title: "Error",
            description: "Failed to load class data. Please try again.",
            variant: "destructive",
          })
          setSelectedClass(null)
          setAvailableStudents([])
        }
      }

      fetchClassData()
    }
  }, [selectedClassId, toast])

  // Filter students based on search query
  const filteredStudents = availableStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle student selection
  const toggleStudentSelection = (student: any) => {
    if (!student || student.id === undefined) {
      console.error("Invalid student data:", student)
      return
    }

    // Check if student is already in queue
    const isSelected = selectedStudents.some((s) => s.id === student.id)

    if (isSelected) {
      // Remove from selected
      setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id))
      // Add back to available
      setAvailableStudents((prev) => [...prev, student])
    } else {
      // Add to selected
      setSelectedStudents((prev) => [...prev, student])
      // Remove from available
      setAvailableStudents((prev) => prev.filter((s) => s.id !== student.id))
    }
  }

  // Add all filtered students to queue
  const addAllFilteredToQueue = () => {
    setSelectedStudents((prev) => [...prev, ...filteredStudents])
    setAvailableStudents((prev) => prev.filter((s) => !filteredStudents.some((fs) => fs.id === s.id)))
  }

  // Clear the current queue
  const clearQueue = () => {
    setAvailableStudents((prev) => [...prev, ...selectedStudents])
    setSelectedStudents([])
  }

  // Start the game with current queue
  const startGame = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please select at least one student to play the game",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Starting Game",
      description: `${gameData?.name || gameData?.game_name || "Game"} is starting with ${selectedStudents.length} students`,
    })

    try {
      // Create game sessions for all selected students
      for (const student of selectedStudents) {
        await fetch("http://localhost:8000/gamesession/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game_id: gameId,
            student_id: student.id,
            user_id: user?.user_id,
          }),
        })
      }

      // Navigate to the play page with student IDs
      const studentIds = selectedStudents
        .filter((s) => s && s.id !== undefined)
        .map((s) => s.id.toString())
        .join(",")

      router.push(`/games/${gameId}/play?students=${studentIds}&school_id=1`)
    } catch (error) {
      console.error("Error starting game:", error)
      toast({
        title: "Error",
        description: "Failed to start the game. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Remove a student from the queue
  const removeFromQueue = (studentId: number) => {
    const student = selectedStudents.find((s) => s.id === studentId)
    if (student) {
      setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId))
      setAvailableStudents((prev) => [...prev, student])
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading game setup...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href={`/games/${gameId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to game details</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Play Setup: {gameData?.name || gameData?.game_name}</h1>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Class selection and student list */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Class</CardTitle>
              <CardDescription>Choose a class to select students from</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {allClasses && allClasses.length > 0 ? (
                    allClasses.map((classItem) => (
                      <SelectItem key={classItem.class_id} value={classItem.class_id.toString()}>
                        Class {classItem.class_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-classes" disabled>
                      No classes available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedClass && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Students</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{availableStudents.length} Available</span>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto">
                {filteredStudents.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">{filteredStudents.length} student(s) found</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addAllFilteredToQueue}
                        disabled={filteredStudents.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add All
                      </Button>
                    </div>
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => toggleStudentSelection(student)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">Grade: {student.grade}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-muted-foreground">No students found</p>
                    {searchQuery && (
                      <Button variant="link" onClick={() => setSearchQuery("")}>
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Queue management */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Play Queue</CardTitle>
                <Button variant="outline" size="sm" onClick={clearQueue} disabled={selectedStudents.length === 0}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
              <CardDescription>Students in the play queue</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStudents.length > 0 ? (
                <div className="space-y-2">
                  {selectedStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">Grade: {student.grade}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFromQueue(student.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No students in queue</p>
                  <p className="text-sm text-muted-foreground">
                    Select students from the list to add them to the play queue
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">{selectedStudents.length} student(s) in queue</div>
              <Button onClick={startGame} disabled={selectedStudents.length === 0} className="gap-2">
                <Play className="h-4 w-4" />
                Start Game
              </Button>
            </CardFooter>
          </Card>

          {/* Game settings */}
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure game options for this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select defaultValue="medium">
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
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Select defaultValue="10">
                      <SelectTrigger id="time-limit">
                        <SelectValue placeholder="Select time limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="track-progress" defaultChecked />
                    <Label htmlFor="track-progress">Track student progress</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-leaderboard" defaultChecked />
                    <Label htmlFor="show-leaderboard">Show leaderboard after completion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allow-retries" defaultChecked />
                    <Label htmlFor="allow-retries">Allow retries on incorrect answers</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
