"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indeterminate?: boolean
  color?: "primary" | "success" | "warning" | "error"
}

const colorMap = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
}

function LinearProgress({
  className,
  value,
  indeterminate = false,
  color = "primary",
  ...props
}: LinearProgressProps) {
  const clampedValue = value !== undefined ? Math.min(100, Math.max(0, value)) : 0
  const isIndeterminate = indeterminate || value === undefined

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isIndeterminate ? undefined : clampedValue}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          colorMap[color],
          isIndeterminate && "animate-[indeterminate_1.5s_ease-in-out_infinite] w-1/3"
        )}
        style={isIndeterminate ? undefined : { width: `${clampedValue}%` }}
      />
    </div>
  )
}

interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  value?: number
  indeterminate?: boolean
  size?: number
  strokeWidth?: number
  color?: "primary" | "success" | "warning" | "error"
}

const strokeColorMap = {
  primary: "stroke-primary",
  success: "stroke-success",
  warning: "stroke-warning",
  error: "stroke-destructive",
}

function CircularProgress({
  className,
  value,
  indeterminate = false,
  size = 40,
  strokeWidth = 3,
  color = "primary",
  ...props
}: CircularProgressProps) {
  const isIndeterminate = indeterminate || value === undefined
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedValue = value !== undefined ? Math.min(100, Math.max(0, value)) : 0
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference

  return (
    <svg
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isIndeterminate ? undefined : clampedValue}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn(isIndeterminate && "animate-spin", className)}
      {...props}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={isIndeterminate ? circumference * 0.75 : strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className={cn("transition-[stroke-dashoffset] duration-300", strokeColorMap[color])}
      />
    </svg>
  )
}

export { LinearProgress, CircularProgress }
