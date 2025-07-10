"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/components/ui/use-toast"
import { createSchool } from "@/lib/api"

export default function NewSchoolPage() {
  const router = useRouter()
  const { translate: t } = useLanguage()
  const [school, setSchool] = useState({
    school_name: "",
    city: "",
    status: "Active",
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!school.school_name.trim() || !school.city.trim()) {
      toast({
        title: t("Error"),
        description: t("Please fill in all required fields"),
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await createSchool({
        school_name: school.school_name,
        city: school.city,
      })

      toast({
        title: t("Success"),
        description: t("School created successfully"),
      })

      router.push("/schools")
    } catch (error) {
      console.error("Okul oluşturulamadı:", error)
      toast({
        title: t("Error"),
        description: t("Failed to create school"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/schools")
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("Create New School")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="school_name">{t("School Name")} *</Label>
            <Input
              id="school_name"
              value={school.school_name}
              onChange={(e) => setSchool({ ...school, school_name: e.target.value })}
              placeholder={t("Enter school name")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t("City")} *</Label>
            <Input
              id="city"
              value={school.city}
              onChange={(e) => setSchool({ ...school, city: e.target.value })}
              placeholder={t("Enter city")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t("Status")}</Label>
            <Select value={school.status} onValueChange={(value) => setSchool({ ...school, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">{t("Active")}</SelectItem>
                <SelectItem value="Inactive">{t("Inactive")}</SelectItem>
                <SelectItem value="Disabled">{t("Disabled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving || !school.school_name.trim() || !school.city.trim()}
              className="flex-1"
            >
              {saving ? t("Creating") + "..." : t("Create School")}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={saving} className="flex-1 bg-transparent">
              {t("Cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
