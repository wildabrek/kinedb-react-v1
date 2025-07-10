"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getTeacherById, updateTeacher } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

export default function EditTeacherPage() {
  const {translate: t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    teacher_id: "",
    first_name: "",
    last_name: "",
    email: "",
    status: true,
    school_id: "", // ⬅️ EKLEDİK
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTeacher() {
      try {
        const teacher = await getTeacherById(Number(params.id))
        setFormData({
          teacher_id: String(teacher.teacher_id),
          first_name: teacher.first_name,
          last_name: teacher.last_name,
          email: teacher.email || "",
          status: teacher.status === "active",
          school_id: String(teacher.school_id),
        })
      } catch (error) {
        console.error(error)
        toast({
          title: t("Error"),
          description: t("Failed to load teacher"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchTeacher()
    }
  }, [params.id, toast, t])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateTeacher(Number(params.id), {
        teacher_id: Number(formData.teacher_id),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        status: formData.status ? "active" : "inactive",
        school_id: Number(formData.school_id),
      })

      toast({
        title: t("Success"),
        description: t("Teacher updated successfully."),
      })

      router.push("/teachers")
    } catch (error) {
      console.error(error)
      toast({
        title: t("Error"),
        description: t("Failed to update teacher."),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("Edit Teacher")}</h1>

      {isLoading ? (
        <div>{t("Loading...")}</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>{t("Teacher Information")}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t("First Name")}</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">{t("Last Name")}</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 flex items-center gap-4">
                <Label htmlFor="status">{t("Active")}</Label>
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                {t("Cancel")}
              </Button>
              <Button type="submit">
                {t("Update Teacher")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}
