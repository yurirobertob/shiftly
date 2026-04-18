import type { Meta, StoryObj } from "@storybook/react";
import { KPICards } from "@/components/dashboard/kpi-cards";

const meta: Meta<typeof KPICards> = {
  title: "Dashboard/KPICards",
  component: KPICards,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof KPICards>;

export const Default: Story = {
  args: {
    data: {
      custoDaSemana: 3240,
      custoVariacao: 180,
      horasRegistradas: "127h",
      servicosDescobertos: 3,
      pendencias: 2,
    },
  },
};

export const NoPendencies: Story = {
  args: {
    data: {
      custoDaSemana: 2850,
      custoVariacao: -50,
      horasRegistradas: "112h",
      servicosDescobertos: 0,
      pendencias: 0,
    },
  },
};

export const HighCost: Story = {
  args: {
    data: {
      custoDaSemana: 5620,
      custoVariacao: 620,
      horasRegistradas: "198h",
      servicosDescobertos: 7,
      pendencias: 5,
    },
  },
};
