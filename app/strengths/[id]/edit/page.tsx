"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // Textarea import edildi
import { getStrengthById, updateStrength, apiRequest } from "@/lib/api"
import type { Strength } from "@/lib/api"

// Sayfa props'larının bir Promise içerebileceğini belirten tür tanımı.
interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditStrengthPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()

  // ID'yi asenkron olarak çözmek ve veriyi tutmak için state'ler
  const [strengthId, setStrengthId] = useState<number | null>(null)
  const [strength, setStrength] = useState<Strength | null>(null)

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  // HATA DÜZELTİLDİ: useParams hook'u kaldırıldı.

  // 1. Adım: Promise olan 'params' içinden ID'yi çöz ve state'e ata.
  useEffect(() => {
    async function getParams() {
      try {
        const resolvedParams = await params
        if (resolvedParams && resolvedParams.id) {
          const id = Number.parseInt(resolvedParams.id, 10)
          if (!isNaN(id)) {
            setStrengthId(id)
          } else {
            toast({ title: "Error", description: "Invalid Strength ID format.", variant: "destructive" })
            router.push("/strengths")
          }
        }
      } catch (error) {
        console.error("Failed to resolve params:", error)
        toast({ title: "Error", description: "Could not load page parameters.", variant: "destructive" })
        router.push("/strengths")
      }
    }
    getParams()
  }, [params, router, toast])

  // 2. Adım: Kategorileri yükle (ID'ye bağlı değil).
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

  // 3. Adım: 'strengthId' state'i dolduktan sonra bu effect çalışır ve veriyi çeker.
  useEffect(() => {
    if (strengthId === null) {
      return // Henüz ID çözülmediyse bekle.
    }

    async function loadStrengthData() {
      setLoading(true)
      try {
        const strengthData = await getStrengthById(strengthId)
        if (strengthData) {
          setStrength(strengthData)
        } else {
          toast({
            title: "Error",
            description: "Strength not found",
            variant: "destructive",
          })
          router.push("/strengths")
        }
      } catch (error) {
        console.error("Error loading strength:", error)
        toast({
          title: "Error",
          description: "Failed to load strength. Please try again.",
          variant: "destructive",
        })
        router.push("/strengths")
      } finally {
        setLoading(false)
      }
    }

    loadStrengthData()
  }, [strengthId, router, toast])

  const handleSave = async () => {
    if (!strength) return

    setIsSaving(true)
    try {
      await updateStrength(strength.strength_id, {
        name: strength.name,
        description: strength.description,
        category: strength.category,
      })
      toast({
        title: "Success",
        description: "Strength updated successfully",
      })
      router.push("/strengths")
    } catch (error) {
      console.error("Error updating strength:", error)
      toast({
        title: "Error",
        description: "Failed to update strength. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!strength) return
    const { name, value } = e.target
    setStrength((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleCategoryChange = (value: string) => {
    if (!strength) return
    setStrength((prev) => (prev ? { ...prev, category: value } : null))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading strength...</p>
        </div>
      </div>
    )
  }

  if (!strength) {
    return null // veya bir "Bulunamadı" mesajı gösterilebilir.
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/strengths">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to strengths</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Strength</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strength Information</CardTitle>
          <CardDescription>Edit the details of this strength</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={strength.name}
              onChange={handleInputChange}
              placeholder="e.g., Problem Solving"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea // Input yerine Textarea kullanıldı.
              id="description"
              name="description"
              value={strength.description || ""}
              onChange={handleInputChange}
              placeholder="e.g., Ability to analyze problems"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={strength.category} onValueChange={handleCategoryChange}>
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/strengths">Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
