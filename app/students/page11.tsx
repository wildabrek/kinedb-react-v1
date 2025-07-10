"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Download } from "lucide-react"
import { useActions } from "@/contexts/action-context"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { students } from "@/utils/data" // Import students from our data utility
import {ProtectedRoute} from "@/components/protected-route";
import {useLanguage} from "@/contexts/language-context";
import {PermissionGuard} from "@/components/permission-guard";
import {PERMISSIONS} from "@/constants/permissions";
import { getStudents, deleteStudent } from "@/lib/api"
import type { Student } from "@/lib/api"


export default function StudentsPage() {
  const {translate :t} = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const { deleteItem, editItem, viewDetails, createItem, exportData } = useActions()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  //const [selectedStudent, setSelectedStudent] = useState<(typeof students)[0] | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<(typeof students)[0] | null>(null)

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await getStudents()
        setStudents(data || [])
      } catch (error) {
        console.error("Error loading students:", error)
        toast({
          title: t("Error"),
          description: t("Failed to load students. Please try again."),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [toast, t])

  const handleAddStudent = () => {
    createItem("student")
  }

  const handleExportData = () => {
    exportData("student")
  }

  const handleDeleteClick = (student: (typeof students)[0]) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedStudent) {
      try {
        await deleteItem("student", selectedStudent.id, selectedStudent.name)
        // In a real app, you would update the students list here
      } catch (error) {
        console.error("Error deleting student:", error)
      }
    }
  }

  const handleViewDetails = (student: (typeof students)[0]) => {
    viewDetails("student", student.id)
  }

  const columns = [
    {
      header: t("Name"),
      accessorKey: "name",
    },
    {
      header: t("Grade"),
      accessorKey: "grade",
    },
    {
      header: t("Average Score"),
      accessorKey: "averageScore",
      cell: (row: (typeof students)[0]) => (
        <div className="flex items-center">
          <span
            className={
              row.avgScore >= 90 ? "text-green-500" : row.avgScore >= 70 ? "text-yellow-500" : "text-red-500"
            }
          >
            {row.avgScore}%
          </span>
        </div>
      ),
    },
    {
      header: t("Last Active"),
      accessorKey: "lastActive",
    },
    {
      header: t("Status"),
      accessorKey: "status",
      cell: (row: (typeof students)[0]) => (
        <div className="flex items-center">
          <Badge variant={row.status === "active" ? "default" : "secondary"}>
            {row.status === "active" ? t("Active") : t("Inactive")}
          </Badge>
        </div>
      ),
    },
  ]

  const renderActions = (student: Student) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">{t("Open menu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewDetails(student)}>
          <Eye className="mr-2 h-4 w-4" />
          {t("View Details")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("Edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeleteClick(student)} className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          {t("Delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columns = [
    {
      header: t("Name"),
      accessorKey: "name",
    },
    {
      header: t("Grade"),
      accessorKey: "grade",
    },
    {
      header: t("Average Score"),
      accessorKey: "avg_score",
      cell: (row: Student) => {
        const score = row.avg_score
        return (
          <div className="flex items-center">
            <span
              className={
                score && score >= 90 ? "text-green-500" : score && score >= 70 ? "text-yellow-500" : "text-red-500"
              }
            >
              {score ? `${score}%` : t("N/A")}
            </span>
          </div>
        )
      },
    },
    {
      header: t("Last Active"),
      accessorKey: "last_active",
      cell: (row: Student) => {
        const date = row.last_active
        return date ? new Date(date).toLocaleDateString() : t("Never")
      },
    },
    {
      header: t("Status"),
      accessorKey: "status",
      cell: (row: Student) => {
        const status = row.status
        return (
          <div className="flex items-center">
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {status === "active" ? t("Active") : t("Inactive")}
            </Badge>
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">{t("Loading students...")}</p>
        </div>
      </div>
    )
  }

  return (
      <ProtectedRoute>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{t("Students")}</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                {t("Export")}
              </Button>
              <Button onClick={handleAddStudent}>
                <Plus className="mr-2 h-4 w-4" /> {t("Add Student")}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("All Students")}</CardTitle>
              <CardDescription>{t("Manage your students")}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={students}
                columns={columns}
                searchKey="name"
                filterKey="status"
                filterOptions={[
                  { label: t("Active"), value: "active" },
                  { label: t("Inactive"), value: "inactive" },
                ]}
                onRowClick={handleViewDetails}
                actions={renderActions}
                pageSize={8}
              />
            </CardContent>
          </Card>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Delete Student")}</DialogTitle>
                <DialogDescription>
                  {selectedStudent && (
                    <>
                      {t("Are you sure you want to delete")} {selectedStudent.name}? {t("This action cannot be undone.")}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  {t("Delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ProtectedRoute>
  )
}
