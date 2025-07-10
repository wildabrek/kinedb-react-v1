"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Gamepad2Icon as GameController2,
  Star,
  Trophy,
  Users,
  Download,
  Mail,
  Phone,
  MessageSquare,
  BarChart2,
  BookOpen,
  Share2,
  Printer,
  Trash2,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  getStudent,
  getClass,
  getTeacher,
  deleteStudent,
  getStudentStrengths,
  getStudentDevelopmentAreas,
  getStudentGamePlays,
  getStudentBadges,
  getStudentSubjectScores,
  getStrengths,
  getDevelopmentAreas,
} from "@/lib/api"
import { useLanguage } from "@/contexts/language-context"
import StudentPerformanceChart from "@/components/student-performance-chart"
import StudentSkillsRadar from "@/components/student-skills-radar"
import StudentGameHistory from "@/components/student-game-history"
import { RecommendedGames } from "@/components/recommended-games"

// Confirmation Dialog Component
const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  variant = "default",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  variant?: "default" | "destructive"
}) => {
  const { translate: t } = useLanguage()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Cancel")}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {t(confirmText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function StudentProfile({ params }: { params: { id: string } }) {
  const { id } = useParams()
  const studentId = Number.parseInt(id)
  const router = useRouter()
  const { toast } = useToast()
  const { translate: t } = useLanguage()
  const [activeTab, setActiveTab] = useState("performance")
  const [contactMessage, setContactMessage] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [viewAllActivity, setViewAllActivity] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<any>(null)

  useEffect(() => {
    async function loadStudentData() {
      if (isNaN(studentId)) {
        router.push("/students")
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch student data
        const studentData = await getStudent(studentId)

        if (!studentData) {
          toast({
            title: t("Error"),
            description: t("Student not found"),
            variant: "destructive",
          })
          router.push("/students")
          return
        }

        // Fetch class and teacher data
        let teacherName = t("Unknown")
        try {
          const classData = await getClass(studentData.class_id)
          if (classData && classData.teacher_id) {
            const teacherData = await getTeacher(classData.teacher_id)
            if (teacherData) {
              teacherName = `${teacherData.first_name} ${teacherData.last_name}`
            }
          }
        } catch (err) {
          console.error("Error fetching class/teacher data:", err)
        }

        // Get additional student data
        const [
          strengthsData,
          developmentAreasData,
          gamePlaysData,
          badgesData,
          subjectScoresData,
          rawStrengths,
          allDevelopmentAreas,
        ] = await Promise.all([
          getStudentStrengths(studentId).catch(() => []),
          getStudentDevelopmentAreas(studentId).catch(() => []),
          getStudentGamePlays(studentId).catch(() => []),
          getStudentBadges(studentId).catch(() => []),
          getStudentSubjectScores(studentId).catch(() => []),
          getStrengths().catch(() => []),
          getDevelopmentAreas().catch(() => []),
        ])

        // convert raw strength API response to expected format
        const allStrengths = rawStrengths.map((s: any) => ({
          strength_id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
        }))
        // Map strength IDs to names
        const strengthNames = strengthsData.map((s) => {
          const strength = allStrengths.find((as) => Number(as.strength_id) === Number(s.strength_id))
          return t(strength?.name) || `${t("Strength")} ${s.strength_id}`
        })

        // Map development area IDs to names
        const developmentAreaNames = developmentAreasData.map((a) => {
          const area = allDevelopmentAreas.find((aa) => aa.area_id === a.area_id)
          return t(area?.name) || `${t("Development Area")} ${a.area_id}`
        })

        // Format the student data
        const formattedStudent = {
          id: studentData.student_internal_id,
          name: studentData.name,
          class: studentData.class_id.toString(),
          avatar: studentData.avatar || "/diverse-student-group.png",
          teacher: teacherName,
          joinDate: studentData.join_date || t("Unknown"),
          totalGamesPlayed: studentData.games_played || 0,
          avgScore: studentData.avg_score || 0,
          avgTimePerSession: studentData.avg_time_per_session || t("15 min"),
          lastActive: studentData.last_active || t("Unknown"),
          status: studentData.status || "active",
          email: studentData.email || "student@example.com",
          phone: studentData.phone || "(555) 123-4567",
          badges: badgesData.map((b) => b.badge) || [],
          strengths: strengthNames,
          areasToImprove: developmentAreaNames,
          recentActivity: gamePlaysData.map((gp) => ({
            date: gp.played_at ? new Date(gp.played_at).toLocaleDateString() : t("Unknown"),
            activity: t("Played a game with score {{score}}%", { score: gp.score }),
          })),
          subjectScores: subjectScoresData.map((ss) => ({
            subject: ss.subject,
            score: ss.score,
          })),
        }

        setStudent(formattedStudent)
      } catch (error) {
        console.error("Error loading student data:", error)
        setError(t("Failed to load student data. Please try again."))
        toast({
          title: t("Error"),
          description: t("Failed to load student data. Please try again."),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStudentData()
  }, [studentId, router, toast, t])

  // Handle exporting data
  const handleExportData = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: t("Export Complete"),
        description: t("Student data has been exported successfully."),
      })
    }, 2000)
  }

  // Handle printing profile
  const handlePrintProfile = () => {
    toast({
      title: t("Printing Profile"),
      description: t("The student profile is being sent to the printer."),
    })
    window.print()
  }

  // Handle contact parent
  const handleContactParent = async () => {
    if (!contactMessage.trim()) {
      toast({
        title: t("Message Required"),
        description: t("Please enter a message before sending."),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: t("Message Sent"),
        description: t(`Your message to ${student.name}'s parents has been sent.`),
      })
      setContactMessage("")
      setContactDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit profile
  const handleEditProfile = () => {
    router.push(`/students/${studentId}/edit`)
  }

  // Handle delete student
  const handleDeleteStudent = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true)
      await deleteStudent(studentId)
      toast({
        title: t("Success"),
        description: t("Student deleted successfully"),
      })
      router.push("/students")
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: t("Error"),
        description: t("Failed to delete student. Please try again."),
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setIsLoading(false)
    }
  }

  // Handle download report
  const handleDownloadReport = () => {
    toast({
      title: t("Downloading Report"),
      description: t(`The report for ${student?.name} is being downloaded.`),
    })
    // In a real app, this would trigger a file download
  }

  // Handle badge click
  const handleBadgeClick = (badge: string) => {
    toast({
      title: t(badge), // Translate badge name
      description: t(`This badge was earned for excellence in ${t(badge.split(" ")[0])}.`), // Translate badge description
    })
  }

  // Handle share profile
  const handleShareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/students/${studentId}/profile`)
    toast({
      title: t("Link Copied"),
      description: t("Student profile link copied to clipboard"),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("Loading student profile...")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">{t("Error")}</h2>
          <p className="mt-2">{t(error)}</p>
          <Button className="mt-4" onClick={() => router.push("/students")}>
            {t("Back to Students")}
          </Button>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">{t("Student Not Found")}</h2>
          <p className="mt-2">{t("The requested student could not be found.")}</p>
          <Button className="mt-4" onClick={() => router.push("/students")}>
            {t("Back to Students")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-9 w-9">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">{t("Back to students")}</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t("Student Profile")}</h1>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/students/${studentId}/progress-report`}>
              <BarChart2 className="mr-2 h-4 w-4" />
              {t("View Progress Report")}
            </Link>
          </Button>

          <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t("Contact Parent")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Contact Parent")}</DialogTitle>
                <DialogDescription>
                  {t("Send a message to")} {student.name}
                  {t("'s parents. They will be notified via email.")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="message">{t("Message")}</Label>
                  <Textarea
                    id="message"
                    placeholder={t("Type your message here...")}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setContactDialogOpen(false)} disabled={isLoading}>
                  {t("Cancel")}
                </Button>
                <Button onClick={handleContactParent} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Sending...")}
                    </>
                  ) : (
                    t("Send Message")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            {t("Download Report")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                {t("Share")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleShareProfile}>{t("Copy Link")}</DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintProfile}>
                <Printer className="mr-2 h-4 w-4" />
                {t("Print Profile")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExportData} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Exporting...")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t("Export Data")}
              </>
            )}
          </Button>

          <Button size="sm" onClick={handleEditProfile}>
            <Edit className="mr-2 h-4 w-4" />
            {t("Edit Profile")}
          </Button>

          <Button variant="destructive" size="sm" onClick={handleDeleteStudent}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t("Delete")}
          </Button>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-4 mt-6"></div>
      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Student info */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-32 w-32 mb-4 border-4 border-background">
                  <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {student.status === "active" && (
                  <span className="absolute bottom-4 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-background"></span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {t("Class")} {student.class}
                </Badge>
                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                  {student.status === "active" ? t("Active") : t("Inactive")}
                </Badge>
              </div>

              <div className="w-full mt-6 space-y-4">
                <a
                  href={`mailto:${student.email}`}
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.email}</span>
                </a>
                <a
                  href={`tel:${student.phone}`}
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.phone}</span>
                </a>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t("Teacher")}: {student.teacher}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t("Joined")}: {student.joinDate}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t("Last active")}: {student.lastActive}
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-4 w-full text-center">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{student.totalGamesPlayed}</div>
                  <div className="text-xs text-muted-foreground">{t("Games Played")}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{student.avgScore}%</div>
                  <div className="text-xs text-muted-foreground">{t("Avg. Score")}</div>
                </div>
              </div>

              <div className="w-full mt-6 space-y-2">
                <h3 className="text-sm font-medium">{t("Subject Performance")}</h3>
                {student.subjectScores && student.subjectScores.length > 0 ? (
                  student.subjectScores.map((subject: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{t(subject.subject)}</span>
                        <span className="font-medium">{subject.score}%</span>
                      </div>
                      <Progress value={subject.score} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    {t("No subject scores available")}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column - Tabs and content */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-medium">{t("Avg. Session")}</p>
                <p className="text-xl font-bold">{student.avgTimePerSession}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <GameController2 className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-medium">{t("Games Completed")}</p>
                <p className="text-xl font-bold">{student.totalGamesPlayed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <BarChart2 className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-medium">{t("Overall Progress")}</p>
                <p className="text-xl font-bold">{student.avgScore ? `${student.avgScore}%` : "N/A"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {t("Achievements")}
                </CardTitle>
                <CardDescription>{t("Badges and accomplishments")}</CardDescription>
              </CardHeader>
              <CardContent>
                {student.badges && student.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {student.badges.map((badge: string, index: number) => (
                      <button
                        key={index}
                        className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full hover:bg-muted transition-colors"
                        onClick={() => handleBadgeClick(badge)}
                      >
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{t(badge)}</span> {/* Translate badge name */}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">{t("No badges earned yet")}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GameController2 className="h-5 w-5 text-orange-500" />
                  {t("Recommended Games")}
                </CardTitle>
                <CardDescription>{t("Recommended games for student development")}</CardDescription>{" "}
                {/* Updated description */}
              </CardHeader>
              <CardContent>
                {/* Assuming RecommendedGames component handles its own translations for game names */}
                <div className="flex flex-wrap gap-3">
                  <RecommendedGames studentId={Number(studentId)} />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Strengths and Areas to Improve */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-500" />
                  {t("Strengths")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.strengths && student.strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {student.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <Star className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{t(strength)}</span> {/* Translate strength name */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">{t("No strengths identified yet")}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GameController2 className="h-5 w-5 text-orange-500" />
                  {t("Areas to Improve")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.areasToImprove && student.areasToImprove.length > 0 ? (
                  <ul className="space-y-3">
                    {student.areasToImprove.map((area: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 bg-muted/30 p-3 rounded-md">
                        <GameController2 className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span>{t(area)}</span> {/* Translate area name */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    {t("No areas for improvement identified yet")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("Recent Game Activity")}</CardTitle>{" "}
              {/* Changed to "Recent Game Activity" */}
            </CardHeader>
            <CardContent>
              {student.recentActivity && student.recentActivity.length > 0 ? (
                <div className="relative pl-6 border-l border-muted space-y-4">
                  {student.recentActivity
                    .slice(0, viewAllActivity ? undefined : 3)
                    .map((activity: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-primary"></div>
                        <p className="text-sm font-medium">{activity.date}</p>
                        <p className="text-sm text-muted-foreground">{activity.activity}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">{t("No recent activity")}</div>
              )}
            </CardContent>
            {student.recentActivity && student.recentActivity.length > 3 && (
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setViewAllActivity(!viewAllActivity)}
                >
                  {viewAllActivity ? t("Show Less") : t("View All Activity")}
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Tabs for Performance, Game History, Skills */}
          <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">{t("Performance")}</TabsTrigger>
              <TabsTrigger value="history">{t("Game History")}</TabsTrigger>
              <TabsTrigger value="skills">{t("Skills")}</TabsTrigger>
            </TabsList>
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Performance Over Time")}</CardTitle>
                  <CardDescription>{t("Score trends across different subjects")}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <StudentPerformanceChart studentId={studentId} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Recent Game Activity")}</CardTitle>
                  <CardDescription>{t("Latest games played by the student")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentGameHistory studentId={studentId} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Skills Assessment")}</CardTitle>
                  <CardDescription>{t("Skill development through educational games")}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <StudentSkillsRadar studentId={studentId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("Delete Student")}
        description={t(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)}
        onConfirm={handleDeleteConfirm}
        confirmText={t("Delete")}
        variant="destructive"
      />
    </div>
  )
}
