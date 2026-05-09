import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { EmployeeRow } from "@/components/shiftsly/employee-row"

const meta: Meta<typeof EmployeeRow> = {
  title: "Shiftsly/EmployeeRow",
  component: EmployeeRow,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof EmployeeRow>

const employee = {
  id: "1",
  name: "Maria Silva",
  role: "Limpeza residencial",
}

export const Unscheduled: Story = {
  render: () => {
    const [scheduled, setScheduled] = React.useState(false)
    return (
      <EmployeeRow
        employee={employee}
        isScheduled={scheduled}
        onToggle={setScheduled}
      />
    )
  },
}

export const Scheduled: Story = {
  render: () => {
    const [scheduled, setScheduled] = React.useState(true)
    return (
      <EmployeeRow
        employee={employee}
        isScheduled={scheduled}
        onToggle={setScheduled}
      />
    )
  },
}

export const Loading: Story = {
  args: {
    employee,
    isScheduled: false,
    onToggle: () => {},
    isPending: true,
  },
}

export const Lista: Story = {
  render: () => {
    const employees = [
      { id: "1", name: "Maria Silva", role: "Limpeza" },
      { id: "2", name: "João Santos", role: "Manutenção" },
      { id: "3", name: "Ana Costa", role: "Limpeza" },
      { id: "4", name: "Pedro Oliveira", role: "Segurança" },
      { id: "5", name: "Carla Lima", role: "Limpeza" },
    ]
    const [scheduled, setScheduled] = React.useState<Record<string, boolean>>({
      "1": true,
      "3": true,
    })
    return (
      <div className="divide-y divide-border rounded-shape-md border border-border overflow-hidden">
        {employees.map((emp) => (
          <EmployeeRow
            key={emp.id}
            employee={emp}
            isScheduled={!!scheduled[emp.id]}
            onToggle={(v) => setScheduled((prev) => ({ ...prev, [emp.id]: v }))}
          />
        ))}
      </div>
    )
  },
}
