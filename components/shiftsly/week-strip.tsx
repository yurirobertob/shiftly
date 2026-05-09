"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type DayStatus = "complete" | "alert" | "empty" | "partial"

interface WeekDay {
  date: Date
  status: DayStatus
}

interface WeekStripProps {
  days: WeekDay[]
  selectedDate: Date
  onDaySelect: (date: Date) => void
  className?: string
}

const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"]

const statusConfig: Record<DayStatus, { chip: string; dot: string; label: string }> = {
  complete: {
    chip: "bg-secondary text-secondary-foreground border-transparent",
    dot: "bg-success",
    label: "completo",
  },
  alert: {
    chip: "bg-warning/15 text-warning border-warning/40",
    dot: "bg-warning",
    label: "alerta",
  },
  empty: {
    chip: "bg-transparent text-muted-foreground border-border",
    dot: "bg-muted-foreground/40",
    label: "vazio",
  },
  partial: {
    chip: "bg-transparent text-foreground border-border",
    dot: "bg-primary/50",
    label: "parcial",
  },
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function WeekStrip({ days, selectedDate, onDaySelect, className }: WeekStripProps) {
  return (
    <div
      role="listbox"
      aria-label="Semana"
      className={cn("flex w-full gap-1 overflow-x-auto px-4 py-2 scrollbar-none", className)}
    >
      {days.map((day) => {
        const isSelected = isSameDay(day.date, selectedDate)
        const config = statusConfig[day.status]
        const weekdayIdx = day.date.getDay()
        const dayNum = day.date.getDate()

        return (
          <button
            key={day.date.toISOString()}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={`${WEEKDAY_SHORT[weekdayIdx]} ${dayNum} — ${config.label}`}
            onClick={() => onDaySelect(day.date)}
            className={cn(
              "flex min-w-[var(--hit-area-min)] flex-1 flex-col items-center gap-1 rounded-shape-sm border px-2 py-1.5 text-xs font-medium transition-all",
              config.chip,
              isSelected && "ring-2 ring-primary ring-offset-1",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <span className="font-semibold uppercase tracking-wide">
              {WEEKDAY_SHORT[weekdayIdx]}
            </span>
            <span className="text-base font-bold leading-none">{dayNum}</span>
            <div className="flex items-center justify-center">
              {day.status === "alert" ? (
                <AlertTriangle className="size-3 text-warning" aria-hidden />
              ) : (
                <div className={cn("size-1.5 rounded-full", config.dot)} aria-hidden />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export { WeekStrip }
export type { WeekStripProps, WeekDay, DayStatus }
