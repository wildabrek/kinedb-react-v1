"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Star, Info, Plus, Trash2, List } from 'lucide-react'
import { getDevelopmentAreas } from "@/lib/api"
import type { DevelopmentArea } from "@/lib/api"

export default function ManagePossibleAreasPage() {
 const router = useRouter()
 const { toast } = useToast()
 const [areas, setAreas] = useState<DevelopmentArea[]>([])
 const [loading, setLoading] = useState(true)
 const [newArea, setNewArea] = useState({
   id: "",
   label: "",
   description: "",
 })

 useEffect(() => {
   async function loadAreas() {
     try {
       const data = await getDevelopmentAreas()
       setAreas(data)
     } catch (error) {
       console.error("Error loading possible areas:", error)
       toast({
         title: "Error",
         description: "Failed to load possible areas. Please try again.",
         variant: "destructive",
       })
     } finally {
       setLoading(false)
     }
   }

   loadAreas()
 }, [toast])

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target
   setNewArea((prev) => ({
     ...prev,
     [name]: value,
   }))
 }

 const handleAddArea = async (e: React.FormEvent) => {
   e.preventDefault()

   if (!newArea.id || !newArea.label) {
     toast({
       title: "Validation Error",
       description: "ID and Label are required fields.",
       variant: "destructive",
     })
     return
   }

   // Check if ID contains only letters, numbers, and underscores
   if (!/^[a-zA-Z0-9_]+$/.test(newArea.id)) {
     toast({
       title: "Validation Error",
       description: "ID must contain only letters, numbers, and underscores.",
       variant: "destructive",
     })
     return
   }

   // Check if ID already exists
   if (areas.some((area) => area.area_id === Number.parseInt(newArea.id))) {
     toast({
       title: "Validation Error",
       description: "An area with this ID already exists.",
       variant: "destructive",
     })
     return
   }

   try {
     setLoading(true)
     // In a real app, this would be an API call to add the area
     const newAreaObj: DevelopmentArea = {
       area_id: Number.parseInt(newArea.id),
       name: newArea.label,
       description: newArea.description,
       category: "Custom",
     }

     // Simulate API call success
     setTimeout(() => {
       setAreas((prev) => [...prev, newAreaObj].sort((a, b) => a.name.localeCompare(b.name)))
       setNewArea({ id: "", label: "", description: "" })
       toast({
         title: "Success",
         description: "Area added successfully.",
       })
       setLoading(false)
     }, 500)
   } catch (error) {
     console.error("Error adding area:", error)
     toast({
       title: "Error",
       description: "Failed to add area. Please try again.",
       variant: "destructive",
     })
     setLoading(false)
   }
 }

 const handleDeleteArea = async (id: number) => {
   if (
     !confirm(
       `Are you sure you want to delete this area option?

ID: ${id}

This action will not remove it from games that already use this ID!`,
     )
   ) {
     return
   }

   try {
     setLoading(true)
     // In a real app, this would be an API call to delete the area

     // Simulate API call success
     setTimeout(() => {
       setAreas((prev) => prev.filter((area) => area.area_id !== id))
       toast({
         title: "Success",
         description: "Area deleted successfully.",
       })
       setLoading(false)
     }, 500)
   } catch (error) {
     console.error("Error deleting area:", error)
     toast({
       title: "Error",
       description: "Failed to delete area. Please try again.",
       variant: "destructive",
     })
     setLoading(false)
   }
 }

 if (loading && areas.length === 0) {
   return (
     <div className="flex items-center justify-center h-screen">
       <div className="text-center">
         <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
         <p className="mt-4 text-lg">Loading possible areas...</p>
       </div>
     </div>
   )
 }

 return (
   <div className="container mx-auto py-6 space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold flex items-center">
         <Star className="mr-2 h-6 w-6 text-yellow-500" />
         Manage Possible Area Options
       </h1>
     </div>

     <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
       <Info className="h-4 w-4" />
       <AlertDescription>
         This list defines potential area options that can be associated with games on the{" "}
         <strong>Game Editing</strong> page. Each option contains a unique <strong>ID</strong>, a user-friendly{" "}
         <strong>Label</strong>, and an optional <strong>Description</strong>. Changes here update the{" "}
         <code>possible_areas.json</code> file. Deleting an option here does not automatically remove it from existing
         game impacts (using this ID) in the <code>game_impacts.json</code> file. You need to edit the associated game
         impacts separately.
       </AlertDescription>
     </Alert>

     <Card className="shadow-sm">
       <CardHeader className="bg-gray-50">
         <div className="flex items-center">
           <Plus className="mr-2 h-4 w-4" />
           <CardTitle>Add New Area Option</CardTitle>
         </div>
       </CardHeader>
       <CardContent className="pt-6">
         <form onSubmit={handleAddArea} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
           <div className="md:col-span-3 space-y-2">
             <Label htmlFor="id" className="text-sm font-medium">
               ID <span className="text-red-500">*</span>
             </Label>
             <Input
               id="id"
               name="id"
               value={newArea.id}
               onChange={handleInputChange}
               placeholder="e.g., time_management"
               required
               pattern="[a-zA-Z0-9_]+"
               title="No spaces, only letters, numbers, and underscores (_)"
             />
             <p className="text-xs text-muted-foreground">
               Unique identifier (e.g., time_management). This ID is used in game impacts.
             </p>
           </div>
           <div className="md:col-span-4 space-y-2">
             <Label htmlFor="label" className="text-sm font-medium">
               Label <span className="text-red-500">*</span>
             </Label>
             <Input
               id="label"
               name="label"
               value={newArea.label}
               onChange={handleInputChange}
               placeholder="e.g., Time Management"
               required
             />
             <p className="text-xs text-muted-foreground">Name to display to users (e.g., Time Management).</p>
           </div>
           <div className="md:col-span-4 space-y-2">
             <Label htmlFor="description" className="text-sm font-medium">
               Description
             </Label>
             <Input
               id="description"
               name="description"
               value={newArea.description}
               onChange={handleInputChange}
               placeholder="Optional description"
             />
             <p className="text-xs text-muted-foreground">(Optional) Definition of the area.</p>
           </div>
           <div className="md:col-span-1 flex justify-end">
             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
               Add
             </Button>
           </div>
         </form>
       </CardContent>
     </Card>

     <Card className="shadow-sm">
       <CardHeader className="bg-gray-50">
         <div className="flex items-center">
           <List className="mr-2 h-4 w-4" />
           <CardTitle>Defined Area Options</CardTitle>
         </div>
       </CardHeader>
       <CardContent className="p-0">
         {areas.length > 0 ? (
           <div className="overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="w-[20%]">ID</TableHead>
                   <TableHead className="w-[30%]">Label</TableHead>
                   <TableHead className="w-[40%]">Description</TableHead>
                   <TableHead className="w-[10%] text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {areas.map((area) => (
                   <TableRow key={area.area_id}>
                     <TableCell>
                       <code>{area.area_id}</code>
                     </TableCell>
                     <TableCell>{area.name}</TableCell>
                     <TableCell className="text-sm text-muted-foreground">{area.description || ""}</TableCell>
                     <TableCell className="text-right">
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-8 w-8 p-0"
                         onClick={() => handleDeleteArea(area.area_id)}
                       >
                         <Trash2 className="h-4 w-4 text-red-500" />
                         <span className="sr-only">Delete</span>
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
         ) : (
           <div className="p-6 text-center text-muted-foreground">No area options defined yet.</div>
         )}
       </CardContent>
     </Card>
   </div>
 )
}
