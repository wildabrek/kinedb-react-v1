"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getStudent } from "@/lib/api"
import {
  Loader2, ArrowLeft, Users, Mail, Phone, Calendar, Clock,
  BarChart2, Trophy, Star, Gamepad2 as GameController2,
  Edit, Download, Printer, Trash2, Share2, MessageSquare,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudentPerformanceChart from "@/components/student-performance-chart"
import StudentSkillsRadar from "@/components/student-skills-radar"
import StudentGameHistory from "@/components/student-game-history"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/protected-route"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [activeTab, setActiveTab] = useState("performance")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!id) return
        const data = await getStudent(Number(id))
        setStudentData(data)
      } catch (error) {
        console.error("Öğrenci getirilemedi:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [id])

  const handleContactParent = async () => {
    if (!contactMessage.trim()) {
      toast({ title: "Mesaj gerekli", description: "Mesaj yazmadan gönderemezsiniz.", variant: "destructive" })
      return
    }
    try {
      await new Promise((res) => setTimeout(res, 1500))
      toast({ title: "Mesaj gönderildi", description: `${studentData?.name} öğrencisinin velisine mesaj iletildi.` })
      setContactMessage("")
      setContactDialogOpen(false)
    } catch {
      toast({ title: "Hata", description: "Mesaj gönderilemedi.", variant: "destructive" })
    }
  }

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/students/${id}`)
    toast({ title: "Link kopyalandı", description: "Profil bağlantısı panoya kopyalandı" })
  }

  const handlePrintProfile = () => {
    toast({ title: "Yazdırılıyor", description: "Profil yazıcıya gönderildi" })
    window.print()
  }

  const handleExportData = () => {
    setIsExporting(true)
    setTimeout(() => {
      toast({ title: "Veri dışa aktarıldı", description: "Öğrenci verisi başarıyla dışa aktarıldı." })
      setIsExporting(false)
    }, 2000)
  }

  const handleDeleteConfirm = async () => {
    try {
      toast({ title: "Öğrenci silindi", description: `${studentData.name} profili kaldırıldı.` })
      router.push("/students")
    } catch (error) {
      console.error("Silme hatası:", error)
    }
  }

  const handleDownloadReport = () => {
    toast({ title: "İndiriliyor", description: `${studentData.name} öğrencisinin raporu indiriliyor.` })
  }

  const handleEditProfile = () => {
    router.push(`/students/${id}/edit`)
  }

  const handleBadgeClick = (badge) => {
    toast({ title: badge, description: `Rozet kazanımı: ${badge}` })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-sm text-muted-foreground">Öğrenci profili yükleniyor...</p>
      </div>
    )
  }

  if (!studentData) return <div className="text-center mt-10 text-red-500">Öğrenci bulunamadı.</div>

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Öğrenci Profili</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            {/* Sol panel */}
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4 border-4 border-background">
                    <AvatarImage src={studentData.avatar} alt={studentData.name} />
                    <AvatarFallback>{studentData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{studentData.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> Sınıf {studentData.class_id}
                    </Badge>
                    <Badge variant={studentData.status === "active" ? "default" : "secondary"}>
                      {studentData.status === "active" ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>

                  <div className="w-full mt-6 space-y-4 text-left text-sm text-muted-foreground">
                    {studentData.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {studentData.email}</p>}
                    {studentData.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {studentData.phone}</p>}
                    {studentData.join_date && <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Katılım: {studentData.join_date}</p>}
                    {studentData.last_active && <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> Son Aktiflik: {studentData.last_active}</p>}
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 gap-4 w-full text-center">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold">{studentData.totalGamesPlayed}</div>
                      <div className="text-xs text-muted-foreground">Oynanan Oyun</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold">{studentData.avg_score}%</div>
                      <div className="text-xs text-muted-foreground">Ortalama Skor</div>
                    </div>
                  </div>

                  <div className="w-full mt-6 space-y-2">
                    <h3 className="text-sm font-medium">Ders Başarıları</h3>
                    {studentData.subjectScores?.map((subject) => (
                      <div key={subject.subject} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{subject.subject}</span>
                          <span className="font-medium">{subject.score}%</span>
                        </div>
                        <Progress value={subject.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">Performans</TabsTrigger>
                <TabsTrigger value="history">Oyun Geçmişi</TabsTrigger>
                <TabsTrigger value="skills">Beceriler</TabsTrigger>
              </TabsList>
              <TabsContent value="performance">
                <StudentPerformanceChart />
              </TabsContent>
              <TabsContent value="history">
                <StudentGameHistory />
              </TabsContent>
              <TabsContent value="skills">
                <StudentSkillsRadar />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
