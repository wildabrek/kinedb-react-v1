"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy } from "lucide-react"
import Link from "next/link"
import {getTopPerformers, Subject, getSubjects} from "@/lib/api"
import {useLanguage} from "@/contexts/language-context";

interface Performer {
  id: number
  name: string
  score: number
  avatar?: string
}

export default function TopPerformers() {
  const [subject, setSubject] = useState<string | undefined>()
  //const [subjects, setSubjects] = useState<string[]>([]) // << Subjects için yeni state
  const [subjects, setSubjects] = useState<Subject[]>([])
  //const [subject, setSubject] = useState()
  const [data, setData] = useState<Performer[]>([])
  const [loading, setLoading] = useState(true)
  const {translate:t}=useLanguage()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getTopPerformers(subject || "English")
        setData(result)
      } catch (error) {
        console.error("Top performers fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [subject])
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsData = await getSubjects()
        setSubjects(subjectsData)
      } catch (error) {
        console.error("Subjects fetch error:", error)
      }
    }
    fetchSubjects()
  }, [])
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>{t("Top Performers")}</CardTitle>
          <CardDescription>{t("Students with highest scores")}</CardDescription>
        </div>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.subject_id} value={subject.name || "English"}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {index === 0 && (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  </div>
                )}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{t("Score")}: {student.score}%</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/students/${student.id}`}>{t("View")}</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
