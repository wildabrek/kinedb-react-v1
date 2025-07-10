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
import { Loader2, Star, Info, Plus, Trash2, List } from "lucide-react"
import { getPossibleStrengths } from "@/lib/api"
import type { PossibleStrength } from "@/lib/api"

export default function ManagePossibleStrengthsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [strengths, setStrengths] = useState<PossibleStrength[]>([])
  const [loading, setLoading] = useState(true)
  const [newStrength, setNewStrength] = useState({
    id: "",
    label: "",
    description: "",
  })

  useEffect(() => {
    async function loadStrengths() {
      try {
        const data = await getPossibleStrengths()
        setStrengths(data)
      } catch (error) {
        console.error("Error loading possible strengths:", error)
        toast({
          title: "Error",
          description: "Failed to load possible strengths. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStrengths()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewStrength((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddStrength = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStrength.id || !newStrength.label) {
      toast({
        title: "Validation Error",
        description: "ID and Label are required fields.",
        variant: "destructive",
      })
      return
    }

    // Check if ID contains only letters, numbers, and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(newStrength.id)) {
      toast({
        title: "Validation Error",
        description: "ID must contain only letters, numbers, and underscores.",
        variant: "destructive",
      })
      return
    }

    // Check if ID already exists
    if (strengths.some((strength) => strength.id === newStrength.id)) {
      toast({
        title: "Validation Error",
        description: "A strength with this ID already exists.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      // In a real app, this would be an API call to add the strength
      const newStrengthObj: PossibleStrength = {
        id: newStrength.id,
        label: newStrength.label,
        description: newStrength.description,
      }

      // Simulate API call success
      setTimeout(() => {
        setStrengths((prev) => [...prev, newStrengthObj].sort((a, b) => a.label.localeCompare(b.label)))
        setNewStrength({ id: "", label: "", description: "" })
        toast({
          title: "Success",
          description: "Strength added successfully.",
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error adding strength:", error)
      toast({
        title: "Error",
        description: "Failed to add strength. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleDeleteStrength = async (id: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this strength option?\n\nID: ${id}\n\nThis action will not remove it from games that already use this ID!`,
      )
    ) {
      return
    }

    try {
      setLoading(true)
      // In a real app, this would be an API call to delete the strength

      // Simulate API call success
      setTimeout(() => {
        setStrengths((prev) => prev.filter((strength) => strength.id !== id))
        toast({
          title: "Success",
          description: "Strength deleted successfully.",
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error deleting strength:", error)
      toast({
        title: "Error",
        description: "Failed to delete strength. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (loading && strengths.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading possible strengths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Star className="mr-2 h-6 w-6 text-yellow-500" />
          Manage Possible Strength Options
        </h1>
      </div>

      <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This list defines potential strength options that can be associated with games on the{" "}
          <strong>Game Editing</strong> page. Each option contains a unique <strong>ID</strong>, a user-friendly{" "}
          <strong>Label</strong>, and an optional <strong>Description</strong>. Changes here update the{" "}
          <code>possible_strengths.json</code> file. Deleting an option here does not automatically remove it from
          existing game impacts (using this ID) in the <code>game_impacts.json</code> file. You need to edit the
          associated game impacts separately.
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            <CardTitle>Add New Strength Option</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddStrength} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="id" className="text-sm font-medium">
                ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="id"
                name="id"
                value={newStrength.id}
                onChange={handleInputChange}
                placeholder="e.g., problem_solving"
                required
                pattern="[a-zA-Z0-9_]+"
                title="No spaces, only letters, numbers, and underscores (_)"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (e.g., problem_solving). This ID is used in game impacts.
              </p>
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label htmlFor="label" className="text-sm font-medium">
                Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="label"
                name="label"
                value={newStrength.label}
                onChange={handleInputChange}
                placeholder="e.g., Problem Solving"
                required
              />
              <p className="text-xs text-muted-foreground">Name to display to users (e.g., Problem Solving).</p>
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={newStrength.description}
                onChange={handleInputChange}
                placeholder="Optional description"
              />
              <p className="text-xs text-muted-foreground">(Optional) Definition of the strength.</p>
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
            <CardTitle>Defined Strength Options</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {strengths.length > 0 ? (
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
                  {strengths.map((strength) => (
                    <TableRow key={strength.id}>
                      <TableCell>
                        <code>{strength.id}</code>
                      </TableCell>
                      <TableCell>{strength.label}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{strength.description || ""}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteStrength(strength.id)}
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
            <div className="p-6 text-center text-muted-foreground">No strength options defined yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
