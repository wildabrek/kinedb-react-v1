"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface MDSnackbarProps {
  open: boolean
  onClose: () => void
  autoHideDuration?: number
  message: string
  action?: React.ReactNode
  color?: "default" | "primary" | "success" | "error" | "warning" | "info"
  icon?: React.ReactNode
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  className?: string
}

const MDSnackbar: React.FC<MDSnackbarProps> = ({
  open,
  onClose,
  autoHideDuration = 5000,
  message,
  action,
  color = "default",
  icon,
  position = "bottom-right",
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setIsVisible(true)

      if (autoHideDuration) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(onClose, 300) // Wait for animation to complete
        }, autoHideDuration)

        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [open, autoHideDuration, onClose])

  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary text-primary-foreground"
      case "success":
        return "bg-green-600 text-white"
      case "error":
        return "bg-red-600 text-white"
      case "warning":
        return "bg-yellow-500 text-white"
      case "info":
        return "bg-blue-600 text-white"
      default:
        return "bg-background border text-foreground"
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4"
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2"
      case "top-right":
        return "top-4 right-4"
      case "bottom-left":
        return "bottom-4 left-4"
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2"
      case "bottom-right":
        return "bottom-4 right-4"
      default:
        return "bottom-4 right-4"
    }
  }

  if (!open && !isVisible) return null

  return (
    <div
      className={cn(
        "fixed z-50 min-w-[300px] max-w-[500px] shadow-lg rounded-lg transition-all duration-300 ease-in-out",
        getPositionClasses(),
        getColorClasses(),
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {action}
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300) // Wait for animation to complete
            }}
            className="flex-shrink-0 rounded-full p-1 hover:bg-white/10 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MDSnackbar
