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

export default function ClassEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const {id} = useParams()
  const { toast } = useToast()
  const classId = Number.parseInt(id)

  // Initial class data - in a real app, this would come from an API call
  const initialClassData = {
    id: classId,
    name: "Math 101",
    grade: "Grade 3",
    schoolId: 1,
    teacherId: 2,
    description: "Introductory mathematics class covering basic arithmetic and problem-solving",
    schedule: "Monday, Wednesday, Friday 9:00 AM - 10:00 AM",
    room: "Room 204",
    status: "active",
    year: "2023-2024",
    term: "Fall",
    maxStudents: 25,
    currentStudents: 22,
  }

  const [classData, setClassData] = useState(initialClassData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Class Updated",
        description: `${classData.name} has been updated successfully.`,
      })
      setIsSubmitting(false)
      router.push(`/classes/${id}`)
    }, 1000)
  }

  const handleReset = () => {
    setClassData(initialClassData)
    toast({
      title: "Changes Reset",
      description: "All changes have been discarded.",
    })
  }

  const updateClassData = (key: string, value: any) => {
    setClassData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href={`/classes/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to class details</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Class</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
          <CardDescription>Edit class details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name</Label>
              <Input id="name" value={classData.name} onChange={(e) => updateClassData("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={classData.grade} onValueChange={(value) => updateClassData("grade", value)}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={classData.year} onValueChange={(value) => updateClassData("year", value)}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select value={classData.term} onValueChange={(value) => updateClassData("term", value)}>
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={classData.description}
              onChange={(e) => updateClassData("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input id="room" value={classData.room} onChange={(e) => updateClassData("room", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={classData.schedule}
                onChange={(e) => updateClassData("schedule", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <Input
                id="maxStudents"
                type="number"
                value={classData.maxStudents}
                onChange={(e) => updateClassData("maxStudents", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentStudents">Current Students</Label>
              <Input id="currentStudents" type="number" value={classData.currentStudents} disabled />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={classData.status === "active"}
              onCheckedChange={(checked) => updateClassData("status", checked ? "active" : "inactive")}
            />
            <Label htmlFor="status">Active Class</Label>
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
