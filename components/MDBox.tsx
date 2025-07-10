import type React from "react"
import { cn } from "@/lib/utils"

interface MDBoxProps {
  component?: React.ElementType
  variant?: string
  bgColor?: string
  color?: string
  opacity?: number
  borderRadius?: string
  shadow?: string | number
  coloredShadow?: string
  children?: React.ReactNode
  p?: number | string
  px?: number | string
  py?: number | string
  pt?: number | string
  pb?: number | string
  pl?: number | string
  pr?: number | string
  m?: number | string
  mx?: number | string
  my?: number | string
  mt?: number | string
  mb?: number | string
  ml?: number | string
  mr?: number | string
  width?: string | number
  height?: string | number
  display?: string
  position?: string
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
  zIndex?: string | number
  overflow?: string
  sx?: Record<string, any>
  className?: string
  borderTop?: string
  borderBottom?: string
  borderLeft?: string
  borderRight?: string
  border?: string
  flex?: string | number
  flexDirection?: string
  flexWrap?: string
  justifyContent?: string
  alignItems?: string
  gap?: number | string
  [key: string]: any
}

const MDBox: React.FC<MDBoxProps> = ({
  component: Component = "div",
  variant = "contained",
  bgColor = "transparent",
  color = "dark",
  opacity = 1,
  borderRadius = "none",
  shadow = "none",
  coloredShadow = "none",
  p = 0,
  px = 0,
  py = 0,
  pt = 0,
  pb = 0,
  pl = 0,
  pr = 0,
  m = 0,
  mx = 0,
  my = 0,
  mt = 0,
  mb = 0,
  ml = 0,
  mr = 0,
  width,
  height,
  display,
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  overflow,
  sx = {},
  className = "",
  borderTop,
  borderBottom,
  borderLeft,
  borderRight,
  border,
  flex,
  flexDirection,
  flexWrap,
  justifyContent,
  alignItems,
  gap,
  children,
  ...rest
}) => {
  // Convert padding and margin values to CSS classes
  const getPaddingClass = (value: number | string) => {
    if (typeof value === "number") {
      return `p-${value}`
    }
    return `p-[${value}]`
  }

  const getMarginClass = (value: number | string) => {
    if (typeof value === "number") {
      return `m-${value}`
    }
    return `m-[${value}]`
  }

  // Build the style object
  const style: React.CSSProperties = {
    backgroundColor: bgColor,
    color,
    opacity,
    borderRadius,
    width,
    height,
    display,
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    overflow,
    borderTop,
    borderBottom,
    borderLeft,
    borderRight,
    border,
    flex,
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    gap,
    ...sx,
  }

  // Clean up the style object by removing undefined values
  Object.keys(style).forEach((key) => {
    if (style[key as keyof React.CSSProperties] === undefined) {
      delete style[key as keyof React.CSSProperties]
    }
  })

  return (
    <Component
      className={cn(
        p !== 0 && getPaddingClass(p),
        px !== 0 && `px-${px}`,
        py !== 0 && `py-${py}`,
        pt !== 0 && `pt-${pt}`,
        pb !== 0 && `pb-${pb}`,
        pl !== 0 && `pl-${pl}`,
        pr !== 0 && `pr-${pr}`,
        m !== 0 && getMarginClass(m),
        mx !== 0 && `mx-${mx}`,
        my !== 0 && `my-${my}`,
        mt !== 0 && `mt-${mt}`,
        mb !== 0 && `mb-${mb}`,
        ml !== 0 && `ml-${ml}`,
        mr !== 0 && `mr-${mr}`,
        shadow !== "none" && `shadow-${shadow}`,
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default MDBox
