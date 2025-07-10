import type React from "react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

interface MDButtonProps extends ButtonProps {
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info"
  variant?: "filled" | "outlined" | "gradient" | "text"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  circular?: boolean
  iconOnly?: boolean
  children: React.ReactNode
}

const MDButton: React.FC<MDButtonProps> = ({
  color = "primary",
  variant = "filled",
  size = "md",
  fullWidth = false,
  circular = false,
  iconOnly = false,
  className,
  children,
  ...rest
}) => {
  const getVariantClasses = () => {
    const baseClasses = "font-medium transition-all"

    // Handle different variants
    switch (variant) {
      case "filled":
        switch (color) {
          case "primary":
            return "bg-primary text-primary-foreground hover:bg-primary/90"
          case "secondary":
            return "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          case "success":
            return "bg-green-600 text-white hover:bg-green-700"
          case "danger":
            return "bg-red-600 text-white hover:bg-red-700"
          case "warning":
            return "bg-yellow-500 text-white hover:bg-yellow-600"
          case "info":
            return "bg-blue-600 text-white hover:bg-blue-700"
          default:
            return "bg-primary text-primary-foreground hover:bg-primary/90"
        }
      case "outlined":
        switch (color) {
          case "primary":
            return "border border-primary text-primary hover:bg-primary/10"
          case "secondary":
            return "border border-secondary text-secondary-foreground hover:bg-secondary/10"
          case "success":
            return "border border-green-600 text-green-600 hover:bg-green-50"
          case "danger":
            return "border border-red-600 text-red-600 hover:bg-red-50"
          case "warning":
            return "border border-yellow-500 text-yellow-500 hover:bg-yellow-50"
          case "info":
            return "border border-blue-600 text-blue-600 hover:bg-blue-50"
          default:
            return "border border-primary text-primary hover:bg-primary/10"
        }
      case "text":
        switch (color) {
          case "primary":
            return "text-primary hover:bg-primary/10"
          case "secondary":
            return "text-secondary-foreground hover:bg-secondary/10"
          case "success":
            return "text-green-600 hover:bg-green-50"
          case "danger":
            return "text-red-600 hover:bg-red-50"
          case "warning":
            return "text-yellow-500 hover:bg-yellow-50"
          case "info":
            return "text-blue-600 hover:bg-blue-50"
          default:
            return "text-primary hover:bg-primary/10"
        }
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90"
    }
  }

  const getSizeClasses = () => {
    if (iconOnly) {
      switch (size) {
        case "sm":
          return "h-8 w-8 p-0"
        case "md":
          return "h-10 w-10 p-0"
        case "lg":
          return "h-12 w-12 p-0"
        default:
          return "h-10 w-10 p-0"
      }
    }

    switch (size) {
      case "sm":
        return "h-8 px-3 text-xs"
      case "md":
        return "h-10 px-4 text-sm"
      case "lg":
        return "h-12 px-6 text-base"
      default:
        return "h-10 px-4 text-sm"
    }
  }

  return (
    <Button
      className={cn(
        getVariantClasses(),
        getSizeClasses(),
        fullWidth && "w-full",
        circular && "rounded-full",
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  )
}

export default MDButton
