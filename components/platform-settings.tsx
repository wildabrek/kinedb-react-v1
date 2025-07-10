"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function PlatformSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    studentActivityAlerts: true,
    performanceAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
    dataSharing: true,
    autoSave: true,
    betaFeatures: false,
  })

  const handleToggle = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your platform settings have been updated successfully.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>Manage your notification preferences and platform settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal text-xs text-muted-foreground">Receive notifications via email</span>
              </Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleToggle("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="pushNotifications" className="flex flex-col space-y-1">
                <span>Push Notifications</span>
                <span className="font-normal text-xs text-muted-foreground">Receive notifications in the browser</span>
              </Label>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleToggle("pushNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="weeklyReports" className="flex flex-col space-y-1">
                <span>Weekly Reports</span>
                <span className="font-normal text-xs text-muted-foreground">Receive weekly summary reports</span>
              </Label>
              <Switch
                id="weeklyReports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleToggle("weeklyReports", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="studentActivityAlerts" className="flex flex-col space-y-1">
                <span>Student Activity Alerts</span>
                <span className="font-normal text-xs text-muted-foreground">Get notified about student activities</span>
              </Label>
              <Switch
                id="studentActivityAlerts"
                checked={settings.studentActivityAlerts}
                onCheckedChange={(checked) => handleToggle("studentActivityAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="performanceAlerts" className="flex flex-col space-y-1">
                <span>Performance Alerts</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Get notified about significant performance changes
                </span>
              </Label>
              <Switch
                id="performanceAlerts"
                checked={settings.performanceAlerts}
                onCheckedChange={(checked) => handleToggle("performanceAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="systemUpdates" className="flex flex-col space-y-1">
                <span>System Updates</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Get notified about system updates and maintenance
                </span>
              </Label>
              <Switch
                id="systemUpdates"
                checked={settings.systemUpdates}
                onCheckedChange={(checked) => handleToggle("systemUpdates", checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Privacy & Data</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="marketingEmails" className="flex flex-col space-y-1">
                <span>Marketing Emails</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Receive marketing and promotional emails
                </span>
              </Label>
              <Switch
                id="marketingEmails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleToggle("marketingEmails", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dataSharing" className="flex flex-col space-y-1">
                <span>Data Sharing</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Share anonymous usage data to improve the platform
                </span>
              </Label>
              <Switch
                id="dataSharing"
                checked={settings.dataSharing}
                onCheckedChange={(checked) => handleToggle("dataSharing", checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Advanced Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="autoSave" className="flex flex-col space-y-1">
                <span>Auto-Save</span>
                <span className="font-normal text-xs text-muted-foreground">Automatically save changes</span>
              </Label>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => handleToggle("autoSave", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="betaFeatures" className="flex flex-col space-y-1">
                <span>Beta Features</span>
                <span className="font-normal text-xs text-muted-foreground">Enable experimental features</span>
              </Label>
              <Switch
                id="betaFeatures"
                checked={settings.betaFeatures}
                onCheckedChange={(checked) => handleToggle("betaFeatures", checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  )
}
