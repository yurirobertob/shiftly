import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { Chip } from "@/components/ui/chip"
import { Calendar } from "lucide-react"

const meta: Meta<typeof Chip> = {
  title: "UI/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "select", options: ["filter", "input", "suggestion", "assist"] },
    selected: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Chip>

export const Filter: Story = {
  args: { variant: "filter", children: "Segunda" },
}

export const FilterSelected: Story = {
  args: { variant: "filter", selected: true, children: "Terça" },
}

export const Input: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(false)
    return (
      <Chip
        variant="input"
        selected={selected}
        onClick={() => setSelected((v) => !v)}
        onClose={selected ? () => setSelected(false) : undefined}
      >
        Maria Silva
      </Chip>
    )
  },
}

export const Suggestion: Story = {
  args: { variant: "suggestion", children: "Limpeza" },
}

export const Assist: Story = {
  args: { variant: "assist", icon: <Calendar />, children: "Ver semana" },
}

export const FilterStrip: Story = {
  render: () => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const [active, setActive] = React.useState<string>("Seg")
    return (
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <Chip
            key={d}
            variant="filter"
            selected={active === d}
            onClick={() => setActive(d)}
          >
            {d}
          </Chip>
        ))}
      </div>
    )
  },
}
