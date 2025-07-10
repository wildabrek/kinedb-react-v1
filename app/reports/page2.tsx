"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { BarChart3, Download, FileText, Printer, Search, User, Users, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for students
const students = [
  {
    id: "1",
    name: "Emma Thompson",
    grade: "3rd Grade",
    class: "3A",
    gamesPlayed: 45,
    avgScore: 92,
    lastActive: "Today",
    progress: "Advanced",
    subjects: {
      Math: 94,
      English: 88,
      Science: 91,
      History: 82,
    },
  },
  {
    id: "2",
    name: "Noah Martinez",
    grade: "3rd Grade",
    class: "3A",
    gamesPlayed: 38,
    avgScore: 85,
    lastActive: "Yesterday",
    progress: "On Track",
    subjects: {
      Math: 82,
      English: 90,
      Science: 84,
      History: 78,
    },
  },
  {
    id: "3",
    name: "Olivia Johnson",
    grade: "3rd Grade",
    class: "3B",
    gamesPlayed: 32,
    avgScore: 78,
    lastActive: "2 days ago",
    progress: "Needs Support",
    subjects: {
      Math: 72,
      English: 80,
      Science: 76,
      History: 68,
    },
  },
  {
    id: "4",
    name: "Liam Williams",
    grade: "3rd Grade",
    class: "3B",
    gamesPlayed: 41,
    avgScore: 88,
    lastActive: "Today",
    progress: "On Track",
    subjects: {
      Math: 86,
      English: 92,
      Science: 88,
      History: 80,
    },
  },
  {
    id: "5",
    name: "Ava Brown",
    grade: "3rd Grade",
    class: "3A",
    gamesPlayed: 50,
    avgScore: 94,
    lastActive: "Today",
    progress: "Advanced",
    subjects: {
      Math: 96,
      English: 94,
      Science: 92,
      History: 88,
    },
  },
]

// Sample data for classes
const classes = [
  {
    id: "1",
    name: "3A",
    teacher: "Ms. Johnson",
    students: 24,
    avgScore: 86,
    lastActive: "Today",
    subjects: {
      Math: 88,
      English: 85,
      Science: 87,
      History: 82,
    },
  },
  {
    id: "2",
    name: "3B",
    teacher: "Mr. Davis",
    students: 22,
    avgScore: 82,
    lastActive: "Yesterday",
    subjects: {
      Math: 80,
      English: 84,
      Science: 83,
      History: 78,
    },
  },
  {
    id: "3",
    name: "4A",
    teacher: "Mrs. Wilson",
    students: 25,
    avgScore: 84,
    lastActive: "Today",
    subjects: {
      Math: 86,
      English: 82,
      Science: 85,
      History: 80,
    },
  },
]

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedProgress, setSelectedProgress] = useState("all")
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<(typeof students)[0] | null>(null)

  // Filter students based on search query and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = selectedClass === "all" || student.class === selectedClass
    const matchesProgress = selectedProgress === "all" || student.progress === selectedProgress
    return matchesSearch && matchesClass && matchesProgress
  })

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Student Reports
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Class Reports
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Game Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Reports</CardTitle>
              <CardDescription>View detailed progress reports for individual students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
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
                </div>
                <div className="flex gap-2">
                  <div className="w-[180px]">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="3A">Class 3A</SelectItem>
                        <SelectItem value="3B">Class 3B</SelectItem>
                        <SelectItem value="4A">Class 4A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-[180px]">
                    <Select value={selectedProgress} onValueChange={setSelectedProgress}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by progress" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Progress</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="On Track">On Track</SelectItem>
                        <SelectItem value="Needs Support">Needs Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Student</th>
                      <th className="px-4 py-3 text-left font-medium">Class</th>
                      <th className="px-4 py-3 text-left font-medium">Avg. Score</th>
                      <th className="px-4 py-3 text-left font-medium">Progress</th>
                      <th className="px-4 py-3 text-left font-medium">Last Active</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?text=${student.name.charAt(0)}`} alt={student.name} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>Class {student.class}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{student.avgScore}%</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              student.progress === "Advanced"
                                ? "default"
                                : student.progress === "On Track"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {student.progress}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{student.lastActive}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/students/${student.id}/progress-report`}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Report
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Progress Reports</CardTitle>
              <CardDescription>View aggregated reports for entire classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Class</th>
                      <th className="px-4 py-3 text-left font-medium">Teacher</th>
                      <th className="px-4 py-3 text-left font-medium">Students</th>
                      <th className="px-4 py-3 text-left font-medium">Avg. Score</th>
                      <th className="px-4 py-3 text-left font-medium">Last Active</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classItem) => (
                      <tr key={classItem.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?text=${classItem.name}`} alt={classItem.name} />
                              <AvatarFallback>{classItem.name}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">Class {classItem.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{classItem.teacher}</td>
                        <td className="px-4 py-3">{classItem.students}</td>
                        <td className="px-4 py-3">{classItem.avgScore}%</td>
                        <td className="px-4 py-3">{classItem.lastActive}</td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/classes/${classItem.id}/analytics`}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Report
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Analytics Reports</CardTitle>
              <CardDescription>View usage and performance data for educational games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-12 text-center">
                <div className="space-y-3">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Game Analytics</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Detailed game analytics reports are coming soon. This feature will allow you to track student
                    engagement and performance across all educational games.
                  </p>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
