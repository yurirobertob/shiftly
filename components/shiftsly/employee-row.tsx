"use client"

import * as React from "react"
import { CircularProgress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Employee {
  id: string
  name: string
  role?: string
  avatar?: string
}

interface EmployeeRowProps {
  employee: Employee
  isScheduled: boolean
  onToggle: (scheduled: boolean) => void
  isPending?: boolean
  variant?: "default" | "compact"
  className?: string
}

function EmployeeAvatar({ employee }: { employee: Employee }) {
  const initials = employee.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  if (employee.avatar) {
    return (
      <img
        src={employee.avatar}
        alt={employee.name}
        className="size-9 rounded-shape-full object-cover"
      />
    )
  }

  return (
    <div
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-shape-full bg-secondary text-xs font-semibold text-secondary-foreground"
    >
      {initials}
    </div>
  )
}

function EmployeeRow({
  employee,
  isScheduled,
  onToggle,
  isPending = false,
  variant = "default",
  className,
}: EmployeeRowProps) {
  const checkboxId = `employee-row-${employee.id}`

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-shape-sm px-4 transition-colors hover:bg-muted/50 active:bg-muted",
        variant === "default" ? "min-h-[var(--hit-area-min)] py-1" : "min-h-10 py-0.5",
        isPending && "pointer-events-none",
        className
      )}
    >
      <EmployeeAvatar employee={employee} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{employee.name}</p>
        {employee.role && variant === "default" && (
          <p className="truncate text-xs text-muted-foreground">{employee.role}</p>
        )}
      </div>

      <div className="shrink-0">
        {isPending ? (
          <CircularProgress indeterminate size={20} strokeWidth={2} />
        ) : (
          <>
            <input
              id={checkboxId}
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => onToggle(e.target.checked)}
              aria-label={`${isScheduled ? "Remover" : "Escalar"} ${employee.name}`}
              className="sr-only"
            />
            <div
              aria-hidden
              className={cn(
                "flex size-6 items-center justify-center rounded-shape-xs border-2 transition-all",
                isScheduled
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-transparent"
              )}
            >
              {isScheduled && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  className="size-3.5"
                  aria-hidden
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
          </>
        )}
      </div>
    </label>
  )
}

export { EmployeeRow }
export type { EmployeeRowProps, Employee }
