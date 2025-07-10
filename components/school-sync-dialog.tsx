"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, FolderSyncIcon as Sync, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { syncSchoolsWithDatabase, checkForConflicts, getSchoolSyncStatus, type SyncResult } from "@/lib/school-sync"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/components/ui/use-toast"

interface SchoolSyncDialogProps {
  onSyncComplete?: () => void
}

export function SchoolSyncDialog({ onSyncComplete }: SchoolSyncDialogProps) {
  const { translate: t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [conflicts, setConflicts] = useState<any[]>([])
  const [showConflicts, setShowConflicts] = useState(false)

  const syncStatus = getSchoolSyncStatus()

  const handleCheckConflicts = async () => {
    setIsLoading(true)
    try {
      const conflictCheck = await checkForConflicts()
      setConflicts(conflictCheck.conflicts)
      setShowConflicts(true)

      if (conflictCheck.hasConflicts) {
        toast({
          title: t("Conflicts Found"),
          description: t("Some schools may already exist in the database"),
          variant: "destructive",
        })
      } else {
        toast({
          title: t("No Conflicts"),
          description: t("All schools can be synced safely"),
        })
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to check for conflicts"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    setSyncResult(null)

    try {
      const result = await syncSchoolsWithDatabase()
      setSyncResult(result)

      if (result.success) {
        toast({
          title: t("Sync Successful"),
          description: t(`${result.syncedCount} schools synced successfully`),
        })
        onSyncComplete?.()
      } else {
        toast({
          title: t("Sync Completed with Errors"),
          description: t(`${result.syncedCount} synced, ${result.failedCount} failed`),
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: t("Sync Failed"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setSyncResult(null)
    setConflicts([])
    setShowConflicts(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Sync className="h-4 w-4" />
          {t("Sync Schools")}
          {syncStatus.needsSync > 0 && (
            <Badge variant="secondary" className="ml-1">
              {syncStatus.needsSync}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sync className="h-5 w-5" />
            {t("Sync Schools to Database")}
          </DialogTitle>
          <DialogDescription>{t("Synchronize local schools with the database")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sync Status */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{syncStatus.totalLocal}</div>
              <div className="text-xs text-muted-foreground">{t("Total Local")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{syncStatus.needsSync}</div>
              <div className="text-xs text-muted-foreground">{t("Needs Sync")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{syncStatus.synced}</div>
              <div className="text-xs text-muted-foreground">{t("Synced")}</div>
            </div>
          </div>

          {syncStatus.needsSync === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{t("All schools are already synced with the database")}</AlertDescription>
            </Alert>
          )}

          {/* Conflicts Section */}
          {showConflicts && conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">{t("Potential Conflicts Found")}:</div>
                <ul className="text-sm space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>
                      • {conflict.localSchool.school_name} ({conflict.localSchool.city})
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Sync Result */}
          {syncResult && (
            <Alert variant={syncResult.success ? "default" : "destructive"}>
              {syncResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>
                <div className="font-medium mb-1">
                  {syncResult.success ? t("Sync Completed") : t("Sync Completed with Errors")}
                </div>
                <div className="text-sm">
                  {t("Synced")}: {syncResult.syncedCount} | {t("Failed")}: {syncResult.failedCount}
                </div>
                {syncResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">{t("View Errors")}</summary>
                    <ul className="mt-1 text-xs space-y-1">
                      {syncResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {showConflicts ? t("Checking for conflicts...") : t("Syncing schools...")}
                </span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {!syncResult && syncStatus.needsSync > 0 && (
            <>
              <Button variant="outline" onClick={handleCheckConflicts} disabled={isLoading}>
                {t("Check Conflicts")}
              </Button>
              <Button onClick={handleSync} disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sync className="h-4 w-4" />}
                {t("Sync Now")}
              </Button>
            </>
          )}

          {syncResult && <Button onClick={() => setIsOpen(false)}>{t("Close")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
