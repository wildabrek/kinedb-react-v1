"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, PlusCircle } from "lucide-react"
import Link from "next/link"
import { getStudents as getAnonymousStudents, getLocalStudents, type StudentDB, type LocalStudentData } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

// UI'da gösterilecek öğrenci tipi (PII içerir)
interface DisplayStudent {
  student_internal_id: string
  name: string
  surname: string
  studentNumber: string
  grade: string
  class_id: number
  school_id: number
  status: string
  avatar?: string
  email?: string
  phone?: string
  parent_name?: string
  parent_email?: string
  parent_phone?: string
  address?: string
}

export default function StudentsPage() {
  const { user } = useAuth()
  const { translate: t } = useLanguage()
  const [students, setStudents] = useState<DisplayStudent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAndMergeStudents = async () => {
      if (!user?.school_id) {
        setError(t("School ID not found for the current user."))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 1. API'den anonim öğrenci verilerini çek
        const anonymousStudents: StudentDB[] = await getAnonymousStudents(user.school_id)

        // 2. Local Storage'dan PII içeren öğrenci verilerini çek
        const localStudents: LocalStudentData[] = getLocalStudents()

        // 3. Verileri birleştir
        const mergedStudentsMap = new Map<string, DisplayStudent>()

        // API'den gelen öğrencileri ekle, PII'yi local'dan al
        for (const anonStudent of anonymousStudents) {
          const localMatch = localStudents.find(
            (localS) => localS.student_internal_id === anonStudent.student_internal_id,
          )

          const displayStudent: DisplayStudent = {
            student_internal_id: anonStudent.student_internal_id,
            name: localMatch?.name || anonStudent.name || t("Anonymous"),
            surname: localMatch?.surname || anonStudent.surname || "",
            studentNumber: localMatch?.studentNumber || "",
            grade: anonStudent.grade || t("N/A"),
            class_id: anonStudent.class_id,
            school_id: anonStudent.school_id || user.school_id,
            status: anonStudent.status || "active",
            avatar: localMatch?.avatar || "/placeholder.svg?height=40&width=40&text=Student",
            email: localMatch?.email,
            phone: localMatch?.phone,
            parent_name: localMatch?.parent_name,
            parent_email: localMatch?.parent_email,
            parent_phone: localMatch?.parent_phone,
            address: localMatch?.address,
          }
          mergedStudentsMap.set(anonStudent.student_internal_id, displayStudent)
        }

        // Sadece local'da olan öğrencileri ekle
        for (const localStudent of localStudents) {
          if (!mergedStudentsMap.has(localStudent.student_internal_id)) {
            const displayStudent: DisplayStudent = {
              student_internal_id: localStudent.student_internal_id,
              name: localStudent.name,
              surname: localStudent.surname,
              studentNumber: localStudent.studentNumber,
              grade: localStudent.grade,
              class_id: localStudent.class_id,
              school_id: localStudent.school_id,
              status: localStudent.status,
              avatar: localStudent.avatar || "/placeholder.svg?height=40&width=40&text=Student",
              email: localStudent.email,
              phone: localStudent.phone,
              parent_name: localStudent.parent_name,
              parent_email: localStudent.parent_email,
              parent_phone: localStudent.parent_phone,
              address: localStudent.address,
            }
            mergedStudentsMap.set(localStudent.student_internal_id, displayStudent)
          }
        }

        setStudents(Array.from(mergedStudentsMap.values()))
      } catch (err) {
        console.error("Failed to fetch or merge students:", err)
        setError(t("Failed to load students. Please try again later."))
      } finally {
        setLoading(false)
      }
    }

    fetchAndMergeStudents()
  }, [user?.school_id, t])

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.surname} ${student.studentNumber}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("Students")}</h1>
        <Link href="/students/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add New Student")}
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Input
          type="text"
          placeholder={t("Search students...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-md w-full"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStudents.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">{t("No students found.")}</p>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.student_internal_id} className="flex flex-col items-center p-4">
              <Avatar className="mb-3 h-16 w-16">
                <AvatarImage src={student.avatar || "/placeholder.svg"} alt={`${student.name} ${student.surname}`} />
                <AvatarFallback>
                  {student.name.charAt(0)}
                  {student.surname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg font-semibold text-center">
                {student.name} {student.surname}
              </CardTitle>
              <CardContent className="text-sm text-gray-500 text-center p-0">
                <p>
                  {t("Grade")}: {student.grade}
                </p>
                <p>
                  {t("Student No")}: {student.studentNumber}
                </p>
              </CardContent>
              <Link href={`/students/${student.student_internal_id}/profile`} className="mt-4 w-full">
                <Button variant="outline" className="w-full">
                  {t("View Profile")}
                </Button>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
