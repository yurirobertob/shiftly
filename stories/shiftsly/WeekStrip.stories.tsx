import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { WeekStrip, type WeekDay } from "@/components/shiftsly/week-strip"

const meta: Meta<typeof WeekStrip> = {
  title: "Shiftsly/WeekStrip",
  component: WeekStrip,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof WeekStrip>

function makeDays(startDate: Date): WeekDay[] {
  const statuses = ["complete", "complete", "partial", "empty", "empty", "alert", "empty"] as const
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    return { date, status: statuses[i] }
  })
}

const BASE_DATE = new Date(2026, 4, 4) // Mon 4 May 2026

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(BASE_DATE)
    const days = makeDays(BASE_DATE)
    return (
      <WeekStrip
        days={days}
        selectedDate={selected}
        onDaySelect={setSelected}
      />
    )
  },
}

export const TodosAlertas: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(BASE_DATE)
    const days = makeDays(BASE_DATE).map((d) => ({ ...d, status: "alert" as const }))
    return (
      <WeekStrip
        days={days}
        selectedDate={selected}
        onDaySelect={setSelected}
      />
    )
  },
}
