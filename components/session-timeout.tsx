"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Warning will show 2 minutes before timeout
const WARNING_TIME = 2 * 60 * 1000

export function SessionTimeout() {
  const { isAuthenticated, logout, refreshSession } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(WARNING_TIME / 1000)
  const [warningTimerId, setWarningTimerId] = useState<NodeJS.Timeout | null>(null)
  const [countdownTimerId, setCountdownTimerId] = useState<NodeJS.Timeout | null>(null)

  // Start warning timer when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    // Session timeout is 30 minutes, so warning should appear after 28 minutes
    const timerId = setTimeout(
      () => {
        setShowWarning(true)
        startCountdown()
      },
      30 * 60 * 1000 - WARNING_TIME,
    )

    setWarningTimerId(timerId)

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [isAuthenticated])

  // Start countdown when warning is shown
  const startCountdown = useCallback(() => {
    setTimeLeft(WARNING_TIME / 1000)

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setCountdownTimerId(timerId)

    return () => {
      clearInterval(timerId)
    }
  }, [])

  // Handle countdown reaching zero
  useEffect(() => {
    if (timeLeft === 0 && showWarning) {
      logout()
    }
  }, [timeLeft, showWarning, logout])

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (warningTimerId) clearTimeout(warningTimerId)
      if (countdownTimerId) clearInterval(countdownTimerId)
    }
  }, [warningTimerId, countdownTimerId])

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle continue session
  const handleContinue = () => {
    setShowWarning(false)
    refreshSession()

    // Clear existing timers
    if (warningTimerId) clearTimeout(warningTimerId)
    if (countdownTimerId) clearInterval(countdownTimerId)

    // Reset warning timer
    const newTimerId = setTimeout(
      () => {
        setShowWarning(true)
        startCountdown()
      },
      30 * 60 * 1000 - WARNING_TIME,
    )

    setWarningTimerId(newTimerId)
  }

  if (!isAuthenticated) return null

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {formatTimeLeft()} due to inactivity. Would you like to continue your session or
            log out?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => logout()}>Log Out</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>Continue Session</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
