"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getDevelopmentAreas, deleteArea } from "@/lib/api"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useLanguage } from "@/contexts/language-context"

// Add a deleteArea function since it's not in the API yet
//async function deleteArea(id: number): Promise<boolean> {

//  console.log(`Deleting development area with ID: ${id}`)
//  return true
//}

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { translate } = useLanguage()

  useEffect(() => {
    async function loadAreas() {
      try {
        setLoading(true)
        const areasData = await getDevelopmentAreas()

        const formattedAreas = areasData.map((area) => ({
          id: area.area_id,
          name: area.name,
          description: area.description || "",
          category: area.category || "General",
        }))

        setAreas(formattedAreas)
      } catch (error) {
        console.error("Error loading development areas:", error)
        toast({
          title: translate("Error"),
          description: translate("Failed to load development areas data"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAreas()
  }, [toast, translate])

  const handleAddArea = () => {
    router.push("/areas/new")
  }

  const handleEditArea = (area: any) => {
    router.push(`/areas/${area.id}/edit`)
  }

  const handleDeleteArea = async () => {
    if (areaToDelete) {
      try {
        await deleteArea(areaToDelete)
        setAreas(areas.filter((a) => a.id !== areaToDelete))
        toast({
          title: translate("Success"),
          description: translate("Development area deleted successfully"),
        })
      } catch (error) {
        console.error("Error deleting development area:", error)
        toast({
          title: translate("Error"),
          description: translate("Failed to delete development area"),
          variant: "destructive",
        })
      } finally {
        setShowDeleteDialog(false)
        setAreaToDelete(null)
      }
    }
  }

  const confirmDelete = (id: number) => {
    setAreaToDelete(id)
    setShowDeleteDialog(true)
  }

  const columns = [
    {
      header: translate("Name"),
      accessorKey: "name",
    },
    {
      header: translate("Description"),
      accessorKey: "description",
    },
    {
      header: translate("Category"),
      accessorKey: "category",
      cell: (row: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{row.category}</span>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{translate("Development Areas")}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleAddArea}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {translate("Add Development Area")}
          </Button>
          <Button variant="outline" onClick={() => router.push("/strengths/manage-areas")}>
            {translate("Manage Possible Areas")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{translate("All Development Areas")}</CardTitle>
          <CardDescription>{translate("Manage student development areas and categories")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>{translate("Loading development areas...")}</p>
            </div>
          ) : (
            <DataTable
              data={areas}
              columns={columns}
              searchKey="name"
              filterKey="category"
              filterOptions={Array.from(new Set(areas.map((a) => a.category))).map((category) => ({
                label: category as string,
                value: category as string,
              }))}
              actions={(row) => (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditArea(row)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => confirmDelete(row.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={translate("Delete Development Area")}
        description={translate("Are you sure you want to delete this development area? This action cannot be undone.")}
        onConfirm={handleDeleteArea}
      />
    </div>
  )
}
