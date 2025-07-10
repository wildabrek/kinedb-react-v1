"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Search, ArrowLeft, Users, Brain, Gamepad2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GameUsageChart from "@/components/game-usage-chart"
import { GameCompletionChart } from "@/components/game-completion-chart"

// Sample data for games
const games = [
  {
    id: "1",
    name: "Math Adventure",
    subject: "Mathematics",
    playCount: 1245,
    avgCompletionRate: 87,
    avgScore: 82,
    avgTimeSpent: "8m 45s",
    skillsCovered: ["Addition", "Subtraction", "Problem Solving"],
    popularity: "High",
  },
  {
    id: "2",
    name: "Word Explorer",
    subject: "English",
    playCount: 980,
    avgCompletionRate: 92,
    avgScore: 88,
    avgTimeSpent: "10m 20s",
    skillsCovered: ["Vocabulary", "Reading", "Spelling"],
    popularity: "High",
  },
  {
    id: "3",
    name: "Science Quest",
    subject: "Science",
    playCount: 756,
    avgCompletionRate: 78,
    avgScore: 75,
    avgTimeSpent: "12m 15s",
    skillsCovered: ["Biology", "Chemistry", "Scientific Method"],
    popularity: "Medium",
  },
  {
    id: "4",
    name: "History Timeline",
    subject: "History",
    playCount: 542,
    avgCompletionRate: 65,
    avgScore: 70,
    avgTimeSpent: "9m 30s",
    skillsCovered: ["Historical Events", "Chronology", "Cultural Awareness"],
    popularity: "Medium",
  },
  {
    id: "5",
    name: "Coding Blocks",
    subject: "Computer Science",
    playCount: 890,
    avgCompletionRate: 72,
    avgScore: 78,
    avgTimeSpent: "15m 10s",
    skillsCovered: ["Logic", "Algorithms", "Problem Solving"],
    popularity: "High",
  },
]

// Sample data for student engagement
const studentEngagement = [
  {
    id: "1",
    name: "Emma Thompson",
    gamesPlayed: 45,
    favoriteGame: "Math Adventure",
    avgTimePerSession: "12m 30s",
    skillsImproved: ["Addition", "Problem Solving", "Vocabulary"],
    engagementLevel: "High",
  },
  {
    id: "2",
    name: "Noah Martinez",
    gamesPlayed: 38,
    favoriteGame: "Word Explorer",
    avgTimePerSession: "9m 45s",
    skillsImproved: ["Reading", "Spelling", "Vocabulary"],
    engagementLevel: "Medium",
  },
  {
    id: "3",
    name: "Olivia Johnson",
    gamesPlayed: 32,
    favoriteGame: "Science Quest",
    avgTimePerSession: "11m 20s",
    skillsImproved: ["Biology", "Scientific Method", "Problem Solving"],
    engagementLevel: "Medium",
  },
  {
    id: "4",
    name: "Liam Williams",
    gamesPlayed: 41,
    favoriteGame: "Coding Blocks",
    avgTimePerSession: "14m 15s",
    skillsImproved: ["Logic", "Algorithms", "Problem Solving"],
    engagementLevel: "High",
  },
  {
    id: "5",
    name: "Ava Brown",
    gamesPlayed: 50,
    favoriteGame: "Math Adventure",
    avgTimePerSession: "10m 50s",
    skillsImproved: ["Addition", "Subtraction", "Problem Solving"],
    engagementLevel: "High",
  },
]

// Sample data for skill development
const skillDevelopment = [
  {
    skill: "Problem Solving",
    improvement: 85,
    gamesContributing: ["Math Adventure", "Coding Blocks", "Science Quest"],
    studentsImproved: 120,
  },
  {
    skill: "Reading Comprehension",
    improvement: 78,
    gamesContributing: ["Word Explorer", "History Timeline"],
    studentsImproved: 95,
  },
  {
    skill: "Mathematical Reasoning",
    improvement: 82,
    gamesContributing: ["Math Adventure", "Coding Blocks"],
    studentsImproved: 110,
  },
  {
    skill: "Scientific Inquiry",
    improvement: 75,
    gamesContributing: ["Science Quest"],
    studentsImproved: 88,
  },
  {
    skill: "Critical Thinking",
    improvement: 80,
    gamesContributing: ["History Timeline", "Science Quest", "Coding Blocks"],
    studentsImproved: 105,
  },
]

// Sample data for usage statistics
const usageStatistics = {
  totalGamesPlayed: 4413,
  averageTimePerSession: "11m 20s",
  mostPopularGame: "Math Adventure",
  mostActiveClass: "3A",
  mostActiveTimeOfDay: "10:00 AM - 11:00 AM",
  mostActiveDay: "Wednesday",
  completionRate: 79,
  averageScore: 81,
}

// Sample data for Game Usage Chart
const gameUsageData = [
  { timestamp: "2024-01-01", usage: 120 },
  { timestamp: "2024-01-02", usage: 150 },
  { timestamp: "2024-01-03", usage: 130 },
  { timestamp: "2024-01-04", usage: 180 },
  { timestamp: "2024-01-05", usage: 160 },
  { timestamp: "2024-01-06", usage: 200 },
  { timestamp: "2024-01-07", usage: 190 },
  { timestamp: "2024-01-08", usage: 220 },
  { timestamp: "2024-01-09", usage: 210 },
  { timestamp: "2024-01-10", usage: 250 },
]

// Sample data for Game Completion Chart
const gameCompletionData = [
  { name: "Math Adventure", score: 82, plays: 1245, completionRate: 87, avgTime: "8m 45s", achievements: 15 },
  { name: "Word Explorer", score: 88, plays: 980, completionRate: 92, avgTime: "10m 20s", achievements: 12 },
  { name: "Science Quest", score: 75, plays: 756, completionRate: 78, avgTime: "12m 15s", achievements: 8 },
  { name: "History Timeline", score: 70, plays: 542, completionRate: 65, avgTime: "9m 30s", achievements: 5 },
  { name: "Coding Blocks", score: 78, plays: 890, completionRate: 72, avgTime: "15m 10s", achievements: 10 },
]

export default function GameAnalyticsReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedPopularity, setSelectedPopularity] = useState("all")
  const [timeRange, setTimeRange] = useState("30days")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")

  // Filter games based on search and filters
  let filteredGames = [...games]

  if (searchQuery) {
    filteredGames = filteredGames.filter(
      (game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.subject.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  if (selectedSubject !== "all") {
    filteredGames = filteredGames.filter((game) => game.subject === selectedSubject)
  }

  if (selectedPopularity !== "all") {
    filteredGames = filteredGames.filter((game) => game.popularity === selectedPopularity)
  }

  // Filter students based on search
  let filteredStudents = [...studentEngagement]

  if (studentSearchQuery) {
    filteredStudents = filteredStudents.filter((student) =>
      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()),
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Reports</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Game Analytics Reports</h1>
        <div className="ml-auto flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Charts Section - Only Game Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Game Usage Over Time</CardTitle>
          <CardDescription>Number of game sessions played per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <GameUsageChart data={gameUsageData} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed reports */}
      <Tabs defaultValue="games">
        <TabsList>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Games Performance
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Progress
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Skill Development
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Games Performance Analysis</CardTitle>
              <CardDescription>Detailed metrics for each educational game</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search games..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-[180px]">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-[180px]">
                    <Select value={selectedPopularity} onValueChange={setSelectedPopularity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by popularity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Popularity</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Play Count</TableHead>
                      <TableHead>Avg. Completion</TableHead>
                      <TableHead>Avg. Score</TableHead>
                      <TableHead>Avg. Time Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGames.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.name}</TableCell>
                        <TableCell>{game.subject}</TableCell>
                        <TableCell>{game.playCount}</TableCell>
                        <TableCell>{game.avgCompletionRate}%</TableCell>
                        <TableCell>{game.avgScore}%</TableCell>
                        <TableCell>{game.avgTimeSpent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Completion Rates</CardTitle>
              <CardDescription>Percentage of students who complete each game</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <GameCompletionChart data={gameCompletionData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Reports</CardTitle>
              <CardDescription>View detailed progress reports for each student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search students..."
                      className="pl-8"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Games Played</TableHead>
                      <TableHead>Favorite Game</TableHead>
                      <TableHead>Avg. Time Per Session</TableHead>
                      <TableHead>Engagement Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.gamesPlayed}</TableCell>
                        <TableCell>{student.favoriteGame}</TableCell>
                        <TableCell>{student.avgTimePerSession}</TableCell>
                        <TableCell>{student.engagementLevel}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/students/${student.id}/progress-report`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Progress Report
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Development Analysis</CardTitle>
              <CardDescription>How games are contributing to skill development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Improvement</TableHead>
                      <TableHead>Contributing Games</TableHead>
                      <TableHead>Students Improved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillDevelopment.map((skill, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{skill.skill}</TableCell>
                        <TableCell>{skill.improvement}%</TableCell>
                        <TableCell>{skill.gamesContributing.join(", ")}</TableCell>
                        <TableCell>{skill.studentsImproved}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggested actions based on analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Increase Science Game Engagement</h3>
                  <p className="text-sm text-muted-foreground">
                    Science Quest has a lower completion rate (78%) compared to other games. Consider adding more
                    interactive elements or simplifying complex sections to improve engagement.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Promote History Timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    History Timeline has the lowest play count. Consider featuring it more prominently or creating a
                    class challenge to increase usage.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Expand Math Adventure</h3>
                  <p className="text-sm text-muted-foreground">
                    Math Adventure is the most popular game with high completion rates. Consider adding more advanced
                    levels or expanding content to maintain engagement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
