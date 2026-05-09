import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

type MetricColor = "primary" | "success" | "warning" | "error" | "default"

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  unit?: string
  trend?: {
    value: number
    direction: "up" | "down"
  }
  color?: MetricColor
  empty?: boolean
  className?: string
}

const colorMap: Record<MetricColor, { icon: string; value: string }> = {
  primary: { icon: "text-primary", value: "text-foreground" },
  success:  { icon: "text-success",  value: "text-foreground" },
  warning:  { icon: "text-warning",  value: "text-foreground" },
  error:    { icon: "text-destructive", value: "text-destructive" },
  default:  { icon: "text-muted-foreground", value: "text-foreground" },
}

function MetricCard({
  icon,
  title,
  value,
  unit,
  trend,
  color = "default",
  empty = false,
  className,
}: MetricCardProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        "flex min-h-[var(--hit-area-min)] flex-col justify-between gap-1 rounded-shape-md bg-card px-3 py-3",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("size-4 [&_svg]:size-4", colors.icon)} aria-hidden>
          {icon}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      </div>

      <div className="flex items-baseline gap-1">
        {empty ? (
          <span className="text-lg font-semibold text-muted-foreground">—</span>
        ) : (
          <>
            {unit && (
              <span className="text-xs text-muted-foreground">{unit}</span>
            )}
            <span className={cn("text-lg font-semibold leading-none", colors.value)}>
              {value}
            </span>
          </>
        )}
      </div>

      {trend && !empty && (
        <div
          className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trend.direction === "up" ? "text-success" : "text-destructive"
          )}
        >
          {trend.direction === "up" ? (
            <TrendingUp className="size-3" aria-hidden />
          ) : (
            <TrendingDown className="size-3" aria-hidden />
          )}
          <span>
            {trend.direction === "up" ? "+" : ""}
            {trend.value}%
          </span>
        </div>
      )}
    </div>
  )
}

export { MetricCard }
export type { MetricCardProps, MetricColor }
