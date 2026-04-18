import type { Meta, StoryObj } from "@storybook/react";
import { RotasFAB } from "@/components/rotas-ativas/rotas-fab";

const meta: Meta<typeof RotasFAB> = {
  title: "RotasAtivas/RotasFAB",
  component: RotasFAB,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof RotasFAB>;

const now = new Date();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const inOneHour = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString();
const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();

const mockRotas = [
  {
    id: "1",
    diarista: { nome: "Ana Costa", iniciais: "AC", corAvatar: "#1B6545" },
    local: "Família Thompson — Chelsea",
    tipoServico: "Limpeza completa",
    inicioISO: twoHoursAgo,
    terminoPrevisoISO: inOneHour,
    status: "em-servico" as const,
  },
  {
    id: "2",
    diarista: { nome: "Maria Silva", iniciais: "MS", corAvatar: "#2463EB" },
    local: "Escritório Park Lane",
    tipoServico: "Limpeza comercial",
    inicioISO: oneHourAgo,
    terminoPrevisoISO: inTwoHours,
    status: "iniciando" as const,
  },
  {
    id: "3",
    diarista: { nome: "Fabiana Souza", iniciais: "FS", corAvatar: "#E24B4A" },
    local: "Residência Notting Hill",
    tipoServico: "Limpeza pós-obra",
    inicioISO: twoHoursAgo,
    terminoPrevisoISO: oneHourAgo,
    status: "atrasada" as const,
  },
];

export const WithRoutes: Story = {
  render: () => (
    <div className="min-h-[400px] bg-[#F6F7F9] p-8 relative">
      <p className="text-sm text-gray-500">Clique no botão verde no canto inferior direito para abrir o drawer.</p>
      <RotasFAB rotas={mockRotas} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="min-h-[400px] bg-[#F6F7F9] p-8 relative">
      <p className="text-sm text-gray-500">Sem rotas ativas — o badge não aparece.</p>
      <RotasFAB rotas={[]} />
    </div>
  ),
};
