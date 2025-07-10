"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  Gamepad2,
  Shield,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Award,
  Target,
  Activity,
  BookOpen,
  Star,
  CheckCircle,
  Timer,
  Zap,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [gameRunning, setGameRunning] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [gameTime, setGameTime] = useState(30)
  const [studentProgress, setStudentProgress] = useState(65)
  const { translate: t } = useLanguage()
  const [animatedStats, setAnimatedStats] = useState({
    totalStudents: 0,
    activeGames: 0,
    avgScore: 0,
    completionRate: 0,
  })

  // Animate statistics on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        totalStudents: 247,
        activeGames: 12,
        avgScore: 87,
        completionRate: 94,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Game simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameRunning && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime((prev) => prev - 1)
        setGameScore((prev) => prev + Math.floor(Math.random() * 10) + 5)
      }, 1000)
    } else if (gameTime === 0) {
      setGameRunning(false)
    }
    return () => clearInterval(interval)
  }, [gameRunning, gameTime])

  const startGame = () => {
    setGameRunning(true)
    setGameScore(0)
    setGameTime(30)
  }

  const pauseGame = () => {
    setGameRunning(false)
  }

  const resetGame = () => {
    setGameRunning(false)
    setGameScore(0)
    setGameTime(30)
  }

  const mockStudents = [
    { name: "Emma Johnson", progress: 92, activity: "Math Jump", status: "active" },
    { name: "Liam Chen", progress: 78, activity: "Word Race", status: "completed" },
    { name: "Sofia Rodriguez", progress: 85, activity: "Shape Hunt", status: "active" },
    { name: "Noah Williams", progress: 96, activity: "Number Dance", status: "completed" },
    { name: "Ava Thompson", progress: 73, activity: "Letter Leap", status: "active" },
  ]

  const mockGames = [
    {
      name: "Math Jump Challenge",
      category: "Mathematics",
      difficulty: "Beginner",
      duration: "15 min",
      participants: 23,
      description: t("Students solve math problems by jumping to the correct answers"),
    },
    {
      name: "Word Race Adventure",
      category: "Language Arts",
      difficulty: "Intermediate",
      duration: "20 min",
      participants: 18,
      description: t("Race to spell words correctly using physical movements"),
    },
    {
      name: "Shape Hunt Explorer",
      category: "Geometry",
      difficulty: "Beginner",
      duration: "12 min",
      participants: 31,
      description: t("Find and collect geometric shapes through movement activities"),
    },
  ]

  return (
    <section
      id="interactive-demo"
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              <Play className="h-4 w-4" />
              {t("Interactive Demo")}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent">
              {t("Experience KineKids in Action")}
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
              {t("Explore our platform's key features through this interactive demonstration")}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-white border border-blue-100 rounded-xl p-1">
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Analytics")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="classroom"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Classroom")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="games"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Games")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Security")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Curriculum")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{t("Total Students")}</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{animatedStats.totalStudents}</div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12% {t("from last month")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{t("Active Games")}</CardTitle>
                    <Gamepad2 className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{animatedStats.activeGames}</div>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {t("Currently running")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{t("Average Score")}</CardTitle>
                    <Target className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{animatedStats.avgScore}%</div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +5% {t("improvement")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{t("Completion Rate")}</CardTitle>
                    <Award className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{animatedStats.completionRate}%</div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {t("Excellent performance")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    {t("Student Performance Overview")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{t("Class Average Progress")}</span>
                      <span className="text-sm font-bold text-blue-700">{studentProgress}%</span>
                    </div>
                    <Progress value={studentProgress} className="h-3" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="text-2xl font-bold text-green-700">85%</div>
                        <div className="text-sm text-green-600">{t("Above Target")}</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="text-2xl font-bold text-yellow-700">12%</div>
                        <div className="text-sm text-yellow-600">{t("Needs Support")}</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-2xl font-bold text-blue-700">3%</div>
                        <div className="text-sm text-blue-600">{t("Exceptional")}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classroom" className="space-y-6">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Users className="h-5 w-5 text-blue-500" />
                    {t("Classroom Management Dashboard")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStudents.map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{t("Current")} : {t(student.activity)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{t(String(student.progress))}%</div>
                            <Progress value={Number(t(String(student.progress)))} className="w-20 h-2" />
                          </div>
                          <Badge
                            variant={student.status === "active" ? "default" : "secondary"}
                            className={
                              student.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                            }
                          >
                            {t(student.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="games" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Gamepad2 className="h-5 w-5 text-blue-500" />
                      {t("Interactive Game Demo")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
                      <div className="text-3xl font-bold mb-2">{t("Math Jump Challenge")}</div>
                      <div className="text-blue-100 mb-4">{t("Jump to the correct answer!")}</div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="text-sm text-blue-100">{t("Score")}</div>
                          <div className="text-2xl font-bold">{gameScore}</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="text-sm text-blue-100">{t("Time")}</div>
                          <div className="text-2xl font-bold">{gameTime}s</div>
                        </div>
                      </div>

                      <div className="flex justify-center gap-2 mb-4">
                        <Button
                          onClick={gameRunning ? pauseGame : startGame}
                          variant="secondary"
                          size="sm"
                          className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                          {gameRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {t(gameRunning ? "Pause" : "Start")}
                        </Button>
                        <Button
                          onClick={resetGame}
                          variant="secondary"
                          size="sm"
                          className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </Button>
                      </div>

                      {gameRunning && (
                        <div className="text-sm text-blue-100 animate-pulse">
                          🏃‍♂️ Students are jumping to solve: 7 + 5 = ?
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Star className="h-5 w-5 text-blue-500" />
                      {t("Available Games")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockGames.map((game, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{t(game.name)}</h4>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {game.participants} {t("playing")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{t(game.description)}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {t(game.category)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {t(game.difficulty)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {t(game.duration)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Shield className="h-5 w-5 text-blue-500" />
                      {t("Security Features")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">{t("FERPA Compliant")}</div>
                        <div className="text-sm text-green-600">{t("Student data protection certified")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">{t("256-bit Encryption")}</div>
                        <div className="text-sm text-green-600">{t("Bank-level security standards")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">{t("Regular Audits")}</div>
                        <div className="text-sm text-green-600">{t("Third-party security assessments")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">{t("Access Controls")}</div>
                        <div className="text-sm text-green-600">{t("Role-based permissions system")}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Activity className="h-5 w-5 text-blue-500" />
                      {t("Privacy Dashboard")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-sm font-medium text-blue-800 mb-2">{t("Data Protection Status")}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-700">{t("All systems secure")}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t("Student Records")}</span>
                        <Badge className="bg-green-100 text-green-700">{t("Protected")}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t("Assessment Data")}</span>
                        <Badge className="bg-green-100 text-green-700">{t("Encrypted")}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t("Communication Logs")}</span>
                        <Badge className="bg-green-100 text-green-700">{t("Secured")}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t("Parent Access")}</span>
                        <Badge className="bg-blue-100 text-blue-700">{t("Controlled")}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    {t("Curriculum Alignment")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-800 mb-2">{t("Mathematics")}</h3>
                      <p className="text-sm text-blue-600 mb-4">{t("Number sense, operations, geometry, and measurement")}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{t("Alignment")}</span>
                          <span className="font-semibold">98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-green-800 mb-2">{t("Language Arts")}</h3>
                      <p className="text-sm text-green-600 mb-4">{t("Reading, writing, speaking, and listening skills")}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{t("Alignment")}</span>
                          <span className="font-semibold">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-purple-800 mb-2">{t("Physical Education")}</h3>
                      <p className="text-sm text-purple-600 mb-4">{t("Motor skills, coordination, and physical fitness")}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{t("Alignment")}</span>
                          <span className="font-semibold">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-4">{t("Standards Compliance")}</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-700">{t("Common Core State Standards")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-700">{t("Next Generation Science Standards")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-700">{t("National Physical Education Standards")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-700">{t("State Learning Objectives")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
