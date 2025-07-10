"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPossibleStrengths, deleteStrength } from "@/lib/api"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export default function StrengthsPage() {
  const [strengths, setStrengths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [strengthToDelete, setStrengthToDelete] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { translate: t } = useLanguage()

  useEffect(() => {
    async function loadStrengths() {
      try {
        setLoading(true)
        const possibleStrengths = await getPossibleStrengths()

        const formattedStrengths = possibleStrengths.map((strength) => ({
          id: Number.parseInt(String(strength.id)),
          name: strength.name,
          description: strength.description || "",
          category: strength.category, // Default category since it's not in the possible-strengths.json
        }))

        setStrengths(formattedStrengths)
      } catch (error) {
        console.error("Error loading strengths:", error)
        toast({
          title: "Error",
          description: "Failed to load strengths data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStrengths()
  }, [toast])

  const handleAddStrength = () => {
    router.push("/strengths/new")
  }

  const handleEditStrength = (strength: any) => {
    router.push(`/strengths/${strength.id}/edit`)
  }

  const handleDeleteStrength = async () => {
    if (strengthToDelete) {
      try {
        await deleteStrength(strengthToDelete)
        setStrengths(strengths.filter((s) => s.id !== strengthToDelete))
        toast({
          title: "Success",
          description: "Strength deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting strength:", error)
        toast({
          title: "Error",
          description: "Failed to delete strength",
          variant: "destructive",
        })
      } finally {
        setShowDeleteDialog(false)
        setStrengthToDelete(null)
      }
    }
  }

  const confirmDelete = (id: number) => {
    setStrengthToDelete(id)
    setShowDeleteDialog(true)
  }

  const columns = [
    {
      header: t("Name"),
      accessorKey: "name",
    },
    {
      header: t("Description"),
      accessorKey: "description",
    },
    {
      header: t("Category"),
      accessorKey: "category",
      cell: (row: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{row.category}</span>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("Strengths")}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleAddStrength}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("Add Strength")}
          </Button>
          <Button variant="outline" onClick={() => router.push("/strengths/manage-possible")}>
            {t("Manage Possible Strengths")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("All Strengths")}</CardTitle>
          <CardDescription>{t("Manage student strengths and categories")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>{t("Loading strengths...")}</p>
            </div>
          ) : (
            <DataTable
              data={strengths}
              columns={columns}
              searchKey="name"
              filterKey="category"
              filterOptions={Array.from(new Set(strengths.map((s) => s.category))).map((category) => ({
                label: category as string,
                value: category as string,
              }))}
              actions={(row) => (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditStrength(row)}>
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
        title={t("Delete Strength")}
        description={t("Are you sure you want to delete this strength? This action cannot be undone.")}
        onConfirm={handleDeleteStrength}
      />
    </div>
  )
}
