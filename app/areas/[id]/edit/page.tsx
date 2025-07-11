"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getDevelopmentAreas, apiRequest, updateDevelopmentArea } from "@/lib/api"
import type { DevelopmentArea } from "@/lib/api"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditAreaPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [areaId, setAreaId] = useState<number | null>(null)
  const [area, setArea] = useState<DevelopmentArea>({
    area_id: 0,
    name: "",
    description: "",
    category: "Academic",
  })
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  // Get the ID from params
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      const id = Number.parseInt(resolvedParams.id)
      setAreaId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiRequest<string[]>("/categories")
        setCategories(response)
      } catch (err) {
        console.error("Kategori verisi alınamadı:", err)
        toast({
          title: "Error",
          description: "Failed to load categories.",
          variant: "destructive",
        })
      }
    }

    loadCategories()
  }, [toast])

  useEffect(() => {
    if (areaId === null) return

    async function loadAreaData() {
      try {
        setLoading(true)
        const areasData = await getDevelopmentAreas()
        const areaData = areasData.find((area) => area.area_id === areaId)

        if (areaData) {
          setArea(areaData)
        } else {
          toast({
            title: "Error",
            description: "Area not found",
            variant: "destructive",
          })
          router.push("/areas")
        }
      } catch (error) {
        console.error("Error loading area data:", error)
        toast({
          title: "Error",
          description: "Failed to load area data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAreaData()
  }, [areaId, router, toast])

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      await updateDevelopmentArea(area.area_id, {
        name: area.name,
        description: area.description,
        category: area.category,
      })

      toast({
        title: "Area Updated",
        description: `${area?.name} has been updated successfully.`,
      })
      setIsSubmitting(false)
      router.push("/areas")
    } catch (error) {
      console.error("Error updating area:", error)
      toast({
        title: "Error",
        description: "Failed to update area. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setArea((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const updateArea = (key: string, value: string) => {
    setArea((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading area data...</p>
        </div>
      </div>
    )
  }

  if (!area) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold">Area Not Found</h2>
              <p className="mt-2">Unable to load area information.</p>
              <Button className="mt-4" onClick={() => router.push("/areas")}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log("Seçilen kategori:", area.category)
  console.log("Dropdown verisi:", categories)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9 bg-transparent">
          <Link href="/areas">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to areas</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Area</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Area Information</CardTitle>
          <CardDescription>Edit area details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={area.name} onChange={handleInputChange} placeholder="Enter area name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={area.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter a description of the area"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={area.category} onValueChange={(value) => updateArea("category", value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/areas">Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
