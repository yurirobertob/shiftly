import type { Meta, StoryObj } from "@storybook/react";
import { RotaCard } from "@/components/rotas-ativas/rota-card";

const meta: Meta<typeof RotaCard> = {
  title: "RotasAtivas/RotaCard",
  component: RotaCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RotaCard>;

const now = new Date();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
const inOneHour = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString();
const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

export const EmServico: Story = {
  render: () => (
    <div className="w-[380px]">
      <RotaCard
        rota={{
          id: "1",
          diarista: { nome: "Ana Costa", iniciais: "AC", corAvatar: "#1B6545" },
          local: "Família Thompson — Chelsea",
          tipoServico: "Limpeza completa",
          inicioISO: twoHoursAgo,
          terminoPrevisoISO: inOneHour,
          status: "em-servico",
        }}
      />
    </div>
  ),
};

export const Iniciando: Story = {
  render: () => (
    <div className="w-[380px]">
      <RotaCard
        rota={{
          id: "2",
          diarista: { nome: "Maria Silva", iniciais: "MS", corAvatar: "#2463EB" },
          local: "Escritório Park Lane",
          tipoServico: "Limpeza comercial",
          inicioISO: thirtyMinAgo,
          terminoPrevisoISO: inTwoHours,
          status: "iniciando",
        }}
      />
    </div>
  ),
};

export const QuaseNoFim: Story = {
  render: () => (
    <div className="w-[380px]">
      <RotaCard
        rota={{
          id: "3",
          diarista: { nome: "Julia Santos", iniciais: "JS", corAvatar: "#9333EA" },
          local: "Apt. Kensington 4B",
          tipoServico: "Limpeza residencial",
          inicioISO: twoHoursAgo,
          terminoPrevisoISO: thirtyMinAgo,
          status: "quase-no-fim",
        }}
      />
    </div>
  ),
};

export const Atrasada: Story = {
  render: () => (
    <div className="w-[380px]">
      <RotaCard
        rota={{
          id: "4",
          diarista: { nome: "Fabiana Souza", iniciais: "FS", corAvatar: "#E24B4A" },
          local: "Residência Notting Hill",
          tipoServico: "Limpeza pós-obra",
          inicioISO: twoHoursAgo,
          terminoPrevisoISO: oneHourAgo,
          status: "atrasada",
        }}
      />
    </div>
  ),
};
