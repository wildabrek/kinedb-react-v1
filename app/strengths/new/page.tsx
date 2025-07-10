"use client"

import {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import {apiRequest, createStrength, updateStrength} from "@/lib/api"
 import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface Strength {
 strength_id: number
 name: string
 description: string
 category: string
}

export default function CreateStrengthPage() {
 const router = useRouter()
 const { toast } = useToast()
 const [strength, setStrength] = useState<Strength>({
   strength_id: 0,
   name: "",
   description: "",
   category: "Academic",
 })
 const [name, setName] = useState("")
 const [category, setCategory] = useState<string>("")

 const [description, setDescription] = useState("")
 const [categories, setCategories] = useState<string[]>([])
 const [isSubmitting, setIsSubmitting] = useState(false)
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
    }, [])
 const handleSave = async () => {
   setIsSubmitting(true)

   try {
     // Simulate API call
     await createStrength({ name, description, category })
     toast({
       title: "Strength Created",
       description: `${name} has been created successfully.`,
     })
     router.push("/strengths")
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to create strength. Please try again.",
       variant: "destructive",
     })
   } finally {
     setIsSubmitting(false)
   }
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
       <h1 className="text-3xl font-bold">Create New Strength</h1>
     </div>

     <Card>
       <CardHeader>
         <CardTitle>Strength Information</CardTitle>
         <CardDescription>Enter the details of the new strength</CardDescription>
       </CardHeader>
         <CardContent className="space-y-4">
             <div className="space-y-2">
                 <Label htmlFor="name">Name</Label>
                 <Input
                     id="name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="e.g., Problem Solving"
                 />
             </div>
             <div className="space-y-2">
                 <Label htmlFor="description">Description</Label>
                 <Input
                     id="description"
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     placeholder="e.g., Ability to analyze problems"
                 />
             </div>
             <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select value={category} onValueChange={(value) => setCategory(value)}>
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
           <Button onClick={handleSave} disabled={isSubmitting}>
               {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
               Create Strength
           </Button>
       </div>
   </div>
 )
}
