import type { Meta, StoryObj } from "@storybook/react";
import { ServicosHoje } from "@/components/dashboard/servicos-hoje";

const meta: Meta<typeof ServicosHoje> = {
  title: "Dashboard/ServicosHoje",
  component: ServicosHoje,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ServicosHoje>;

const mockServicos = [
  { id: "1", cliente: "Família Thompson — Chelsea", diarista: "Ana Costa", horarioInicio: "08:00", horarioFim: "12:00", status: "concluido" as const },
  { id: "2", cliente: "Escritório Park Lane", diarista: "Maria Silva", horarioInicio: "09:00", horarioFim: "13:00", status: "em-servico" as const },
  { id: "3", cliente: "Apt. Kensington 4B", diarista: "Julia Santos", horarioInicio: "10:00", horarioFim: "14:00", status: "a-caminho" as const },
  { id: "4", cliente: "Residência Notting Hill", diarista: "—", horarioInicio: "11:00", horarioFim: "15:00", status: "descoberto" as const },
  { id: "5", cliente: "Cobertura Mayfair", diarista: "Luciana Ferreira", horarioInicio: "14:00", horarioFim: "18:00", status: "em-servico" as const },
];

export const Default: Story = {
  render: () => (
    <div className="w-[420px]">
      <ServicosHoje data={mockServicos} />
    </div>
  ),
};

export const AllCompleted: Story = {
  render: () => (
    <div className="w-[420px]">
      <ServicosHoje
        data={mockServicos.map((s) => ({ ...s, status: "concluido" as const }))}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-[420px]">
      <ServicosHoje data={[]} />
    </div>
  ),
};
