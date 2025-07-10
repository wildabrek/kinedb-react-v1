"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getStudent } from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"

export default function StudentPage({ params }: { params: { id: string } }) {
  const {id}= useParams()
  const studentId = Number.parseInt(id)
  const router = useRouter()
  const { toast } = useToast()
  const { translate: t } = useLanguage()
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    async function loadStudentData() {
      if (isNaN(studentId)) {
        router.push("/students")
        return
      }

      try {
        setLoading(true)
        const studentData = await getStudent(studentId)

        if (!studentData) {
          router.push("/students")
          return
        }

        // Redirect to the new profile page
        router.push(`/students/${studentId}/profile`)
      } catch (error) {
        console.error("Error loading student data:", error)
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again.",
          variant: "destructive",
        })
        router.push("/students")
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [studentId, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">{t("Loading student data...")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("Redirecting...")}</h2>
        <p className="mt-2">{t("Taking you to the student profile page.")}</p>
        <Button className="mt-4" asChild>
          <Link href={`/students/${studentId}/profile`}>{t("Go to Profile")}</Link>
        </Button>
      </div>
    </div>
  )
}
