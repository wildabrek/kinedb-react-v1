"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SchoolSyncTestPanel } from "@/components/school-sync-test-panel"
import {
  Database,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Workflow,
  TestTube,
  FolderSyncIcon as Sync,
} from "lucide-react"

export default function TestSyncPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <TestTube className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">School Data Sync Testing</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Test and manage the synchronization of school data between local storage and the database. This tool helps
          developers and administrators verify data flow and troubleshoot sync issues.
        </p>
      </div>

      {/* Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Data Sync Process Flow
          </CardTitle>
          <CardDescription>Understanding how data flows from local storage to the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Generate Data</h3>
              <p className="text-sm text-muted-foreground">
                Create test schools, teachers, classes, and students locally
              </p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Validate Data</h3>
              <p className="text-sm text-muted-foreground">Check for conflicts and ensure data integrity</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Sync className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Sync to DB</h3>
              <p className="text-sm text-muted-foreground">Upload validated data to the remote database</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Local Storage:</strong> Data is stored in your browser's local storage. It persists between sessions
            but is device-specific.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Test Environment:</strong> This is a testing tool. Generated data is for development and testing
            purposes only.
          </AlertDescription>
        </Alert>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Safety:</strong> You can safely clear test data without affecting production systems.
          </AlertDescription>
        </Alert>
      </div>

      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Status Indicators</CardTitle>
          <CardDescription>Understanding the different states of your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">School Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Local Only</Badge>
                  <span className="text-sm">School exists only in local storage (negative ID)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Synced
                  </Badge>
                  <span className="text-sm">School has been synced to database (positive ID)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Error</Badge>
                  <span className="text-sm">Sync failed - check error logs</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Data Relationships</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Schools contain Teachers and Classes</p>
                <p>• Classes are assigned to Teachers</p>
                <p>• Students are enrolled in Classes</p>
                <p>• All data maintains referential integrity</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Main Test Panel */}
      <SchoolSyncTestPanel />

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              This testing interface is designed for developers and system administrators. For production use, data
              synchronization happens automatically during the initial setup process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
