import type { Meta, StoryObj } from "@storybook/react"
import { DollarSign, Clock, AlertTriangle } from "lucide-react"
import { MetricCard } from "@/components/shiftsly/metric-card"

const meta: Meta<typeof MetricCard> = {
  title: "Shiftsly/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof MetricCard>

export const Custo: Story = {
  args: {
    icon: <DollarSign />,
    title: "Custo semana",
    value: "1.240",
    unit: "R$",
    color: "primary",
    trend: { value: 12, direction: "up" },
  },
}

export const Horas: Story = {
  args: {
    icon: <Clock />,
    title: "Horas",
    value: "96h",
    color: "default",
    trend: { value: 5, direction: "down" },
  },
}

export const Alertas: Story = {
  args: {
    icon: <AlertTriangle />,
    title: "Alertas",
    value: 3,
    color: "warning",
  },
}

export const Empty: Story = {
  args: {
    icon: <DollarSign />,
    title: "Custo semana",
    value: 0,
    unit: "R$",
    color: "default",
    empty: true,
  },
}

export const GridCompacto: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-2">
      <MetricCard
        icon={<DollarSign />}
        title="Custo"
        value="1.240"
        unit="R$"
        color="primary"
        trend={{ value: 12, direction: "up" }}
      />
      <MetricCard
        icon={<Clock />}
        title="Horas"
        value="96h"
        color="default"
      />
      <MetricCard
        icon={<AlertTriangle />}
        title="Alertas"
        value={3}
        color="warning"
      />
    </div>
  ),
}
