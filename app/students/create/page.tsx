"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createStudent, getClasses } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function CreateStudentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    class_id: "",
  })
  const [classes, setClasses] = useState<{ class_id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  const loadClasses = async () => {
    if (!user?.school_id) return
    try {
      const classData = await getClasses(Number(user.school_id))
      setClasses(
        classData.map((c) => ({
          class_id: c.class_id,
          name: c.class_name,
        }))
      )
    } catch (error) {
      console.error("Error loading classes:", error)
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      })
    }
  }

  if (user?.school_id) {
    loadClasses()
  }
}, [user?.school_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.school_id) return

    try {
      setLoading(true)
      await createStudent(formData, Number(user?.school_id));
      toast({
        title: "Success",
        description: "Student created successfully.",
      })
      router.push("/students")
    } catch (error) {
      console.error("Error creating student:", error)
      toast({
        title: "Error",
        description: "Failed to create student.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Grade</Label>
              <Input name="grade" value={formData.grade} onChange={handleChange} required />
            </div>
            <div>
              <Label>Class</Label>
              <Select value={formData.class_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, class_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Create Student"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
