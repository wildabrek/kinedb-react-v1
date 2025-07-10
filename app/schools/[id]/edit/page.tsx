"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { getSchool, updateSchool, getLocalSchools, setAllLocalData, getLocalData, type School } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function EditSchoolPage() {
  const { translate: t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const schoolId = Number.parseInt(params.id as string)

  const [school, setSchool] = useState<School | null>(null)
  const [isLocal, setIsLocal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    school_name: "",
    city: "",
    status: "Active",
  })

  useEffect(() => {
    async function fetchSchool() {
      try {
        setLoading(true)

        // Check if this is a local school (negative or zero ID)
        if (schoolId <= 0) {
          setIsLocal(true)
          const localSchools = getLocalSchools()
          const localSchool = localSchools.find(
            (s) => (s.school_id && s.school_id === schoolId) || s.local_id === schoolId.toString(),
          )

          if (localSchool) {
            const schoolData: School = {
              school_id: localSchool.school_id || schoolId,
              school_name: localSchool.school_name,
              city: localSchool.city,
              status: localSchool.status,
            }
            setSchool(schoolData)
            setFormData({
              school_name: localSchool.school_name,
              city: localSchool.city,
              status: localSchool.status,
            })
          } else {
            toast({
              title: t("Error"),
              description: t("School not found in local data"),
              variant: "destructive",
            })
            router.push("/schools")
          }
        } else {
          // This is an API school
          setIsLocal(false)
          const schoolData = await getSchool(schoolId)
          setSchool(schoolData)
          setFormData({
            school_name: schoolData.school_name,
            city: schoolData.city || "",
            status: schoolData.status || "Active",
          })
        }
      } catch (error) {
        console.error("Error fetching school:", error)
        toast({
          title: t("Error"),
          description: t("Failed to load school data"),
          variant: "destructive",
        })
        router.push("/schools")
      } finally {
        setLoading(false)
      }
    }

    if (schoolId) {
      fetchSchool()
    }
  }, [schoolId, router, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.school_name.trim() || !formData.city.trim()) {
      toast({
        title: t("Error"),
        description: t("Please fill in all required fields"),
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      if (isLocal) {
        // Update local school
        const localData = getLocalData()
        const updatedSchools = localData.schools.map((school) => {
          if ((school.school_id && school.school_id === schoolId) || school.local_id === schoolId.toString()) {
            return {
              ...school,
              school_name: formData.school_name,
              city: formData.city,
              status: formData.status,
            }
          }
          return school
        })

        setAllLocalData({
          ...localData,
          schools: updatedSchools,
        })

        toast({
          title: t("Success"),
          description: t("Local school updated successfully. Note: Changes are not synced to the database."),
        })
      } else {
        // Update API school
        await updateSchool(schoolId, {
          school_name: formData.school_name,
          address: formData.city, // API expects 'address' field
        })

        toast({
          title: t("Success"),
          description: t("School updated successfully"),
        })
      }

      router.push("/schools")
    } catch (error) {
      console.error("Error updating school:", error)
      toast({
        title: t("Error"),
        description: t("Failed to update school"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!school) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("School not found")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/schools")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Schools")}
        </Button>
        <h1 className="text-3xl font-bold">{t("Edit School")}</h1>
        {isLocal && <Badge variant="secondary">Local</Badge>}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("School Details")}
            {isLocal && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {t("Local Data")}
              </Badge>
            )}
          </CardTitle>
          {isLocal && (
            <p className="text-sm text-muted-foreground">
              {t("This school is stored locally and changes will not be synced to the database.")}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school_name">{t("School Name")} *</Label>
              <Input
                id="school_name"
                value={formData.school_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, school_name: e.target.value }))}
                placeholder={t("Enter school name")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t("City")} *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder={t("Enter city")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("Status")}</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">{t("Active")}</option>
                <option value="Inactive">{t("Inactive")}</option>
                <option value="Disabled">{t("Disabled")}</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("Save Changes")}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/schools")} className="flex-1">
                {t("Cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
