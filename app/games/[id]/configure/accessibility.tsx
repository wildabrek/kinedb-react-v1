"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState({
    largeText: false,
    highContrast: false,
    screenReaderSupport: true,
    keyboardNavigation: true,
  })
  const { toast } = useToast()

  const handleToggle = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Accessibility settings have been updated successfully.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Options</CardTitle>
        <CardDescription>Configure accessibility settings to make the game more inclusive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="largeText">
              <span>Large Text</span>
            </Label>
            <Switch
              id="largeText"
              checked={settings.largeText}
              onCheckedChange={(checked) => handleToggle("largeText", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="highContrast">
              <span>High Contrast</span>
            </Label>
            <Switch
              id="highContrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleToggle("highContrast", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="screenReaderSupport">
              <span>Screen Reader Support</span>
            </Label>
            <Switch
              id="screenReaderSupport"
              checked={settings.screenReaderSupport}
              onCheckedChange={(checked) => handleToggle("screenReaderSupport", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="keyboardNavigation">
              <span>Keyboard Navigation</span>
            </Label>
            <Switch
              id="keyboardNavigation"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => handleToggle("keyboardNavigation", checked)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  )
}
