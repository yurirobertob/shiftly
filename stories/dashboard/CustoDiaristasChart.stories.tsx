import type { Meta, StoryObj } from "@storybook/react";
import { CustoDiaristasChart } from "@/components/dashboard/custo-diaristas-chart";

const meta: Meta<typeof CustoDiaristasChart> = {
  title: "Dashboard/CustoDiaristasChart",
  component: CustoDiaristasChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof CustoDiaristasChart>;

const mockData = [
  { nome: "Ana Costa", iniciais: "AC", cor: "#1B6545", custo: 520, horasExtras: 0 },
  { nome: "Maria Silva", iniciais: "MS", cor: "#2463EB", custo: 680, horasExtras: 45 },
  { nome: "Julia Santos", iniciais: "JS", cor: "#9333EA", custo: 450, horasExtras: 0 },
  { nome: "Luciana Ferreira", iniciais: "LF", cor: "#BA7517", custo: 590, horasExtras: 30 },
  { nome: "Carla Mendes", iniciais: "CM", cor: "#E24B4A", custo: 410, horasExtras: 0 },
];

export const Default: Story = {
  render: () => (
    <div className="w-[380px]">
      <CustoDiaristasChart data={mockData} />
    </div>
  ),
};

export const NoOvertime: Story = {
  render: () => (
    <div className="w-[380px]">
      <CustoDiaristasChart
        data={mockData.map((d) => ({ ...d, horasExtras: 0 }))}
      />
    </div>
  ),
};
