"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex h-8 min-w-[48px] shrink-0 items-center justify-center gap-1.5 rounded-shape-sm border px-3 text-sm font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--state-disabled)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        filter:
          "border-border bg-transparent text-on-surface-variant hover:bg-muted/60 data-[selected=true]:bg-secondary data-[selected=true]:border-secondary data-[selected=true]:text-secondary-foreground",
        input:
          "border-border bg-transparent text-on-surface-variant hover:bg-muted/60 data-[selected=true]:bg-secondary data-[selected=true]:border-secondary data-[selected=true]:text-secondary-foreground",
        suggestion:
          "border-border bg-transparent text-on-surface-variant hover:bg-muted/60 cursor-default",
        assist:
          "border-border bg-card text-foreground shadow-elevation-1 hover:shadow-elevation-2",
      },
    },
    defaultVariants: {
      variant: "filter",
    },
  }
)

interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  selected?: boolean
  onClose?: () => void
  icon?: React.ReactNode
}

function Chip({
  className,
  variant = "filter",
  selected = false,
  onClose,
  icon,
  children,
  ...props
}: ChipProps) {
  const isCloseable = variant === "input" && onClose
  const isInteractive = variant !== "suggestion"

  const Tag = isInteractive ? "button" : "span"

  return (
    <Tag
      data-selected={selected}
      className={cn(chipVariants({ variant, className }))}
      {...(isInteractive ? props : {})}
    >
      {selected && variant !== "suggestion" && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="size-4 shrink-0"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {!selected && icon}
      <span>{children}</span>
      {isCloseable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remove"
        >
          <X className="size-3" />
        </button>
      )}
    </Tag>
  )
}

export { Chip, chipVariants }
