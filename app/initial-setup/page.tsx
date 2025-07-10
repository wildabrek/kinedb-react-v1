"use client"

import type React from "react"

import { CardDescription } from "@/components/ui/card"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"
import {
  createStudent,
  createTeacher,
  createClass,
  type StudentDB,
  type TeacherDB,
  type ClassDB,
  type LocalKineDBData,
  getLocalData,
  setAllLocalData,
  type LocalSchoolData, // Import LocalSchoolData
  type LocalStudentData, // Import LocalStudentData
  type LocalTeacherData, // Import LocalTeacherData
  type LocalClassData, // Import LocalClassData
} from "@/lib/api" // API fonksiyonlarını ve yeni DB tiplerini import et
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"

// UI'da kullanılacak tam veri modelleri (kişisel veriler dahil)
// These interfaces should ideally match LocalKineDBData interfaces for consistency
interface Student extends LocalStudentData {}
interface Teacher extends LocalTeacherData {}
interface Class extends LocalClassData {}
interface School extends LocalSchoolData {} // Add School interface

export default function InitialSetupPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [schools, setSchools] = useState<School[]>([]) // Add schools state
  const [currentStudent, setCurrentStudent] = useState({ name: "", surname: "", studentNumber: "", grade: "" })
  const [currentTeacher, setCurrentTeacher] = useState({ name: "", surname: "", email: "" })
  const [currentClass, setCurrentClass] = useState({ name: "", grade_level: "" })
  const [currentSchool, setCurrentSchool] = useState({ name: "", city: "" }) // Add currentSchool state
  const [selectedTeacherLocalId, setSelectedTeacherLocalId] = useState<string | undefined>(undefined)
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | undefined>("1") // Mock school ID for now
  const router = useRouter()
  const { translate:t } = useLanguage()
  const [activeTab, setActiveTab] = useState("students")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // UUID oluşturucu
  const generateUUID = () => crypto.randomUUID()

  // Local storage'dan mevcut verileri yükle
  useState(() => {
    const localData = getLocalData()
    setStudents(localData.students || [])
    setTeachers(localData.teachers || [])
    setClasses(localData.classes || [])
    setSchools(localData.schools || []) // Load schools from local storage
  }, [])

  // Mock school for now - this will be replaced by actual schools from state/API
  // For initial setup, we might want to allow adding a new school or selecting from existing.
  // For now, let's use the schools from the state.
  const availableSchools =
    schools.length > 0
      ? schools
      : [
          {
            school_id: 1,
            school_name: "KineDB Academy",
            city: "Mock City",
            status: "Active",
            local_id: "mock-school-1",
          },
        ]

  const handleAddStudent = () => {
    if (!currentStudent.name || !currentStudent.surname || !currentStudent.studentNumber || !currentStudent.grade) {
      toast({
        title: "Eksik Bilgi",
        description: "Öğrenci adı, soyadı, numarası ve sınıfı boş bırakılamaz.",
        variant: "destructive",
      })
      return
    }
    const newStudent: Student = {
      local_id: generateUUID(),
      student_internal_id: generateUUID(), // Veritabanı için UUID
      ...currentStudent,
      class_id: 0, // Bu daha sonra sınıfa atanabilir, API'ye gönderilecek
      school_id: Number(selectedSchoolId), // API'ye gönderilecek
      status: "Active", // API'ye gönderilecek
    }
    setStudents([...students, newStudent])
    setCurrentStudent({ name: "", surname: "", studentNumber: "", grade: "" })
    toast({
      title: "Başarılı",
      description: `${newStudent.name} ${newStudent.surname} öğrenci eklendi.`,
    })
  }

  const removeStudent = (localId: string) => {
    setStudents(students.filter((s) => s.local_id !== localId))
  }

  const handleAddTeacher = () => {
    if (!currentTeacher.name || !currentTeacher.surname || !currentTeacher.email) {
      toast({
        title: "Eksik Bilgi",
        description: "Öğretmen adı, soyadı ve e-postası boş bırakılamaz.",
        variant: "destructive",
      })
      return
    }
    const newTeacher: Teacher = {
      local_id: generateUUID(),
      teacher_id: generateUUID(), // Veritabanı için UUID
      ...currentTeacher,
      school_id: Number(selectedSchoolId), // API'ye gönderilecek
      status: "Active", // API'ye gönderilecek
    }
    setTeachers([...teachers, newTeacher])
    setCurrentTeacher({ name: "", surname: "", email: "" })
    toast({
      title: "Başarılı",
      description: `${newTeacher.name} ${newTeacher.surname} öğretmen eklendi.`,
    })
  }

  const removeTeacher = (localId: string) => {
    setTeachers(teachers.filter((t) => t.local_id !== localId))
  }

  const handleAddClass = () => {
    if (!currentClass.name || !currentClass.grade_level || !selectedTeacherLocalId || !selectedSchoolId) {
      toast({
        title: "Eksik Bilgi",
        description: "Sınıf adı, sınıf seviyesi, öğretmen ve okul boş bırakılamaz.",
        variant: "destructive",
      })
      return
    }

    const teacher = teachers.find((t) => t.local_id === selectedTeacherLocalId)
    if (!teacher) {
      toast({
        title: "Hata",
        description: "Seçilen öğretmen bulunamadı.",
        variant: "destructive",
      })
      return
    }

    const newClass: Class = {
      local_id: generateUUID(),
      class_id: generateUUID(), // Veritabanı için UUID
      ...currentClass,
      teacher_id: teacher.teacher_id, // Öğretmenin UUID'si
      school_id: Number(selectedSchoolId),
      status: "Active",
    }
    setClasses([...classes, newClass])
    setCurrentClass({ name: "", grade_level: "" })
    setSelectedTeacherLocalId(undefined)
    toast({
      title: "Başarılı",
      description: `${newClass.name} sınıfı eklendi.`,
    })
  }

  const removeClass = (localId: string) => {
    setClasses(classes.filter((c) => c.local_id !== localId))
  }

  const handleAddSchool = () => {
    if (!currentSchool.name || !currentSchool.city) {
      toast({
        title: "Eksik Bilgi",
        description: "Okul adı ve şehri boş bırakılamaz.",
        variant: "destructive",
      })
      return
    }
    const newSchool: School = {
      local_id: generateUUID(),
      school_id: -Math.abs(Math.floor(Math.random() * 1000000)), // Temporary negative ID for local-only schools
      school_name: currentSchool.name,
      city: currentSchool.city,
      status: "Active",
    }
    setSchools([...schools, newSchool])
    setCurrentSchool({ name: "", city: "" })
    toast({
      title: "Başarılı",
      description: `${newSchool.school_name} okulu eklendi.`,
    })
  }

  const removeSchool = (localId: string) => {
    setSchools(schools.filter((s) => s.local_id !== localId))
  }

  const handleSave = async () => {
    try {
      // 1. Tüm verileri local storage'a kaydet
      const localDataToSave: LocalKineDBData = {
        initialSetupComplete: true,
        students: students.map((s) => ({
          local_id: s.local_id,
          student_internal_id: s.student_internal_id,
          name: s.name,
          surname: s.surname,
          studentNumber: s.studentNumber,
          grade: s.grade,
          class_id: s.class_id,
          school_id: s.school_id,
          status: s.status,
        })),
        teachers: teachers.map((t) => ({
          local_id: t.local_id,
          teacher_id: t.teacher_id,
          name: t.name,
          surname: t.surname,
          email: t.email, // Added email
          school_id: t.school_id,
          status: t.status,
        })),
        classes: classes.map((c) => ({
          local_id: c.local_id,
          class_id: c.class_id,
          name: c.name,
          grade_level: c.grade_level,
          teacher_id: c.teacher_id, // Öğretmenin UUID'si
          school_id: c.school_id,
          status: c.status,
        })),
        schools: schools.map((s) => ({
          // Save schools to local storage
          local_id: s.local_id,
          school_id: s.school_id,
          school_name: s.school_name,
          city: s.city,
          status: s.status,
        })),
      }
      setAllLocalData(localDataToSave) // Tüm veriyi local storage'a kaydet ve initialSetupComplete'i true yap

      // 2. Veritabanına sadece gerekli (kişisel olmayan) verileri gönder
      // Note: Schools are not created via API here. This page primarily manages local data for students/teachers/classes.
      // School creation is handled separately in app/schools/new/page.tsx
      for (const student of students) {
        const studentDB: StudentDB = {
          student_internal_id: student.student_internal_id,
          name: student.name,
          surname: student.surname,
          class_id: student.class_id,
          school_id: student.school_id,
          status: student.status,
          grade: student.grade,
        }
        await createStudent(studentDB, student.school_id)
      }

      for (const teacher of teachers) {
        const teacherDB: TeacherDB = {
          teacher_id: teacher.teacher_id,
          first_name: teacher.name,
          last_name: teacher.surname,
          email: teacher.email, // Ensure email is passed
          school_id: teacher.school_id,
          status: teacher.status,
        }
        await createTeacher(teacherDB)
      }

      for (const classItem of classes) {
        const classDB: ClassDB = {
          class_id: classItem.class_id,
          class_name: classItem.name,
          grade_level: classItem.grade_level,
          teacher_id: classItem.teacher_id, // Öğretmenin UUID'si
          school_id: classItem.school_id,
          status: classItem.status,
        }
        await createClass(classDB)
      }

      toast({
        title: "Kurulum Tamamlandı",
        description: "Veriler başarıyla yerel depolamaya ve veritabanına kaydedildi.",
      })

      router.push("/dashboard") // Kurulum sonrası dashboard'a yönlendir
    } catch (error) {
      console.error("Veri kaydetme hatası:", error)
      // Improved error message display
      let errorMessage = "Bilinmeyen bir hata oluştu."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "detail" in error) {
        // Attempt to parse FastAPI error detail
        errorMessage = (error as any).detail
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map((e: any) => e.msg || e.loc?.join(".") + ": " + e.type).join(", ")
        }
      } else if (typeof error === "string") {
        errorMessage = error
      }

      toast({
        title: "Hata",
        description: `Veriler kaydedilirken bir sorun oluştu: ${errorMessage}. Lütfen tekrar deneyin.`,
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast({
        title: t("Error"),
        description: t("No file selected."),
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsedData: LocalKineDBData = JSON.parse(content)

        // Basic validation for the structure
        if (
          !parsedData.students ||
          !Array.isArray(parsedData.students) ||
          !parsedData.teachers ||
          !Array.isArray(parsedData.teachers) ||
          !parsedData.classes ||
          !Array.isArray(parsedData.classes) ||
          !parsedData.schools || // Validate schools array
          !Array.isArray(parsedData.schools)
        ) {
          throw new Error(
            t(
              "Invalid JSON structure. Please ensure it contains 'students', 'teachers', 'classes', and 'schools' arrays.",
            ),
          )
        }

        // Sanitize and normalize data from JSON before setting state
        const sanitizedStudents: Student[] = parsedData.students.map((s) => ({
          local_id: s.local_id || generateUUID(),
          student_internal_id: s.student_internal_id || generateUUID(),
          name: s.name || "",
          surname: s.surname || "",
          studentNumber: s.studentNumber || "",
          grade: s.grade || "",
          class_id: s.class_id || 0, // Ensure a default if missing
          school_id: s.school_id || Number(selectedSchoolId), // Use selectedSchoolId as fallback
          status: s.status || "Active",
        }))

        const sanitizedTeachers: Teacher[] = parsedData.teachers.map((t) => ({
          local_id: t.local_id || generateUUID(),
          teacher_id: t.teacher_id || generateUUID(),
          name: t.name || "",
          surname: t.surname || "",
          email: t.email || "", // Ensure email is a string, not null/undefined
          school_id: t.school_id || Number(selectedSchoolId), // Use selectedSchoolId as fallback
          status: t.status || "Active",
        }))

        const sanitizedClasses: Class[] = parsedData.classes.map((c) => ({
          local_id: c.local_id || generateUUID(),
          class_id: c.class_id || generateUUID(),
          name: c.name || "",
          grade_level: c.grade_level || "",
          teacher_id: c.teacher_id || "", // Ensure teacher_id is a string
          school_id: c.school_id || Number(selectedSchoolId), // Use selectedSchoolId as fallback
          status: c.status || "Active",
        }))

        const sanitizedSchools: School[] = parsedData.schools.map((s) => ({
          // Sanitize schools
          local_id: s.local_id || generateUUID(),
          school_id: s.school_id || -Math.abs(Math.floor(Math.random() * 1000000)), // Assign temporary negative ID if not provided
          school_name: s.school_name || "",
          city: s.city || "",
          status: s.status || "Active",
        }))

        setAllLocalData({
          initialSetupComplete: true,
          students: sanitizedStudents,
          teachers: sanitizedTeachers,
          classes: sanitizedClasses,
          schools: sanitizedSchools, // Save sanitized schools to local storage
        })
        // Yüklenen verileri UI state'ine yansıt
        setStudents(sanitizedStudents)
        setTeachers(sanitizedTeachers)
        setClasses(sanitizedClasses)
        setSchools(sanitizedSchools) // Update schools state

        toast({
          title: t("Success"),
          description: t("Data loaded successfully from JSON file."),
        })
      } catch (error: any) {
        let errorMessage = error.message || t("Failed to parse JSON file. Please ensure it's a valid JSON.")
        if (error.name === "SyntaxError") {
          errorMessage = t("Invalid JSON format. Please check the file content.")
        }
        toast({
          title: t("Error"),
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "" // Clear the file input
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{t("Initial Setup")}</CardTitle>
          <CardDescription className="text-center">
            {t("Please enter student, teacher, and class information to start using the system.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center space-x-4 border-b pb-4">
            <Button variant={activeTab === "students" ? "default" : "outline"} onClick={() => setActiveTab("students")}>
              {t("Students")}
            </Button>
            <Button variant={activeTab === "teachers" ? "default" : "outline"} onClick={() => setActiveTab("teachers")}>
              {t("Teachers")}
            </Button>
            <Button variant={activeTab === "classes" ? "default" : "outline"} onClick={() => setActiveTab("classes")}>
              {t("Classes")}
            </Button>
            <Button variant={activeTab === "schools" ? "default" : "outline"} onClick={() => setActiveTab("schools")}>
              {t("Schools")}
            </Button>
          </div>

          {/* JSON Upload Section */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="text-xl font-semibold">{t("Load Data from JSON")}</h3>
            <p className="text-sm text-gray-600">
              {t("You can load existing student, teacher, and class data from a JSON file.")}
            </p>
            <div className="flex items-center space-x-2">
              <Label htmlFor="json-upload" className="sr-only">
                {t("Upload JSON File")}
              </Label>
              <Input
                id="json-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="flex-1"
              />
            </div>
          </div>

          {activeTab === "students" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t("Add New Student")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">{t("Student Name")}</Label>
                  <Input
                    id="student-name"
                    value={currentStudent.name}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                    placeholder={t("Student Name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-surname">{t("Student Surname")}</Label>
                  <Input
                    id="student-surname"
                    value={currentStudent.surname}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, surname: e.target.value })}
                    placeholder={t("Student Surname")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-number">{t("Student Number")}</Label>
                  <Input
                    id="student-number"
                    value={currentStudent.studentNumber}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, studentNumber: e.target.value })}
                    placeholder={t("e.g. 12345")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-grade">{t("Grade")}</Label>
                  <Input
                    id="student-grade"
                    value={currentStudent.grade}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, grade: e.target.value })}
                    placeholder={t("e.g. 5th Grade")}
                  />
                </div>
              </div>
              <Button onClick={handleAddStudent} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> {t("Add Student")}
              </Button>
              <div className="mt-4">
                <h4 className="text-lg font-medium">{t("Added Students")}:</h4>
                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">{t("No students added yet.")}</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {students.map((s) => (
                      <li key={s.local_id} className="flex items-center justify-between text-sm">
                        <span>
                          {s.name} {s.surname} ({s.studentNumber}) - {s.grade}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => removeStudent(s.local_id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "teachers" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t("Add New Teacher")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">{t("First Name")}</Label>
                  <Input
                    id="teacher-name"
                    value={currentTeacher.name}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, name: e.target.value })}
                    placeholder={t("Teacher First Name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-surname">{t("Last Name")}</Label>
                  <Input
                    id="teacher-surname"
                    value={currentTeacher.surname}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, surname: e.target.value })}
                    placeholder={t("Teacher Last Name")}
                  />
                </div>
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="teacher-email">{t("Email")}</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    value={currentTeacher.email}
                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <Button onClick={handleAddTeacher} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> {t("Add Teacher")}
              </Button>
              <div className="mt-4">
                <h4 className="text-lg font-medium">{t("Added Teachers")}:</h4>
                {teachers.length === 0 ? (
                  <p className="text-sm text-gray-500">{t("No teachers added yet.")}</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {teachers.map((t) => (
                      <li key={t.local_id} className="flex items-center justify-between text-sm">
                        <span>
                          {t.name} {t.surname} ({t.email})
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => removeTeacher(t.local_id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "classes" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t("Add New Class")}</h3>
              <div className="space-y-2">
                <Label htmlFor="class-name">{t("Class Name")}</Label>
                <Input
                  id="class-name"
                  value={currentClass.name}
                  onChange={(e) => setCurrentClass({ ...currentClass, name: e.target.value })}
                  placeholder={t("e.g. 5A Class")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-grade-level">{t("Grade Level")}</Label>
                <Input
                  id="class-grade-level"
                  value={currentClass.grade_level}
                  onChange={(e) => setCurrentClass({ ...currentClass, grade_level: e.target.value })}
                  placeholder={t("e.g. 5")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-teacher">{t("Select Teacher")}</Label>
                <Select onValueChange={setSelectedTeacherLocalId} value={selectedTeacherLocalId}>
                  <SelectTrigger id="class-teacher">
                    <SelectValue placeholder={t("Select a teacher")} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.local_id} value={teacher.local_id}>
                        {teacher.name} {teacher.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {teachers.length === 0 && <p className="text-sm text-red-500">{t("Please add teachers first.")}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-school">{t("Select School")}</Label>
                <Select onValueChange={setSelectedSchoolId} value={selectedSchoolId}>
                  <SelectTrigger id="class-school">
                    <SelectValue placeholder={t("Select a school")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSchools.map((school) => (
                      <SelectItem key={school.local_id} value={school.school_id?.toString() || school.local_id}>
                        {school.school_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddClass} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> {t("Add Class")}
              </Button>
              <div className="mt-4">
                <h4 className="text-lg font-medium">{t("Added Classes")}:</h4>
                {classes.length === 0 ? (
                  <p className="text-sm text-gray-500">{t("No classes added yet.")}</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {classes.map((c) => (
                      <li key={c.local_id} className="flex items-center justify-between text-sm">
                        <span>
                          {c.name} ({c.grade_level}) - {t("Teacher")}:{" "}
                          {teachers.find((t) => t.local_id === c.teacher_id)?.name}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => removeClass(c.local_id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "schools" && ( // New Schools Tab
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t("Add New School")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">{t("School Name")}</Label>
                  <Input
                    id="school-name"
                    value={currentSchool.name}
                    onChange={(e) => setCurrentSchool({ ...currentSchool, name: e.target.value })}
                    placeholder={t("School Name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-city">{t("City")}</Label>
                  <Input
                    id="school-city"
                    value={currentSchool.city}
                    onChange={(e) => setCurrentSchool({ ...currentSchool, city: e.target.value })}
                    placeholder={t("City")}
                  />
                </div>
              </div>
              <Button onClick={handleAddSchool} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> {t("Add School")}
              </Button>
              <div className="mt-4">
                <h4 className="text-lg font-medium">{t("Added Schools")}:</h4>
                {schools.length === 0 ? (
                  <p className="text-sm text-gray-500">{t("No schools added yet.")}</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {schools.map((s) => (
                      <li key={s.local_id} className="flex items-center justify-between text-sm">
                        <span>
                          {s.school_name} ({s.city}) - {s.status}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => removeSchool(s.local_id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full mt-6">
            {t("Complete Setup and Save to Database")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
