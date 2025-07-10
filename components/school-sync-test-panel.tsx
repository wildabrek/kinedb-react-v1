"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle,
  Users,
  GraduationCap,
  School,
  BookOpen,
} from "lucide-react"
import {
  getLocalDataStats,
  clearLocalData,
  setLocalSchools,
  setLocalTeachers,
  setLocalClasses,
  setLocalStudents,
  exportLocalDataToJSON,
  markInitialSetupComplete,
} from "@/lib/local-data-manager"
import { generateCompleteTestData } from "@/lib/test-data-generator"
import { syncSchoolsToDatabase } from "@/lib/school-sync"

export function SchoolSyncTestPanel() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [stats, setStats] = useState(getLocalDataStats())

  const refreshStats = () => {
    setStats(getLocalDataStats())
  }

  const handleGenerateTestData = async () => {
    setIsGenerating(true)
    setLastAction(null)

    try {
      const testData = generateCompleteTestData({
        schoolCount: 3,
        teachersPerSchool: 4,
        classesPerSchool: 6,
        studentsPerClass: 20,
      })

      // Save to local storage
      setLocalSchools(testData.schools)
      setLocalTeachers(testData.teachers)
      setLocalClasses(testData.classes)
      setLocalStudents(testData.students)

      // Mark initial setup as complete
      markInitialSetupComplete()

      refreshStats()
      setLastAction(
        `✅ Generated ${testData.summary.schools} schools, ${testData.summary.teachers} teachers, ${testData.summary.classes} classes, and ${testData.summary.students} students`,
      )
    } catch (error) {
      setLastAction(`❌ Error generating test data: ${error}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSyncToDatabase = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    setLastAction(null)

    try {
      // Simulate sync progress
      const progressSteps = [
        "Preparing data for sync...",
        "Syncing schools to database...",
        "Syncing teachers to database...",
        "Syncing classes to database...",
        "Syncing students to database...",
        "Finalizing sync process...",
      ]

      for (let i = 0; i < progressSteps.length; i++) {
        setLastAction(progressSteps[i])
        setSyncProgress((i + 1) * (100 / progressSteps.length))
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Perform actual sync
      const result = await syncSchoolsToDatabase()

      refreshStats()
      setLastAction(`✅ Sync completed successfully! Synced ${result.synced} items, ${result.failed} failed`)
    } catch (error) {
      setLastAction(`❌ Sync failed: ${error}`)
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }

  const handleClearLocalData = async () => {
    setIsClearing(true)
    setLastAction(null)

    try {
      clearLocalData()
      refreshStats()
      setLastAction("✅ Local data cleared successfully")
    } catch (error) {
      setLastAction(`❌ Error clearing data: ${error}`)
    } finally {
      setIsClearing(false)
    }
  }

  const handleExportData = () => {
    try {
      const jsonData = exportLocalDataToJSON()
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `kinedb-local-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setLastAction("✅ Data exported successfully")
    } catch (error) {
      setLastAction(`❌ Export failed: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Local Data Status
          </CardTitle>
          <CardDescription>Current state of locally stored data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <School className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.schools}</span>
              </div>
              <p className="text-sm text-muted-foreground">Schools</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <GraduationCap className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.teachers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{stats.classes}</span>
              </div>
              <p className="text-sm text-muted-foreground">Classes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{stats.students}</span>
              </div>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Setup Complete: {stats.initialSetupComplete ? "✅ Yes" : "❌ No"}</span>
            <span>Last Updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : "Never"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate Test Data</CardTitle>
            <CardDescription>Create sample schools, teachers, classes, and students for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateTestData} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Generate Test Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sync to Database</CardTitle>
            <CardDescription>Upload local data to the remote database</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncToDatabase}
              disabled={isSyncing || stats.schools === 0}
              className="w-full"
              variant={stats.schools > 0 ? "default" : "secondary"}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Sync to Database
                </>
              )}
            </Button>
            {isSyncing && (
              <div className="mt-3">
                <Progress value={syncProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1">{syncProgress.toFixed(0)}% complete</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Data</CardTitle>
            <CardDescription>Download local data as JSON file</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportData}
              disabled={stats.schools === 0}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clear Data</CardTitle>
            <CardDescription>Remove all local data (cannot be undone)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleClearLocalData} disabled={isClearing} variant="destructive" className="w-full">
              {isClearing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      {lastAction && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{lastAction}</AlertDescription>
        </Alert>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={refreshStats} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>
    </div>
  )
}
