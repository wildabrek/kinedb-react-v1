"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getClasses, getStudentById, updateStudent } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Save, Undo } from "lucide-react"
import Link from "next/link"

export default function EditStudentPage() {
  const router = useRouter()
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    grade: "",
    class_id: "",
    teacher: "",
    status: "active",
    notes: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
  })

  const [classes, setClasses] = useState<{ class_id: number; class_name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadStudentAndClasses = async () => {
      if (!user?.school_id || !id) return
      try {
        const [studentData, classData] = await Promise.all([
          getStudentById(Number(id)),
          getClasses(Number(user.school_id)),
        ])

        setFormData({
          name: studentData.name || "",
          email: studentData.email || "",
          phone: studentData.phone || "",
          address: studentData.address || "",
          grade: studentData.grade || "",
          class_id: studentData.class_id?.toString() || "",
          teacher: studentData.teacher || "",
          status: studentData.status || "active",
          notes: studentData.notes || "",
          parent_name: studentData.parent_name || "",
          parent_email: studentData.parent_email || "email",
          parent_phone: studentData.parent_phone || "",
        })

        setClasses(classData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load student or classes.",
          variant: "destructive",
        })
      }
    }

    loadStudentAndClasses()
  }, [id, user?.school_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !user) return

    try {
      setLoading(true)

      await updateStudent(Number(id), {
        student_internal_id: Number(id),
        school_id: Number(user.school_id),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        grade: formData.grade,
        class_id: Number(formData.class_id),
        status: formData.status,
        notes: formData.notes,
        parent_name: formData.parent_name,
        parent_email: formData.parent_email,
        parent_phone: formData.parent_phone,
      })

      toast({
        title: "Success",
        description: "Student updated successfully.",
      })

      router.push("/students")
    } catch (error) {
      console.error("Error updating student:", error)
      toast({
        title: "Error",
        description: "Failed to update student.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    router.refresh()
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href={`/students/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Student</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic details about the student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
            <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Grade"
                name="grade"
                value={formData.grade}
                options={["1st", "2nd", "3rd", "4th", "5th"]}
                onChange={(val) => setFormData((prev) => ({ ...prev, grade: val }))}
              />
              <SelectField
                label="Class"
                name="class_id"
                value={formData.class_id}
                options={classes.map((cls) => ({ label: cls.class_name, value: cls.class_id.toString() }))}
                onChange={(val) => setFormData((prev) => ({ ...prev, class_id: val }))}
              />
            </div>
            <SelectField
              label="Teacher"
              name="teacher"
              value={formData.teacher}
              options={["Ms. Johnson", "Mr. Williams", "Ms. Davis", "Mr. Miller"]}
              onChange={(val) => setFormData((prev) => ({ ...prev, teacher: val }))}
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === "active"}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, status: checked ? "active" : "inactive" }))}
              />
              <Label htmlFor="status">Active Student</Label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Parent or guardian details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField label="Parent Name" name="parent_name" value={formData.parent_name} onChange={handleChange} />
              <InputField label="Parent Email" name="parent_email" value={formData.parent_email} onChange={handleChange} />
              <InputField label="Parent Phone" name="parent_phone" value={formData.parent_phone} onChange={handleChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional notes about the student</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={5}
                placeholder="Enter any notes about the student..."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          <Undo className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

// Küçük yardımcı bileşenler
function InputField({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} value={value} onChange={onChange} />
    </div>
  )
}

function SelectField({ label, name, value, options, onChange }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={name}>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: any) =>
            typeof opt === "string" ? (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ) : (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
