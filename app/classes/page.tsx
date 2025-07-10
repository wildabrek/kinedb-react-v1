"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getClasses,
  getStudentsByClassId,
  getTeachers,
  getLocalClasses,
  type Class as ApiClass,
  type LocalClassData,
  type Teacher as ApiTeacher,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Users,
  UserPlus,
  BarChart,
} from "lucide-react"

// UI'da gösterilecek sınıf tipi (PII içerebilir)
interface DisplayClass {
  class_id: string
  class_name: string
  grade_level?: string
  description?: string
  schedule?: string
  location?: string
  status: string
  teacher_id: string
  school_id: number
  last_active?: string
  students?: number
  avgScore?: number
  gamesPlayed?: number
}

export default function ClassesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const { translate: t } = useLanguage()
  const currentSchoolId = user?.school_id

  const [allClasses, setAllClasses] = useState<DisplayClass[]>([])
  const [filteredClasses, setFilteredClasses] = useState<DisplayClass[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]) // Use ApiTeacher for consistency
  const [selectedClass, setSelectedClass] = useState<DisplayClass | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAndMergeClasses = async () => {
      if (!currentSchoolId) {
        setError(t("School ID not found for the current user."))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 1. API'den sınıf verilerini çek
        const apiClasses: ApiClass[] = await getClasses(Number(currentSchoolId))

        // 2. Local Storage'dan sınıf verilerini çek
        const localClasses: LocalClassData[] = getLocalClasses()

        // 3. Verileri birleştir
        const mergedClassesMap = new Map<string, DisplayClass>()

        // API'den gelen sınıfları ekle, PII'yi local'dan al
        for (const apiClass of apiClasses) {
          const localMatch = localClasses.find((localC) => localC.class_id === apiClass.class_id)

          const displayClass: DisplayClass = {
            class_id: apiClass.class_id,
            class_name: localMatch?.name || apiClass.class_name,
            grade_level: localMatch?.grade_level || apiClass.grade_level,
            description: apiClass.description,
            schedule: apiClass.schedule,
            location: apiClass.location,
            status: apiClass.status,
            teacher_id: localMatch?.teacher_id || apiClass.teacher_id, // Prioritize local teacher_id if available
            school_id: apiClass.school_id,
            last_active: apiClass.last_active,
            students: apiClass.students,
            avgScore: apiClass.avgScore,
            gamesPlayed: apiClass.gamesPlayed,
          }
          mergedClassesMap.set(apiClass.class_id, displayClass)
        }

        // Sadece local'da olan sınıfları ekle
        for (const localClass of localClasses) {
          if (!mergedClassesMap.has(localClass.class_id)) {
            const displayClass: DisplayClass = {
              class_id: localClass.class_id,
              class_name: localClass.name,
              grade_level: localClass.grade_level,
              description: t("Local class"), // Default description for local-only
              schedule: "-",
              location: "-",
              status: localClass.status,
              teacher_id: localClass.teacher_id,
              school_id: localClass.school_id,
              last_active: "-",
              students: 0, // Default for local-only
              avgScore: 0, // Default for local-only
              gamesPlayed: 0, // Default for local-only
            }
            mergedClassesMap.set(localClass.class_id, displayClass)
          }
        }

        const finalClasses = Array.from(mergedClassesMap.values())

        // Öğretmen verilerini çek
        const teacherData: ApiTeacher[] = await getTeachers() // getTeachers returns TeacherDB[] which is compatible with ApiTeacher
        setTeachers(teacherData)

        // Sınıf verilerini öğrenci ve oyun bilgileriyle zenginleştir
        const updatedClassData = await Promise.all(
          finalClasses.map(async (cls: DisplayClass) => {
            // Only fetch students if class_id is valid (not a mock/local-only without proper ID)
            let studentsCount = cls.students || 0
            let avgScore = cls.avgScore || 0
            let totalGamesPlayed = cls.gamesPlayed || 0

            if (cls.class_id && cls.school_id) {
              try {
                const students = await getStudentsByClassId(Number(cls.class_id), Number(cls.school_id))
                studentsCount = students.length
                avgScore =
                  students.length > 0
                    ? students.reduce((sum: any, s: { avg_score: any }) => sum + (s.avg_score || 0), 0) /
                      students.length
                    : 0
                totalGamesPlayed = students.reduce(
                  (sum: any, s: { games_played: any }) => sum + (s.games_played || 0),
                  0,
                )
              } catch (studentFetchError) {
                console.warn(`Could not fetch students for class ${cls.class_id}:`, studentFetchError)
                // Keep default values if fetching fails
              }
            }

            return {
              ...cls,
              students: studentsCount,
              avgScore: Math.round(avgScore),
              gamesPlayed: totalGamesPlayed,
            }
          }),
        )

        setAllClasses(updatedClassData)
        setFilteredClasses(updatedClassData)
      } catch (err) {
        console.error("Failed to fetch or merge class data:", err)
        setError(t("Failed to load classes. Please try again later."))
      } finally {
        setLoading(false)
      }
    }
    fetchAndMergeClasses()
  }, [currentSchoolId, t])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredClasses(allClasses)
    } else {
      const filtered = allClasses.filter(
        (c) =>
          c.class_name.toLowerCase().includes(query.toLowerCase()) ||
          (c.teacher_id && getTeacherNameById(c.teacher_id).toLowerCase().includes(query.toLowerCase())), // Search by teacher name
      )
      setFilteredClasses(filtered)
    }
  }

  const getTeacherNameById = (id: string) => {
    // Changed id type to string
    const teacher = teachers.find((t) => t.teacher_id === id)
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : t("Unknown")
  }

  const handleAddClass = () => router.push("/classes/create")

  const handleAction = (type: string, classId: string) => {
    // Changed classId type to string
    if (type === "details") router.push(`/classes/${classId}`)
    if (type === "edit") router.push(`/classes/${classId}/edit`)
    if (type === "students") router.push(`/classes/${classId}?tab=students`)
    if (type === "analytics") router.push(`/classes/${classId}/analytics`)
    if (type === "delete") {
      setSelectedClass(filteredClasses.find((c) => c.class_id === classId))
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedClass) {
      toast({ title: t("Class Deleted"), description: t(`Class ${selectedClass.class_name} deleted.`) })
      setFilteredClasses((prev) => prev.filter((c) => c.class_id !== selectedClass.class_id))
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>
  }

  return (
    <ProtectedRoute>
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold">{t("Classes")}</h1>
          <Button onClick={handleAddClass} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> {t("Add Class")}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("Search classes...")}
              className="pl-10"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {}}>
              <Filter className="h-4 w-4 mr-2" /> {t("Filter")}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" /> {t("Export")}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Class")}</TableHead>
                <TableHead>{t("Teacher")}</TableHead>
                <TableHead>{t("Students")}</TableHead>
                <TableHead>{t("Avg. Score")}</TableHead>
                <TableHead>{t("Games")}</TableHead>
                <TableHead>{t("Last Active")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    {t("No classes found.")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((c) => (
                  <TableRow key={c.class_id} className="hover:bg-muted">
                    <TableCell>{c.class_name}</TableCell>
                    <TableCell>{getTeacherNameById(c.teacher_id)}</TableCell>
                    <TableCell>
                      <Users className="inline h-4 w-4 mr-1" /> {c.students || 0}
                    </TableCell>
                    <TableCell>{c.avgScore ?? 0}%</TableCell>
                    <TableCell>{c.gamesPlayed ?? 0}</TableCell>
                    <TableCell>{c.last_active ? new Date(c.last_active).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>{t(c.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("details", c.class_id)}>
                            <Eye className="h-4 w-4 mr-2" /> {t("View Details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("edit", c.class_id)}>
                            <Pencil className="h-4 w-4 mr-2" /> {t("Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("students", c.class_id)}>
                            <UserPlus className="h-4 w-4 mr-2" /> {t("Students")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("analytics", c.class_id)}>
                            <BarChart className="h-4 w-4 mr-2" /> {t("Analytics")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("delete", c.class_id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> {t("Delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t("Delete Class")}
          description={t(`Are you sure you want to delete class ${selectedClass?.class_name}?`)}
          onConfirm={handleDeleteConfirm}
          confirmText={t("Delete")}
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  )
}
