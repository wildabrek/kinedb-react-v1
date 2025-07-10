"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { getStrengths, updateStrength , apiRequest} from "@/lib/api"
import type { Strength } from "@/lib/api"
 import { getStrengthById } from "@/lib/api"
 import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface DevelopmentStrength {
 strength_id: number
 name: string
 description: string
 category: string
}

export default function EditStrengthPage({ params }: { params: { id: string } }) {
 const router = useRouter()
 const { toast } = useToast()
 const {id} = useParams()
 const strengthId = Number.parseInt(id)
 const [strength, setStrength] = useState<Strength | null>(null)
 const [loading, setLoading] = useState(true)
 const [isSaving, setIsSaving] = useState(false)
 const [categories, setCategories] = useState<string[]>([])
 const [selectedCategory, setSelectedCategory] = useState<string>("")
 const [area, setArea] = useState<DevelopmentStrength>({
   strength_id: 0,
   name: "",
   description: "",
   category: "Academic",
 })

 useEffect(() => {
   async function loadStrength() {
     try {
       setLoading(true)

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

   loadStrength()
 }, [strengthId, router, toast])
useEffect(() => {
  async function loadCategories() {
    try {
      const res = await apiRequest<string[]>("/categories")
      setCategories(res)
    } catch (error) {
      console.error("Kategori verisi alınamadı", error)
    }
  }

  loadCategories()
}, [])
 const handleSave = async () => {
   if (!strength) return

   setIsSaving(true)
   try {
     await updateStrength(strength.strength_id, {
       name: strength.name,
       description: strength.description,
       category : selectedCategory,
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

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   if (!strength) return
   const { name, value } = e.target
   setStrength((prev) => ({
     ...prev,
     [name]: value,
   }))
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
   return null
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
                 <Input
                     id="description"
                     name="description"
                     value={strength.description || ""}
                     onChange={handleInputChange}
                     placeholder="e.g., Ability to analyze problems"
                 />
             </div>
             <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
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
               {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
               Save Changes
           </Button>
       </div>
   </div>
 )
}
