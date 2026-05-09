import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { ScheduleCarousel } from "@/components/shiftsly/schedule-carousel"

const meta: Meta<typeof ScheduleCarousel> = {
  title: "Shiftsly/ScheduleCarousel",
  component: ScheduleCarousel,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof ScheduleCarousel>

const BASE = new Date(2026, 4, 4)

function makeWeek(base: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d
  })
}

const EMPLOYEES = [
  { id: "1", name: "Maria Silva", role: "Limpeza" },
  { id: "2", name: "João Santos", role: "Manutenção" },
  { id: "3", name: "Ana Costa", role: "Limpeza" },
  { id: "4", name: "Pedro Oliveira", role: "Segurança" },
  { id: "5", name: "Carla Lima", role: "Limpeza" },
]

const INITIAL_SCHEDULE = [
  { date: "2026-05-04", employeeId: "1", scheduled: true },
  { date: "2026-05-04", employeeId: "3", scheduled: true },
]

export const Default: Story = {
  render: () => {
    const days = makeWeek(BASE)
    const [selectedDate, setSelectedDate] = React.useState(BASE)
    const [schedule, setSchedule] = React.useState(INITIAL_SCHEDULE)

    async function handleToggle(date: Date, employeeId: string, scheduled: boolean) {
      await new Promise((r) => setTimeout(r, 600))
      const dateStr = date.toISOString().slice(0, 10)
      setSchedule((prev) => {
        const filtered = prev.filter(
          (s) => !(s.date === dateStr && s.employeeId === employeeId)
        )
        return [...filtered, { date: dateStr, employeeId, scheduled }]
      })
    }

    return (
      <div className="max-w-sm rounded-shape-lg border border-border overflow-hidden bg-background">
        <ScheduleCarousel
          days={days}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onEmployeeToggle={handleToggle}
          employees={EMPLOYEES}
          schedule={schedule}
          onAddEmployee={() => alert("Adicionar colaboradora")}
        />
      </div>
    )
  },
}

export const Loading: Story = {
  render: () => {
    const days = makeWeek(BASE)
    return (
      <div className="max-w-sm rounded-shape-lg border border-border overflow-hidden bg-background">
        <ScheduleCarousel
          days={days}
          selectedDate={BASE}
          onDateChange={() => {}}
          onEmployeeToggle={async () => {}}
          employees={EMPLOYEES}
          schedule={[]}
          loading
        />
      </div>
    )
  },
}

export const SemColaboradoras: Story = {
  render: () => {
    const days = makeWeek(BASE)
    return (
      <div className="max-w-sm rounded-shape-lg border border-border overflow-hidden bg-background">
        <ScheduleCarousel
          days={days}
          selectedDate={BASE}
          onDateChange={() => {}}
          onEmployeeToggle={async () => {}}
          employees={[]}
          schedule={[]}
          onAddEmployee={() => alert("Cadastrar")}
        />
      </div>
    )
  },
}
