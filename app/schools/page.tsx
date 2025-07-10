"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import {
  getSchools,
  updateSchoolStatus,
  type School,
  deleteSchool,
  getLocalSchools,
  setAllLocalData,
  getLocalData,
} from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Database, HardDrive } from "lucide-react"
// Add the import for SchoolSyncDialog at the top
import { SchoolSyncDialog } from "@/components/school-sync-dialog"

interface ExtendedSchool extends School {
  isLocal?: boolean
  source?: "api" | "local"
}

export default function SchoolsPage() {
  const { translate: t } = useLanguage()
  const [schools, setSchools] = useState<ExtendedSchool[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchAndMergeSchools() {
      try {
        setLoading(true)
        console.log("Fetching schools from API and local storage...")

        // Fetch from API
        let apiSchools: School[] = []
        try {
          apiSchools = await getSchools()
          console.log("API Schools:", apiSchools)
        } catch (error) {
          console.error("Failed to fetch API schools:", error)
          toast({
            title: t("Warning"),
            description: t("Failed to load schools from database. Showing local data only."),
            variant: "destructive",
          })
        }

        // Fetch from local storage
        const localSchools = getLocalSchools()
        console.log("Local Schools:", localSchools)

        const mergedSchools: ExtendedSchool[] = []

        // Add API schools first
        apiSchools.forEach((school) => {
          mergedSchools.push({
            ...school,
            isLocal: false,
            source: "api",
          })
        })

        // Add local schools
        localSchools.forEach((localSchool) => {
          // Create a unique ID for local schools if they don't have one
          const schoolId =
            localSchool.school_id || Number.parseInt(localSchool.local_id) || -Math.floor(Math.random() * 1000000)

          // Check if this school already exists in API schools
          const existsInApi = apiSchools.some((apiSchool) => apiSchool.school_id === schoolId && schoolId > 0)

          if (!existsInApi) {
            mergedSchools.push({
              school_id: schoolId,
              school_name: localSchool.school_name,
              city: localSchool.city,
              status: localSchool.status,
              isLocal: true,
              source: "local",
            })
          }
        })

        console.log("Merged Schools:", mergedSchools)
        setSchools(mergedSchools)

        if (mergedSchools.length === 0) {
          toast({
            title: t("Info"),
            description: t("No schools found. You can create a new school or upload data from JSON."),
          })
        }
      } catch (error) {
        console.error("Error fetching schools:", error)
        toast({
          title: t("Error"),
          description: t("Failed to load schools"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAndMergeSchools()
  }, [t])

  const handleToggleStatus = async (schoolId: number, currentStatus: string, isLocal: boolean) => {
    const newStatus = currentStatus === "Active" ? "Disabled" : "Active"

    try {
      if (isLocal || schoolId <= 0) {
        // Update local school status
        const localData = getLocalData()
        const updatedSchools = localData.schools.map((school) => {
          if ((school.school_id && school.school_id === schoolId) || Number.parseInt(school.local_id) === schoolId) {
            return { ...school, status: newStatus }
          }
          return school
        })

        setAllLocalData({
          ...localData,
          schools: updatedSchools,
        })

        setSchools((prev) =>
          prev.map((school) => (school.school_id === schoolId ? { ...school, status: newStatus } : school)),
        )

        toast({
          title: t("Success"),
          description: t("Local school status updated"),
        })
      } else {
        // Update API school status
        await updateSchoolStatus(schoolId, newStatus)
        setSchools((prev) =>
          prev.map((school) => (school.school_id === schoolId ? { ...school, status: newStatus } : school)),
        )

        toast({
          title: t("Success"),
          description: t("School status updated"),
        })
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      toast({
        title: t("Error"),
        description: t("Failed to update school status"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteSchool = async (schoolId: number, isLocal: boolean) => {
    if (!confirm(t("Are you sure you want to delete this school?"))) {
      return
    }

    try {
      if (isLocal || schoolId <= 0) {
        // Delete local school
        const localData = getLocalData()
        const updatedSchools = localData.schools.filter(
          (school) => !(school.school_id === schoolId || Number.parseInt(school.local_id) === schoolId),
        )

        setAllLocalData({
          ...localData,
          schools: updatedSchools,
        })

        setSchools((prev) => prev.filter((school) => school.school_id !== schoolId))

        toast({
          title: t("Success"),
          description: t("Local school deleted"),
        })
      } else {
        // Delete API school
        await deleteSchool(schoolId)
        setSchools((prev) => prev.filter((school) => school.school_id !== schoolId))

        toast({
          title: t("Success"),
          description: t("School deleted"),
        })
      }
    } catch (error) {
      console.error("Failed to delete school:", error)
      toast({
        title: t("Error"),
        description: t("Failed to delete school"),
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("Schools")}</h1>
          <p className="text-muted-foreground mt-1">{t("Manage schools from database and local data")}</p>
        </div>
        {/* Update the header section to include the sync dialog */}
        <div className="flex gap-2">
          <SchoolSyncDialog onSyncComplete={() => window.location.reload()} />
          <Button variant="outline" onClick={() => router.push("/initial-setup")}>
            {t("Import Data")}
          </Button>
          <Button onClick={() => router.push("/schools/new")}>{t("Create New School")}</Button>
        </div>
      </div>

      {schools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("No schools found")}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push("/schools/new")}>{t("Create New School")}</Button>
            <Button variant="outline" onClick={() => router.push("/initial-setup")}>
              {t("Import from JSON")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {schools.map((school) => (
            <div
              key={`${school.source}-${school.school_id}`}
              className="flex justify-between items-center border p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{school.school_name}</h2>
                  <div className="flex gap-1">
                    {school.isLocal ? (
                      <Badge variant="secondary" className="text-blue-600 border-blue-600">
                        <HardDrive className="h-3 w-3 mr-1" />
                        {t("Local")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Database className="h-3 w-3 mr-1" />
                        {t("Database")}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-500">{school.city}</p>
                {school.isLocal && (
                  <p className="text-xs text-blue-600 mt-1">
                    {t("This school is stored locally and not synced to the database")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Switch
                  checked={school.status === "Active"}
                  onCheckedChange={() =>
                    handleToggleStatus(school.school_id, String(school.status), school.isLocal || false)
                  }
                />
                <span className="text-gray-500 min-w-[60px]">{school.status}</span>

                <Button variant="outline" size="sm" onClick={() => router.push(`/schools/${school.school_id}/edit`)}>
                  {t("Edit")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSchool(school.school_id, school.isLocal || false)}
                >
                  {t("Delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
