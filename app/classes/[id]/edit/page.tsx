"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { API_BASE_URL, getClassesBySchoolId } from "@/lib/api"

export default function EditClassPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams() as { id: string }
  const { translate: t } = useLanguage()
  const classId = params.id

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    grade: "",
    description: "",
    schedule: "",
    location: "",
    status: true,
    school_id: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [schools, setSchools] = useState<{ school_id: number; school_name: string }[]>([])
  const [teachers, setTeachers] = useState<{ teacher_id: number; name: string; school_id: number }[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [schoolsRes, teachersRes, classRes] = await Promise.all([
          fetch(`${API_BASE_URL}/schools`),
          fetch(`${API_BASE_URL}/teachers`),
          fetch(`${API_BASE_URL}/classes/${classId}`)
        ])

        const schoolsData = await schoolsRes.json()
        const teachersData = await teachersRes.json()
        const classData = await classRes.json()

        setSchools(schoolsData)
        setTeachers(teachersData)

        setFormData({
          name: classData.class_name || "",
          teacher_id: String(classData.teacher_id || ""),
          grade: classData.grade_level || "",
          description: classData.description || "",
          schedule: classData.schedule || "",
          location: classData.location || "",
          status: classData.status === "Active",
          school_id: String(classData.school_id || ""),
        })
      } catch (error) {
        console.error(error)
        toast({
          title: t("Error"),
          description: t("Failed to load class details"),
          variant: "destructive",
        })
        router.push("/classes")
      }
    }

    fetchData()
  }, [classId, t, router, toast])

  const filteredTeachers = formData.school_id
  ? teachers.filter((teacher) => teacher.school_id === parseInt(formData.school_id))
  : teachers


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = t("Class name is required")
    if (!formData.teacher_id.trim()) newErrors.teacher_id = t("Teacher selection is required")
    if (!formData.grade.trim()) newErrors.grade = t("Grade is required")
    if (!formData.school_id.trim()) newErrors.school_id = t("School selection is required")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: t("Validation Error"),
        description: t("Please fill in all required fields"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        class_id: parseInt(classId),
        class_name: formData.name,
        grade_level: formData.grade,
        description: formData.description,
        schedule: formData.schedule,
        location: formData.location,
        status: formData.status ? "Active" : "Disabled",
        teacher_id: parseInt(formData.teacher_id),
        school_id: parseInt(formData.school_id),
      }

      const res = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const errorMessage = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail) || "Failed to update class"
        throw new Error(errorMessage)
      }

      toast({
        title: t("Class Updated"),
        description: t("Class {{name}} has been updated successfully", { name: formData.name }),
      })

      router.push("/classes")
    } catch (error) {
      console.error(error)
      toast({
        title: t("Error"),
        description: error instanceof Error ? error.message : t("Failed to update class. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/classes")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{t("Edit Class")}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Class Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Class Information")}</CardTitle>
              <CardDescription>{t("Enter the details for the new class")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* School Selection */}
              <div className="space-y-2">
                <Label htmlFor="school">{t("School")} <span className="text-red-500">*</span></Label>
                <Select value={formData.school_id} onValueChange={(value) => handleSelectChange("school_id", value)}>
                  <SelectTrigger id="school" className={errors.school_id ? "border-red-500" : ""}>
                    <SelectValue placeholder={t("Select school")} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.school_id} value={String(school.school_id)}>
                        {school.school_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.school_id && <p className="text-sm text-red-500">{errors.school_id}</p>}
              </div>

              {/* Teacher Selection */}
              <div className="space-y-2">
                <Label htmlFor="teacher">{t("Teacher")} <span className="text-red-500">*</span></Label>
                <Select value={formData.teacher_id} onValueChange={(value) => handleSelectChange("teacher_id", value)}>
                  <SelectTrigger id="teacher" className={errors.teacher_id ? "border-red-500" : ""}>
                    <SelectValue placeholder={t("Select teacher")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <SelectItem key={teacher.teacher_id} value={String(teacher.teacher_id)}>
                          {teacher.first_name} {teacher.last_name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">
                        {t("No teachers available for this school")}
                      </div>
                    )}
                  </SelectContent>
                </Select>

                {errors.teacher_id && <p className="text-sm text-red-500">{errors.teacher_id}</p>}
              </div>

              {/* Class Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("Class Name")} <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. 3A, 4B"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label htmlFor="grade">{t("Grade")} <span className="text-red-500">*</span></Label>
                <Input
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="e.g. 1st Grade"
                  className={errors.grade ? "border-red-500" : ""}
                />
                {errors.grade && <p className="text-sm text-red-500">{errors.grade}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="status">{t("Active")}</Label>
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) => handleSwitchChange("status", checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.status ? t("This class is active and visible to students") : t("This class is inactive")}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Additional Information")}</CardTitle>
              <CardDescription>{t("Provide more details about the class")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t("Enter a description of the class...")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">{t("Schedule")}</Label>
                <Input
                  id="schedule"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  placeholder="e.g. Mon, Wed, Fri 9:00 AM - 10:30 AM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t("Location")}</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Room 203, Building A"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <CardFooter className="flex justify-end gap-2 px-0 pt-6">
          <Button variant="outline" type="button" onClick={handleCancel}>
            {t("Cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Saving...")}
              </>
            ) : (
              t("Save Changes")
            )}
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}
