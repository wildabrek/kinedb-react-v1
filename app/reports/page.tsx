"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getStudents, getClasses } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { BarChart3, Download, FileText, Printer, Search, User, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReportsPage() {
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedProgress, setSelectedProgress] = useState("all")

  const fetchData = async () => {
    setLoading(true)
    try {
      if (!user?.school_id) {
        console.error("No school ID found for user.")
        return
      }
      const [studentData, classData] = await Promise.all([
        getStudents(Number(user.school_id)),
        getClasses(Number(user.school_id)),
      ])
      setStudents(studentData)
      setClasses(classData)
    } catch (error) {
      console.error("Veri çekme hatası:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user?.school_id) {
      fetchData()
    }
  }, [user])

  let filteredData = [...students]

  if (searchQuery) {
    filteredData = filteredData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  if (selectedClass !== "all") {
    filteredData = filteredData.filter((item) => item.class_id?.toString() === selectedClass)
  }

  if (selectedProgress !== "all") {
    filteredData = filteredData.filter((item) => item.progress_status === selectedProgress)
  }

  const pageSize = 10
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

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
                        {classes.map((c) => (
                          <SelectItem key={c.class_id} value={c.class_id.toString()}>
                            Class {c.class_name}
                          </SelectItem>
                        ))}
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((student) => (
                      <TableRow key={student.student_internal_id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{student.class_id}</TableCell>
                        <TableCell>{student.avg_score}</TableCell>
                        <TableCell>{student.progress_status}</TableCell>
                        <TableCell>{student.last_active}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
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
                      <tr key={classItem.class_id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?text=${classItem.name}`} alt={classItem.name} />
                              <AvatarFallback>{classItem.name}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">Class {classItem.class_name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{classItem.teacher}</td>
                        <td className="px-4 py-3">{classItem.students}</td>
                        <td className="px-4 py-3">{classItem.avgScore}%</td>
                        <td className="px-4 py-3">{classItem.lastActive}</td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/classes/${classItem.class_id}/analytics`}>
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
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Game Analytics</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Track student engagement and performance across all educational games with our detailed analytics
                  reports.
                </p>
                <Button asChild>
                  <Link href="/reports/game-analytics">View Game Analytics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
