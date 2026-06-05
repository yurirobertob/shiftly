"use client"

import * as React from "react"
import { AlertTriangle, Info, X, XCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"

type AlertType = "error" | "warning" | "info"

interface AlertBannerProps {
  type: AlertType
  title: string
  message: string
  action?: { label: string; onClick: () => void }
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const typeConfig: Record<AlertType, {
  bg: string
  border: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  textColor: string
  actionColor: string
}> = {
  error: {
    bg: "bg-destructive/10 dark:bg-destructive/20",
    border: "border-destructive/30",
    icon: XCircle,
    iconColor: "text-destructive",
    textColor: "text-destructive",
    actionColor: "text-destructive hover:text-destructive/80",
  },
  warning: {
    bg: "bg-warning/10 dark:bg-warning/20",
    border: "border-warning/40",
    icon: AlertTriangle,
    iconColor: "text-warning",
    textColor: "text-foreground",
    actionColor: "text-warning hover:text-warning/80",
  },
  info: {
    bg: "bg-info/10 dark:bg-info/20",
    border: "border-info/30",
    icon: Info,
    iconColor: "text-info",
    textColor: "text-foreground",
    actionColor: "text-info hover:text-info/80",
  },
}

function AlertBanner({
  type,
  title,
  message,
  action,
  dismissible = true,
  onDismiss,
  className,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = React.useState(false)
  const { language } = useLanguage()
  const config = typeConfig[type]
  const Icon = config.icon

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex w-full items-start gap-3 border-b px-4 py-3",
        config.bg,
        config.border,
        className
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", config.iconColor)} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium leading-snug", config.textColor)}>
          {title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {message}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              "inline-flex items-center gap-1 rounded-shape-sm px-2 py-1 text-sm font-medium transition-colors",
              config.actionColor
            )}
          >
            {action.label}
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        )}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={language === "pt" ? "Dispensar alerta" : "Dismiss alert"}
            className="rounded-shape-sm p-1 text-muted-foreground transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export { AlertBanner }
export type { AlertBannerProps, AlertType }
