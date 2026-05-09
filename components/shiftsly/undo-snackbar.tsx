"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UndoSnackbarProps {
  message: string
  onUndo?: () => void
  onClose: () => void
  duration?: number
  className?: string
}

function UndoSnackbar({
  message,
  onUndo,
  onClose,
  duration = 4000,
  className,
}: UndoSnackbarProps) {
  const [visible, setVisible] = React.useState(true)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false)
      onClose()
    }, duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duration, onClose])

  function handleUndo() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    onUndo?.()
    onClose()
  }

  function handleClose() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    onClose()
  }

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "flex w-full max-w-sm items-center gap-3 rounded-shape-md bg-foreground px-4 py-3 text-background shadow-elevation-3",
        className
      )}
    >
      <p className="flex-1 text-sm font-medium">{message}</p>

      <div className="flex items-center gap-1">
        {onUndo && (
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-shape-sm px-2 py-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Desfazer
          </button>
        )}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="rounded-shape-full p-1 transition-colors hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

export { UndoSnackbar }
export type { UndoSnackbarProps }
