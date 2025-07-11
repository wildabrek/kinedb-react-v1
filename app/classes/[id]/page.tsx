"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Edit, Pencil, Trash2, Users, UserPlus, BarChart2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useActions } from "@/contexts/action-context"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { apiRequest } from "@/lib/api"

// Sayfa props'larının bir Promise içerebileceğini belirten tür tanımı.
interface PageProps {
  params: Promise<{ id: string }>;
}

// Örnek veri (API hatası durumunda kullanılabilir)
const fallbackClassData = {
  id: 1,
  name: "Fallback Class",
  teacher: "N/A",
  students: 0,
  avgScore: 0,
  gamesPlayed: 0,
  lastActive: "Unknown",
  status: "inactive",
  description: "Could not load class data.",
  schedule: "N/A",
  location: "N/A",
  studentList: [],
  recentGames: [],
}

export default function ClassDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { deleteItem, exportData } = useActions()

  // State'ler
  const [classId, setClassId] = useState<string | null>(null)
  const [classData, setClassData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("students")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 10

  // 1. Adım: Promise olan 'params' içinden ID'yi çöz ve state'e ata.
  useEffect(() => {
    async function getParams() {
      try {
        const resolvedParams = await params
        if (resolvedParams && resolvedParams.id) {
          setClassId(resolvedParams.id)
        } else {
          toast({ title: "Error", description: "Class ID not found in URL.", variant: "destructive" })
          router.push("/classes")
        }
      } catch (err) {
        console.error("Failed to resolve params:", err)
        toast({ title: "Error", description: "Could not load page parameters.", variant: "destructive" })
        router.push("/classes")
      }
    }
    getParams()
  }, [params, router, toast])

  // 2. Adım: 'classId' state'i dolduktan sonra bu effect çalışır ve sınıf verisini çeker.
  useEffect(() => {
    if (classId === null) return // Henüz ID çözülmediyse bekle.

    const fetchClassData = async () => {
      setLoading(true)
      try {
        // HATA DÜZELTİLDİ: Sınıf ve öğretmen verilerini aynı anda çek.
        const [fetchedClass, allTeachers] = await Promise.all([
            apiRequest<any>(`/classes/${classId}`),
            apiRequest<any[]>(`/teachers`)
        ]);

        // Öğrencileri, sınıfın okul ID'sine göre çek.
        const students = await apiRequest<any[]>(`/students?class_id=${classId}&school_id=${fetchedClass.school_id}`)

        // Gelen teacher_id ile öğretmen listesinden doğru öğretmeni bul.
        const teacher = allTeachers.find(t => t.teacher_id === fetchedClass.teacher_id);
        const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}`.trim() : "Unknown Teacher";

        const avgScore = students.length > 0
          ? students.reduce((sum, s) => sum + (s.avg_score || 0), 0) / students.length
          : 0

        const totalGamesPlayed = students.reduce((sum, s) => sum + (s.games_played || 0), 0)

        const formattedData = {
          id: fetchedClass.class_id,
          name: fetchedClass.class_name,
          teacher: teacherName, // Bulunan öğretmen ismini kullan.
          students: students.length,
          avgScore: Math.round(avgScore),
          gamesPlayed: totalGamesPlayed,
          lastActive: fetchedClass.last_active || "Unknown",
          status: fetchedClass.status || "active",
          description: fetchedClass.description || "",
          schedule: fetchedClass.schedule || "",
          location: fetchedClass.location || "",
          studentList: students,
          recentGames: fetchedClass.recentGames || [],
        }

        setClassData(formattedData)
      } catch (error) {
        console.error("Error fetching class data:", error)
        toast({
          title: "Error",
          description: "Failed to load class data. Using fallback data instead.",
          variant: "destructive",
        })
        setClassData(fallbackClassData) // Hata durumunda fallback verisini kullan
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [classId, toast])

  // URL'deki 'tab' parametresini izle
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["students", "games", "analytics"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Olay Yöneticileri (Event Handlers)
  const handleEditClass = () => {
    if (!classId) return;
    router.push(`/classes/${classId}/edit`);
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!classId || !classData) return;
    try {
      await apiRequest(`/classes/${classId}`, "DELETE")
      deleteItem("classe", classId, `Class ${classData.name}`)
      setDeleteDialogOpen(false)
      router.push("/classes")
    } catch (error) {
      console.error("Error deleting class:", error)
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    if (!classId) return;
    exportData("classe", classId)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Sayfalama hesaplamaları
  const studentList = classData?.studentList || []
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = studentList.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(studentList.length / studentsPerPage)

  if (loading || !classData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href="/classes">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to classes</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Class Details</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm" onClick={handleEditClass}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Class
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Sınıf bilgi kartı */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Class {classData.name}</CardTitle>
              <CardDescription>{classData.description}</CardDescription>
            </div>
            <Badge variant={classData.status === "active" ? "default" : "secondary"}>
              {classData.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Teacher</div>
              <div className="font-medium">{classData.teacher}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Schedule</div>
              <div className="font-medium">{classData.schedule}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium">{classData.location}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <Users className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-medium">Students</p>
                <p className="text-xl font-bold">{classData.students}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <BarChart2 className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-xl font-bold">{classData.avgScore}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <Users className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-medium">Games Played</p>
                <p className="text-xl font-bold">{classData.gamesPlayed}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Sekmeler */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="games">Recent Games</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Students</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/students/create?classId=${classId}`}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Student
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Grade</th>
                      <th className="p-3 text-left font-medium">Avg. Score</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student: any) => (
                        <tr key={student.student_internal_id} className="border-b">
                          <td className="p-3">{student.name}</td>
                          <td className="p-3">{student.grade}</td>
                          <td className="p-3">{student.avg_score}%</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/students/${student.student_internal_id}`}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">View Student</span>
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">No students found for this class.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious onClick={() => handlePageChange(Math.max(1, currentPage - 1))} /></PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}><PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)}>{page}</PaginationLink></PaginationItem>
                      ))}
                      <PaginationItem><PaginationNext onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="games">
            <Card>
                <CardHeader><CardTitle>Recent Games</CardTitle></CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left font-medium">Game</th><th className="p-3 text-left font-medium">Date</th><th className="p-3 text-left font-medium">Avg. Score</th><th className="p-3 text-left font-medium">Actions</th></tr></thead>
                      <tbody>
                        {classData.recentGames.length > 0 ? (
                          classData.recentGames.map((game: any) => (
                            <tr key={game.id} className="border-b"><td className="p-3">{game.name}</td><td className="p-3">{game.date}</td><td className="p-3">{game.avgScore}%</td><td className="p-3"><Button variant="ghost" size="sm" asChild><Link href={`/games/${game.id}`}><Pencil className="h-4 w-4" /><span className="sr-only">View Game</span></Link></Button></td></tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">No recent games found for this class.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Analytics</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/classes/${classId}/analytics`}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Full Analytics
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete Class ${classData.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
