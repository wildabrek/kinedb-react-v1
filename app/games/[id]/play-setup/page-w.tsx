"use client"

import { CardFooter } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter,useParams } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, Users, Play, GripVertical, X, Plus, Save, Star, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { apiRequest, HttpMethod } from "@/lib/api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import {useAuth} from "@/contexts/auth-context"
//import {HTTP_METHODS} from "next/dist/server/web/http";
//import { HTTP_METHODS } from "@/lib/http-methods";


export default function GamePlaySetupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { translate: t } = useLanguage()
  const {id}= useParams()
  const gameId = Number.parseInt(id)
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
  const [savedQueues, setSavedQueues] = useState<{ name: string; students: any[] }[]>([])
  const [queueName, setQueueName] = useState("")
  const [showSaveQueue, setShowSaveQueue] = useState(false)
  const [showPrioritySettings, setShowPrioritySettings] = useState(false)

  // Fetch game data and classes on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        // Fetch game data
        const game = await apiRequest<any>(`/games/${gameId}`)
        setGameData(game || { name: `Game ${gameId}`, description: "No description available" })

        // Fetch classes
        const classesData = await apiRequest<any[]>("/classes")
        setAllClasses(classesData || [])
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast({
          title: t("Error"),
          description: t("Failed to load game data. Please try again."),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [gameId, t, toast])

  // Load class data when selected
  useEffect(() => {
    if (selectedClassId) {
      const fetchClassData = async () => {
        try {
          const classData = await apiRequest<any>(`/classes/${selectedClassId}`)
          setSelectedClass(classData || null)

          if (classData?.studentList) {
            setAvailableStudents(
              classData.studentList.map((student: any) => {
                return {
                  ...student,
                  name: student.name || `${t("Student")} ${student.id || "?"}`,
                  selected: false,
                  priority: "normal", // Default priority
                  status: "waiting", // Default status
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
            title: t("Error"),
            description: t("Failed to load class data. Please try again."),
            variant: "destructive",
          })
          setSelectedClass(null)
          setAvailableStudents([])
        }
      }

      fetchClassData()
    }
  }, [selectedClassId, t, toast])

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
      const selectedStudent = {
        ...student,
        name: student.name || `${t("Student")} ${student.id || "?"}`,
        priority: student.priority || "normal",
        status: student.status || "waiting",
      }
      setSelectedStudents((prev) => [...prev, selectedStudent])
      // Remove from available
      setAvailableStudents((prev) => prev.filter((s) => s.id !== student.id))
    }
  }

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedStudents)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedStudents(items)
  }

  // Save current queue
  const saveCurrentQueue = () => {
    if (!queueName.trim()) {
      toast({
        title: t("Queue Name Required"),
        description: t("Please enter a name for this queue"),
        variant: "destructive",
      })
      return
    }

    setSavedQueues((prev) => [
      ...prev,
      {
        name: queueName,
        students: [...selectedStudents],
      },
    ])

    setQueueName("")
    setShowSaveQueue(false)

    toast({
      title: t("Queue Saved"),
      description: t('Queue "{{name}}" has been saved', { name: queueName }),
    })
  }

  // Load a saved queue
  const loadSavedQueue = (queue: { name: string; students: any[] }) => {
    // Move all currently selected students back to available
    setAvailableStudents((prev) => [...prev, ...selectedStudents.filter((s) => !prev.some((p) => p.id === s.id))])

    // Set the selected students from the saved queue
    setSelectedStudents(queue.students)

    // Remove the loaded students from available
    setAvailableStudents((prev) => prev.filter((s) => !queue.students.some((qs) => qs.id === s.id)))

    toast({
      title: t("Queue Loaded"),
      description: t('Queue "{{name}}" has been loaded', { name: queue.name }),
    })
  }

  // Start the game with current queue
  const startGame = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: t("No Students Selected"),
        description: t("Please select at least one student to play the game"),
        variant: "destructive",
      })
      return
    }

    toast({
      title: t("Starting Game"),
      description: t("{{name}} is starting with {{count}} students", {
        name: gameData?.name || gameData?.game_name || t("Game"),
        count: selectedStudents.length,
      }),
    })

    try {
      for (const student of selectedStudents) {
        await apiRequest("/gamesession/start", HttpMethod.POST, {
          game_id: gameId,
          student_id: student.id,
        });
      }

      const studentIds = selectedStudents
        .filter((s) => s && s.id !== undefined)
        .map((s) => s.id.toString())
        .join(",")

      router.push(`/games/${gameId}/play?students=${studentIds}&school_id=${user?.school_id}`)
    } catch (error) {
      console.error("Error starting game:", error)
      toast({
        title: t("Error"),
        description: t("Failed to start the game. Please try again."),
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

  // Update student priority
  const updateStudentPriority = (index: number, priority: string) => {
    setSelectedStudents((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        priority,
      }
      return updated
    })
  }

  // Update student status
  const updateStudentStatus = (index: number, status: string) => {
    setSelectedStudents((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        status,
      }
      return updated
    })
  }

  // Auto-sort queue based on priority
  const autoSortQueue = () => {
    // Sort students by priority (high > normal > low)
    const sortedStudents = [...selectedStudents].sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      return (
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      )
    })

    setSelectedStudents(sortedStudents)

    toast({
      title: t("Queue Auto-Sorted"),
      description: t("Students have been sorted by priority"),
    })
  }

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {t("Ready")}
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {t("Absent")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{t("Waiting")}</Badge>
    }
  }

  // Add this near the top of the component with other useEffects
  useEffect(() => {
    // This is a workaround for react-beautiful-dnd issues with React 18
    window["__react-beautiful-dnd-disable-dev-warnings"] = true
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t("Loading game setup...")}</p>
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
            <span className="sr-only">{t("Back to game details")}</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {t("Play Setup")}: {gameData?.name || gameData?.game_name}
        </h1>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Class selection and student list */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Select Class")}</CardTitle>
              <CardDescription>{t("Choose a class to select students from")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select a class")} />
                </SelectTrigger>
                <SelectContent>
                  {allClasses && allClasses.length > 0 ? (
                    allClasses.map((classItem) => (
                      <SelectItem key={classItem.class_id} value={classItem.class_id.toString()}>
                        {t("Class")} {classItem.class_name} - {classItem.teacher_id}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-classes" disabled>
                      {t("No classes available")}
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
                  <CardTitle>{t("Students")}</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {availableStudents.length} {t("Available")}
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("Search students...")}
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
                      <span className="text-sm text-muted-foreground">
                        {filteredStudents.length} {t("student(s) found")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addAllFilteredToQueue}
                        disabled={filteredStudents.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" /> {t("Add All")}
                      </Button>
                    </div>
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => toggleStudentSelection(student)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {t("Grade")}: {student.grade}
                            </p>
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
                    <p className="text-muted-foreground">{t("No students found")}</p>
                    {searchQuery && (
                      <Button variant="link" onClick={() => setSearchQuery("")}>
                        {t("Clear search")}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Saved Queues */}
          {savedQueues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("Saved Queues")}</CardTitle>
                <CardDescription>{t("Load a previously saved queue")}</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                <div className="space-y-2">
                  {savedQueues.map((queue, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div>
                        <p className="font-medium">{queue.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {queue.students.length} {t("student(s)")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => loadSavedQueue(queue)}>
                        {t("Load")}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Queue management */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("Play Queue")}</CardTitle>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPrioritySettings(!showPrioritySettings)}
                          className={showPrioritySettings ? "bg-primary/10" : ""}
                          disabled={selectedStudents.length === 0}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          {showPrioritySettings ? t("Hide Settings") : t("Priority Settings")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("Set student priorities and status")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={autoSortQueue}
                          disabled={selectedStudents.length < 2}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          {t("Sort by Priority")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("Auto-sort by priority level")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveQueue(true)}
                    disabled={selectedStudents.length === 0 || showSaveQueue}
                  >
                    <Save className="h-4 w-4 mr-1" /> {t("Save Queue")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearQueue} disabled={selectedStudents.length === 0}>
                    <X className="h-4 w-4 mr-1" /> {t("Clear")}
                  </Button>
                </div>
              </div>
              <CardDescription>{t("Drag and drop students to arrange the play order")}</CardDescription>

              {/* Save queue form */}
              {showSaveQueue && (
                <div className="mt-2 p-3 border rounded-md bg-muted/50">
                  <Label htmlFor="queue-name">{t("Queue Name")}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="queue-name"
                      value={queueName}
                      onChange={(e) => setQueueName(e.target.value)}
                      placeholder={t("Enter a name for this queue")}
                    />
                    <Button size="sm" onClick={saveCurrentQueue}>
                      {t("Save")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSaveQueue(false)
                        setQueueName("")
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedStudents.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="students-queue" isDropDisabled={false}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {selectedStudents.map((student, index) => (
                          <Draggable
                            key={student.id.toString()}
                            draggableId={student.id.toString()}
                            index={index}
                            isDragDisabled={false}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center justify-between p-3 border rounded-md bg-background"
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex items-center gap-3 flex-1">
                                    <Badge
                                      variant="outline"
                                      className="w-6 h-6 rounded-full flex items-center justify-center p-0"
                                    >
                                      {index + 1}
                                    </Badge>
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{student.name}</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                          {t("Grade")}: {student.grade}
                                        </p>
                                        {student.priority !== "normal" && (
                                          <Star className={`h-3 w-3 ${getPriorityColor(student.priority)}`} />
                                        )}
                                        {student.status !== "waiting" && getStatusBadge(student.status)}
                                      </div>
                                    </div>
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
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">{t("No students in queue")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("Select students from the list to add them to the play queue")}
                  </p>
                </div>
              )}

              {/* Priority and status settings */}
              {showPrioritySettings && selectedStudents.length > 0 && (
                <div className="mt-4 border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{t("Priority & Status Settings")}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPrioritySettings(false)}>
                      {t("Hide")}
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedStudents.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex flex-wrap items-center gap-2 pb-2 border-b last:border-0 last:pb-0"
                      >
                        <span className="text-sm font-medium min-w-[100px]">{student.name}</span>

                        <Select
                          value={student.priority || "normal"}
                          onValueChange={(value) => updateStudentPriority(index, value)}
                        >
                          <SelectTrigger className="h-7 text-xs w-[90px]">
                            <SelectValue placeholder={t("Priority")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">{t("High")}</SelectItem>
                            <SelectItem value="normal">{t("Normal")}</SelectItem>
                            <SelectItem value="low">{t("Low")}</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={student.status || "waiting"}
                          onValueChange={(value) => updateStudentStatus(index, value)}
                        >
                          <SelectTrigger className="h-7 text-xs w-[90px]">
                            <SelectValue placeholder={t("Status")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ready">{t("Ready")}</SelectItem>
                            <SelectItem value="waiting">{t("Waiting")}</SelectItem>
                            <SelectItem value="absent">{t("Absent")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedStudents.length} {t("student(s) in queue")}
              </div>
              <Button onClick={startGame} disabled={selectedStudents.length === 0} className="gap-2">
                <Play className="h-4 w-4" />
                {t("Start Game")}
              </Button>
            </CardFooter>
          </Card>

          {/* Game settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Game Settings")}</CardTitle>
              <CardDescription>{t("Configure game options for this session")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">{t("Difficulty Level")}</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder={t("Select difficulty")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">{t("Easy")}</SelectItem>
                        <SelectItem value="medium">{t("Medium")}</SelectItem>
                        <SelectItem value="hard">{t("Hard")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">{t("Time Limit (minutes)")}</Label>
                    <Select defaultValue="10">
                      <SelectTrigger id="time-limit">
                        <SelectValue placeholder={t("Select time limit")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 {t("minutes")}</SelectItem>
                        <SelectItem value="10">10 {t("minutes")}</SelectItem>
                        <SelectItem value="15">15 {t("minutes")}</SelectItem>
                        <SelectItem value="20">20 {t("minutes")}</SelectItem>
                        <SelectItem value="unlimited">{t("Unlimited")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="track-progress" defaultChecked />
                    <Label htmlFor="track-progress">{t("Track student progress")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-leaderboard" defaultChecked />
                    <Label htmlFor="show-leaderboard">{t("Show leaderboard after completion")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allow-retries" defaultChecked />
                    <Label htmlFor="allow-retries">{t("Allow retries on incorrect answers")}</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue management guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {t("Dynamic Queue Management")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>{t("The new dynamic queue management system allows you to organize students more efficiently:")}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">{t("Priority Levels")}:</span>{" "}
                    {t("Assign High, Normal, or Low priority to students to help organize your queue.")}
                  </li>
                  <li>
                    <span className="font-medium">{t("Student Status")}:</span>{" "}
                    {t("Mark students as Ready or Absent to keep track of who's available to play.")}
                  </li>
                  <li>
                    <span className="font-medium">{t("Auto-Sort")}:</span>{" "}
                    {t('Use the "Sort by Priority" button to automatically arrange students by their priority level.')}
                  </li>
                  <li>
                    <span className="font-medium">{t("Real-time Adjustments")}:</span>{" "}
                    {t("During gameplay, you can continue to reorder the queue and adjust priorities as needed.")}
                  </li>
                </ul>
                <p className="text-muted-foreground italic">
                  {t(
                    "Note: These settings will be preserved when the game starts, allowing for dynamic queue management during gameplay.",
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
