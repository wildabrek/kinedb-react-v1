import type React from "react"
import { cn } from "@/lib/utils"

interface MDTypographyProps {
  component?: React.ElementType
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "button"
    | "caption"
    | "overline"
  color?: string
  fontWeight?: "light" | "regular" | "medium" | "bold"
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase"
  opacity?: number
  textGradient?: boolean
  children?: React.ReactNode
  className?: string
  sx?: Record<string, any>
  [key: string]: any
}

const MDTypography: React.FC<MDTypographyProps> = ({
  component: Component = "div",
  variant = "body1",
  color = "inherit",
  fontWeight = "regular",
  textTransform = "none",
  opacity = 1,
  textGradient = false,
  children,
  className = "",
  sx = {},
  ...rest
}) => {
  // Map variant to Tailwind classes
  const variantClasses = {
    h1: "text-4xl",
    h2: "text-3xl",
    h3: "text-2xl",
    h4: "text-xl",
    h5: "text-lg",
    h6: "text-base",
    subtitle1: "text-base",
    subtitle2: "text-sm",
    body1: "text-base",
    body2: "text-sm",
    button: "text-sm",
    caption: "text-xs",
    overline: "text-xs",
  }

  // Map fontWeight to Tailwind classes
  const fontWeightClasses = {
    light: "font-light",
    regular: "font-normal",
    medium: "font-medium",
    bold: "font-bold",
  }

  // Build the style object
  const style: React.CSSProperties = {
    color,
    opacity,
    textTransform,
    ...sx,
  }

  return (
    <Component
      className={cn(
        variantClasses[variant],
        fontWeightClasses[fontWeight],
        textGradient && "bg-clip-text text-transparent bg-gradient-to-r",
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default MDTypography
