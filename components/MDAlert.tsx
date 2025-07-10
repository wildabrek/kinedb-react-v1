"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"

interface MDAlertProps {
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info"
  dismissible?: boolean
  children: React.ReactNode
  className?: string
  onClose?: () => void
}

const MDAlert: React.FC<MDAlertProps> = ({
  color = "info",
  dismissible = false,
  children,
  className,
  onClose,
  ...rest
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary border-primary/20"
      case "secondary":
        return "bg-secondary/10 text-secondary-foreground border-secondary/20"
      case "success":
        return "bg-green-50 text-green-700 border-green-100"
      case "danger":
        return "bg-red-50 text-red-700 border-red-100"
      case "warning":
        return "bg-yellow-50 text-yellow-700 border-yellow-100"
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-100"
      default:
        return "bg-blue-50 text-blue-700 border-blue-100"
    }
  }

  const getIcon = () => {
    switch (color) {
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "danger":
        return <AlertCircle className="h-5 w-5" />
      case "warning":
        return <AlertCircle className="h-5 w-5" />
      case "info":
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <div
      className={cn("relative flex items-center gap-3 rounded-lg border p-4", getColorClasses(), className)}
      {...rest}
    >
      {getIcon()}
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-background/20"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
}

export default MDAlert
