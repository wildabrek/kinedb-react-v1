"use client"

import { CardFooter } from "@/components/ui/card"
import * as React from "react"
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
import { ArrowLeft, Search, Users, Play, GripVertical, X, Plus, Save, Star, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { getGameById, getClassById, classes, students } from "@/utils/data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {string} from "zod"


export default function GamePlaySetupPage({ params }: { params: { id: string } }) {
  const {id} = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const gameId = Number.parseInt(id)
  const gameData = getGameById(gameId)

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

  // Load class data when selected
  useEffect(() => {
    if (selectedClassId) {
      const classData = getClassById(Number.parseInt(selectedClassId))
      setSelectedClass(classData)

      if (classData?.studentList) {
        setAvailableStudents(
          classData.studentList.map((student) => {
            const studentData = students.find((s) => s.id === student.id.toString())
            return {
              ...student,
              name: studentData?.name || `Student ${student.id}`,
              selected: false,
              priority: "normal", // Default priority
              status: "waiting", // Default status
            }
          }),
        )
        setSelectedStudents([])
      }
    }
  }, [selectedClassId])

  // Filter students based on search query
  const filteredStudents = availableStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle student selection
  const toggleStudentSelection = (student: any) => {
    // Check if student is already in queue
    const isSelected = selectedStudents.some((s) => s.id === student.id)

    if (isSelected) {
      // Remove from selected
      setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id))
      // Add back to available
      setAvailableStudents((prev) => [...prev, student])
    } else {
      // Add to selected
      const studentData = students.find((s) => s.id === student.id.toString())
      const selectedStudent = {
        ...student,
        name: studentData?.name || `Student ${student.id}`,
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
        title: "Queue Name Required",
        description: "Please enter a name for this queue",
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
      title: "Queue Saved",
      description: `Queue "${queueName}" has been saved`,
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
      title: "Queue Loaded",
      description: `Queue "${queue.name}" has been loaded`,
    })
  }

  // Start the game with current queue
  const startGame = () => {
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
      description: `${gameData?.name} is starting with ${selectedStudents.length} students`,
    })

    // Set the first student's status to "playing"
    const updatedStudents = [...selectedStudents]
    if (updatedStudents.length > 0) {
      updatedStudents[0] = {
        ...updatedStudents[0],
        status: "playing",
      }
    }
    setSelectedStudents(updatedStudents)

    // In a real app, this would navigate to the actual game with the selected students
    router.push(`/games/${gameId}/play?students=${selectedStudents.map((s) => s.id).join(",")}`)
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
      title: "Queue Auto-Sorted",
      description: "Students have been sorted by priority",
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
            Ready
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Absent
          </Badge>
        )
      default:
        return <Badge variant="outline">Waiting</Badge>
    }
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
        <h1 className="text-2xl font-bold">Play Setup: {gameData?.name}</h1>
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
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id.toString()}>
                      Class {classItem.name} - {classItem.teacher}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedClass && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Students</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {availableStudents.length} Available
                  </Badge>
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
                      <span className="text-sm text-muted-foreground">
                        {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                      </span>
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
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
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

          {/* Saved Queues */}
          {savedQueues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Queues</CardTitle>
                <CardDescription>Load a previously saved queue</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                <div className="space-y-2">
                  {savedQueues.map((queue, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div>
                        <p className="font-medium">{queue.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {queue.students.length} student{queue.students.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => loadSavedQueue(queue)}>
                        Load
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
                <CardTitle>Play Queue</CardTitle>
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
                          {showPrioritySettings ? "Hide Settings" : "Priority Settings"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set student priorities and status</p>
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
                          Sort by Priority
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Auto-sort by priority level</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveQueue(true)}
                    disabled={selectedStudents.length === 0 || showSaveQueue}
                  >
                    <Save className="h-4 w-4 mr-1" /> Save Queue
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearQueue} disabled={selectedStudents.length === 0}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                </div>
              </div>
              <CardDescription>Drag and drop students to arrange the play order</CardDescription>

              {/* Save queue form */}
              {showSaveQueue && (
                <div className="mt-2 p-3 border rounded-md bg-muted/50">
                  <Label htmlFor="queue-name">Queue Name</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="queue-name"
                      value={queueName}
                      onChange={(e) => setQueueName(e.target.value)}
                      placeholder="Enter a name for this queue"
                    />
                    <Button size="sm" onClick={saveCurrentQueue}>
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSaveQueue(false)
                        setQueueName("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedStudents.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="students-queue" isDropDisabled={selectedStudents.length === 0} isCombineEnabled={false} ignoreContainerClipping={false}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {selectedStudents.map((student, index) => (
                          <Draggable key={student.id} draggableId={student.id.toString()} index={index}>
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
                                        <p className="text-xs text-muted-foreground">Grade: {student.grade}</p>
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
                  <p className="text-muted-foreground">No students in queue</p>
                  <p className="text-sm text-muted-foreground">
                    Select students from the list to add them to the play queue
                  </p>
                </div>
              )}

              {/* Priority and status settings */}
              {showPrioritySettings && selectedStudents.length > 0 && (
                <div className="mt-4 border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Priority & Status Settings</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPrioritySettings(false)}>
                      Hide
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
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={student.status || "waiting"}
                          onValueChange={(value) => updateStudentStatus(index, value)}
                        >
                          <SelectTrigger className="h-7 text-xs w-[90px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="waiting">Waiting</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
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
                {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} in queue
              </div>
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

          {/* Queue management guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Dynamic Queue Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>The new dynamic queue management system allows you to organize students more efficiently:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Priority Levels:</span> Assign High, Normal, or Low priority to
                    students to help organize your queue.
                  </li>
                  <li>
                    <span className="font-medium">Student Status:</span> Mark students as Ready or Absent to keep track
                    of who's available to play.
                  </li>
                  <li>
                    <span className="font-medium">Auto-Sort:</span> Use the "Sort by Priority" button to automatically
                    arrange students by their priority level.
                  </li>
                  <li>
                    <span className="font-medium">Real-time Adjustments:</span> During gameplay, you can continue to
                    reorder the queue and adjust priorities as needed.
                  </li>
                </ul>
                <p className="text-muted-foreground italic">
                  Note: These settings will be preserved when the game starts, allowing for dynamic queue management
                  during gameplay.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
