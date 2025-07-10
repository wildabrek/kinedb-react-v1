"use client"

import React, {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import {createTeacher, getSchools} from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default function CreateTeacherPage() {
  const {translate: t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    status: true, // true = Active, false = Disabled
    school_id: "",
  })

  const [schools, setSchools] = useState<{ school_id: number, school_name: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchSchools() {
      try {
        const data = await getSchools()
        setSchools(data)
        // Eğer user.school_id varsa onu default seçelim
        if (user?.school_id) {
          setFormData((prev) => ({ ...prev, school_id: String(user.school_id) }))
        }
      } catch (error) {
        console.error("Okullar alınamadı:", error)
      }
    }

    fetchSchools()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, school_id: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.school_id) {
      toast({
        title: t("Validation Error"),
        description: t("First name, last name, and school selection are required."),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createTeacher({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        status: formData.status ? "Active" : "Disabled",
        school_id: Number(formData.school_id),
      })

      toast({
        title: t("Success"),
        description: t("Teacher created successfully."),
      })

      router.push("/teachers")
    } catch (error) {
      console.error(error)
      toast({
        title: t("Error"),
        description: t("Failed to create teacher."),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("Create New Teacher")}</h1>

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
                placeholder={t("Enter first name")}
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
                placeholder={t("Enter last name")}
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
                placeholder={t("Enter email (optional)")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">{t("Select School")} <span className="text-red-500">*</span></Label>
              <Select value={formData.school_id} onValueChange={(value) => handleSelectChange(value)}>
                <SelectTrigger id="school">
                  <SelectValue placeholder={t("Select a school")} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.school_id} value={String(school.school_id)}>
                      {school.school_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isSubmitting}>
              {t("Create Teacher")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
