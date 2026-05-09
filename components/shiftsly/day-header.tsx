"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DayHeaderProps {
  date: Date
  onPrevious: () => void
  onNext: () => void
  isPreviousDisabled?: boolean
  isNextDisabled?: boolean
  employeeCount?: number
  className?: string
}

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const MONTHS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
]

function formatDate(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()]
  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${weekday}, ${day} ${month} ${year}`
}

function DayHeader({
  date,
  onPrevious,
  onNext,
  isPreviousDisabled = false,
  isNextDisabled = false,
  employeeCount,
  className,
}: DayHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-shape-md bg-card px-4 py-3",
        className
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          aria-label="Dia anterior"
          className="flex size-[var(--hit-area-min)] items-center justify-center rounded-shape-full text-muted-foreground transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-[var(--state-disabled)]"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-foreground">
            {formatDate(date)}
          </span>
          {employeeCount !== undefined && (
            <span className="text-xs text-muted-foreground">
              {employeeCount === 0
                ? "Ninguém escalado"
                : employeeCount === 1
                ? "1 colaboradora escalada"
                : `${employeeCount} colaboradoras escaladas`}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          aria-label="Próximo dia"
          className="flex size-[var(--hit-area-min)] items-center justify-center rounded-shape-full text-muted-foreground transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-[var(--state-disabled)]"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}

export { DayHeader }
export type { DayHeaderProps }
