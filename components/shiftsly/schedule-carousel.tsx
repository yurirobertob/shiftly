"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { DayHeader } from "./day-header"
import { EmployeeRow, type Employee } from "./employee-row"
import { UndoSnackbar } from "./undo-snackbar"
import { cn } from "@/lib/utils"

interface ScheduleEntry {
  date: string
  employeeId: string
  scheduled: boolean
}

interface ScheduleCarouselProps {
  days: Date[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEmployeeToggle: (date: Date, employeeId: string, scheduled: boolean) => Promise<void>
  employees: Employee[]
  schedule: ScheduleEntry[]
  loading?: boolean
  onAddEmployee?: () => void
  className?: string
}

interface PendingAction {
  date: Date
  employeeId: string
  scheduled: boolean
  employeeName: string
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function ScheduleCarousel({
  days,
  selectedDate,
  onDateChange,
  onEmployeeToggle,
  employees,
  schedule,
  loading = false,
  onAddEmployee,
  className,
}: ScheduleCarouselProps) {
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set())
  const [undoAction, setUndoAction] = React.useState<PendingAction | null>(null)
  const touchStartX = React.useRef<number | null>(null)

  const currentIndex = days.findIndex((d) => dateKey(d) === dateKey(selectedDate))
  const scheduledForDay = new Set(
    schedule
      .filter((s) => s.date === dateKey(selectedDate) && s.scheduled)
      .map((s) => s.employeeId)
  )

  async function handleToggle(employeeId: string, scheduled: boolean) {
    const employee = employees.find((e) => e.id === employeeId)
    if (!employee) return

    setPendingIds((prev) => new Set(prev).add(employeeId))

    const previouslyScheduled = !scheduled
    setUndoAction({
      date: selectedDate,
      employeeId,
      scheduled: previouslyScheduled,
      employeeName: employee.name,
    })

    try {
      await onEmployeeToggle(selectedDate, employeeId, scheduled)
    } catch {
      await onEmployeeToggle(selectedDate, employeeId, previouslyScheduled)
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(employeeId)
        return next
      })
    }
  }

  async function handleUndo() {
    if (!undoAction) return
    const { date, employeeId, scheduled } = undoAction
    setUndoAction(null)
    setPendingIds((prev) => new Set(prev).add(employeeId))
    try {
      await onEmployeeToggle(date, employeeId, scheduled)
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(employeeId)
        return next
      })
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    touchStartX.current = null
    if (Math.abs(delta) < 50) return
    if (delta > 0 && currentIndex < days.length - 1) {
      onDateChange(days[currentIndex + 1])
    } else if (delta < 0 && currentIndex > 0) {
      onDateChange(days[currentIndex - 1])
    }
  }

  return (
    <div
      className={cn("flex flex-col", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <DayHeader
        date={selectedDate}
        onPrevious={() => currentIndex > 0 && onDateChange(days[currentIndex - 1])}
        onNext={() => currentIndex < days.length - 1 && onDateChange(days[currentIndex + 1])}
        isPreviousDisabled={currentIndex <= 0}
        isNextDisabled={currentIndex >= days.length - 1}
        employeeCount={scheduledForDay.size}
      />

      <div
        role="listbox"
        aria-label={`Colaboradoras — ${selectedDate.toLocaleDateString("pt-BR")}`}
        className="flex flex-col divide-y divide-border"
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex min-h-[var(--hit-area-min)] items-center gap-3 px-4 py-2">
              <div className="size-9 rounded-shape-full bg-muted animate-pulse" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
              </div>
              <div className="size-6 rounded-shape-xs bg-muted animate-pulse" />
            </div>
          ))
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma colaboradora cadastrada
            </p>
            {onAddEmployee && (
              <button
                type="button"
                onClick={onAddEmployee}
                className="text-sm font-medium text-primary hover:underline"
              >
                Cadastrar colaboradora
              </button>
            )}
          </div>
        ) : (
          employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              isScheduled={scheduledForDay.has(employee.id)}
              onToggle={(scheduled) => handleToggle(employee.id, scheduled)}
              isPending={pendingIds.has(employee.id)}
            />
          ))
        )}
      </div>

      {onAddEmployee && employees.length > 0 && (
        <button
          type="button"
          onClick={onAddEmployee}
          className="flex min-h-[var(--hit-area-min)] w-full items-center gap-2 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/50"
        >
          <Plus className="size-4" />
          Adicionar colaboradora
        </button>
      )}

      {undoAction && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
          <UndoSnackbar
            message={`${undoAction.scheduled ? "Escalada" : "Removida"}: ${undoAction.employeeName}`}
            onUndo={handleUndo}
            onClose={() => setUndoAction(null)}
          />
        </div>
      )}
    </div>
  )
}

export { ScheduleCarousel }
export type { ScheduleCarouselProps, ScheduleEntry }
