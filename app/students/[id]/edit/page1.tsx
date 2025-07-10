"use client"

import { useState } from "react"
import { useRouter,useParams } from "next/navigation"
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
const studentData = {
  id: 1,
  name: "Emma Thompson",
  email: "emma.t@school.edu",
  phone: "(555) 123-4567",
  grade: "3rd",
  class: "3A",
  teacher: "Ms. Johnson",
  status: "active",
  notes: "Emma is a bright student who excels in mathematics and science.",
  parentName: "Michael Thompson",
  parentEmail: "michael.t@example.com",
  parentPhone: "(555) 987-6543",
  address: "123 Main St, Anytown, USA",
}

export default function StudentEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState(studentData)
  const {id} = useParams()

  const handleSave = () => {
    toast({
      title: "Student Updated",
      description: `The information for ${student.name} has been updated.`,
    })
    router.push(`/students/${id}`)
  }

  const handleReset = () => {
    setStudent(studentData)
    toast({
      title: "Changes Reset",
      description: "All changes have been discarded.",
    })
  }

  const updateStudent = (key: string, value: any) => {
    setStudent((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href={`/students/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to student profile</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Student</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic details about the student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={student.name} onChange={(e) => updateStudent("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={student.email}
                onChange={(e) => updateStudent("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={student.phone} onChange={(e) => updateStudent("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={student.address} onChange={(e) => updateStudent("address", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={student.grade} onValueChange={(value) => updateStudent("grade", value)}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Grade</SelectItem>
                    <SelectItem value="2nd">2nd Grade</SelectItem>
                    <SelectItem value="3rd">3rd Grade</SelectItem>
                    <SelectItem value="4th">4th Grade</SelectItem>
                    <SelectItem value="5th">5th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={student.class} onValueChange={(value) => updateStudent("class", value)}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3A">3A</SelectItem>
                    <SelectItem value="3B">3B</SelectItem>
                    <SelectItem value="3C">3C</SelectItem>
                    <SelectItem value="4A">4A</SelectItem>
                    <SelectItem value="4B">4B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select value={student.teacher} onValueChange={(value) => updateStudent("teacher", value)}>
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ms. Johnson">Ms. Johnson</SelectItem>
                  <SelectItem value="Mr. Williams">Mr. Williams</SelectItem>
                  <SelectItem value="Ms. Davis">Ms. Davis</SelectItem>
                  <SelectItem value="Mr. Miller">Mr. Miller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={student.status === "active"}
                onCheckedChange={(checked) => updateStudent("status", checked ? "active" : "inactive")}
              />
              <Label htmlFor="status">Active Student</Label>
            </div>
          </CardContent>
        </Card>

        {/* Parent Information and Notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
              <CardDescription>Contact details for the student's parent or guardian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Name</Label>
                <Input
                  id="parentName"
                  value={student.parentName}
                  onChange={(e) => updateStudent("parentName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={student.parentEmail}
                  onChange={(e) => updateStudent("parentEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Phone</Label>
                <Input
                  id="parentPhone"
                  value={student.parentPhone}
                  onChange={(e) => updateStudent("parentPhone", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information about the student</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={student.notes}
                onChange={(e) => updateStudent("notes", e.target.value)}
                rows={5}
                placeholder="Enter any additional notes about the student..."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          <Undo className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
