"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  type Teacher,
  type TeacherDB,
  getTeachers,
  deleteTeacher,
  updateTeacherStatus,
  getLocalTeachers,
  type LocalTeacherData,
} from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, MoreHorizontal, Trash2, Edit, Eye } from "lucide-react"

export default function TeachersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Teacher>("first_name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    setLoading(true)
    setError(null)
    try {
      const dbTeachers: TeacherDB[] = await getTeachers()
      const localTeachersData: LocalTeacherData[] = getLocalTeachers()

      const localTeachersMap = new Map<string, LocalTeacherData>()
      localTeachersData.forEach((t) => {
        localTeachersMap.set(t.teacher_id, t)
      })

      const combinedTeachers: Teacher[] = []
      const processedLocalTeacherIds = new Set<string>()

      dbTeachers.forEach((dbTeacher) => {
        const localData = localTeachersMap.get(dbTeacher.teacher_id)
        const combinedTeacher: Teacher = {
          ...dbTeacher,
          local_id: localData?.local_id || "",
          name: localData?.name || dbTeacher.first_name,
          surname: localData?.surname || dbTeacher.last_name,
          email: localData?.email || dbTeacher.email,
          first_name: dbTeacher.first_name,
          last_name: dbTeacher.last_name,
        }
        combinedTeachers.push(combinedTeacher)
        if (localData) {
          processedLocalTeacherIds.add(dbTeacher.teacher_id)
        }
      })

      localTeachersData.forEach((localTeacher) => {
        if (!processedLocalTeacherIds.has(localTeacher.teacher_id)) {
          combinedTeachers.push({
            local_id: localTeacher.local_id,
            teacher_id: localTeacher.teacher_id,
            name: localTeacher.name,
            surname: localTeacher.surname,
            email: localTeacher.email,
            school_id: localTeacher.school_id,
            status: localTeacher.status,
            first_name: localTeacher.name,
            last_name: localTeacher.surname,
          })
        }
      })

      setTeachers(combinedTeachers)
    } catch (err) {
      console.error("Failed to fetch teachers:", err)
      setError("Failed to load teachers. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load teachers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedTeachers = useMemo(() => {
    let filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (sortColumn) {
      filtered = filtered.sort((a, b) => {
        const aValue = sortColumn === "first_name" ? a.name : sortColumn === "last_name" ? a.surname : a[sortColumn]
        const bValue = sortColumn === "first_name" ? b.name : sortColumn === "last_name" ? b.surname : b[sortColumn]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
        return 0
      })
    }
    return filtered
  }, [teachers, searchTerm, sortColumn, sortDirection])

  const handleSort = (column: keyof Teacher) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleDeleteClick = (teacherId: string) => {
    setTeacherToDelete(teacherId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (teacherToDelete) {
      setLoading(true)
      try {
        await deleteTeacher(teacherToDelete)
        await fetchTeachers()
        toast({
          title: "Success",
          description: "Teacher deleted successfully.",
        })
      } catch (err) {
        console.error("Failed to delete teacher:", err)
        setError("Failed to delete teacher. Please try again.")
        toast({
          title: "Error",
          description: "Failed to delete teacher. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setShowDeleteDialog(false)
        setTeacherToDelete(null)
      }
    }
  }

  const handleToggleStatus = async (teacherId: string, currentStatus: "active" | "inactive") => {
    setLoading(true)
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      await updateTeacherStatus(teacherId, newStatus)
      await fetchTeachers()
      toast({
        title: "Success",
        description: `Teacher status updated to ${newStatus}.`,
      })
    } catch (err) {
      console.error("Failed to update teacher status:", err)
      setError("Failed to update teacher status. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update teacher status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading teachers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Teachers</h1>
        <Button onClick={() => router.push("/teachers/create")}>
          <Plus className="mr-2 h-4 w-4" /> Add Teacher
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("first_name")}>
                First Name {sortColumn === "first_name" && (sortDirection === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("last_name")}>
                Last Name {sortColumn === "last_name" && (sortDirection === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                Email {sortColumn === "email" && (sortDirection === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                Status {sortColumn === "status" && (sortDirection === "asc" ? "▲" : "▼")}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No teachers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTeachers.map((teacher) => (
                <TableRow key={teacher.teacher_id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.surname}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        teacher.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/teachers/${teacher.teacher_id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleStatus(teacher.teacher_id, teacher.status as "active" | "inactive")
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" /> {teacher.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(teacher.teacher_id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the teacher.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
