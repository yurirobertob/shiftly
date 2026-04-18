import type { Meta, StoryObj } from "@storybook/react";
import { ServicosSemanaChart } from "@/components/dashboard/servicos-semana-chart";

const meta: Meta<typeof ServicosSemanaChart> = {
  title: "Dashboard/ServicosSemanaChart",
  component: ServicosSemanaChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ServicosSemanaChart>;

export const Default: Story = {
  render: () => (
    <div className="w-[380px]">
      <ServicosSemanaChart
        data={[
          { dia: "Seg", total: 12, hoje: false },
          { dia: "Ter", total: 10, hoje: false },
          { dia: "Qua", total: 14, hoje: true },
          { dia: "Qui", total: 8, hoje: false },
          { dia: "Sex", total: 11, hoje: false },
        ]}
      />
    </div>
  ),
};

export const MondayHighlight: Story = {
  render: () => (
    <div className="w-[380px]">
      <ServicosSemanaChart
        data={[
          { dia: "Seg", total: 18, hoje: true },
          { dia: "Ter", total: 10, hoje: false },
          { dia: "Qua", total: 14, hoje: false },
          { dia: "Qui", total: 8, hoje: false },
          { dia: "Sex", total: 11, hoje: false },
        ]}
      />
    </div>
  ),
};
