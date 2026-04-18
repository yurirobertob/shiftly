import type { Meta, StoryObj } from "@storybook/react";
import { DiaristasHoje } from "@/components/dashboard/diaristas-hoje";

const meta: Meta<typeof DiaristasHoje> = {
  title: "Dashboard/DiaristasHoje",
  component: DiaristasHoje,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof DiaristasHoje>;

const mockData = [
  { nome: "Ana Costa", iniciais: "AC", cor: "#1B6545", tarefa: "Família Thompson — Chelsea", status: "ocupada" as const },
  { nome: "Maria Silva", iniciais: "MS", cor: "#2463EB", tarefa: "Escritório Park Lane", status: "ocupada" as const },
  { nome: "Julia Santos", iniciais: "JS", cor: "#9333EA", tarefa: "A caminho — Apt. Kensington", status: "a-caminho" as const },
  { nome: "Fabiana Souza", iniciais: "FS", cor: "#E24B4A", tarefa: "Atestado médico", status: "ausente" as const },
  { nome: "Luciana Ferreira", iniciais: "LF", cor: "#BA7517", tarefa: "Sem serviço agendado", status: "livre" as const },
];

export const Default: Story = {
  render: () => (
    <div className="w-[380px]">
      <DiaristasHoje data={mockData} />
    </div>
  ),
};

export const AllBusy: Story = {
  render: () => (
    <div className="w-[380px]">
      <DiaristasHoje
        data={mockData.map((d) => ({ ...d, status: "ocupada" as const }))}
      />
    </div>
  ),
};
