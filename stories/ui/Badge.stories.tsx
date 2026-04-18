import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Ativo" },
};

export const Secondary: Story = {
  args: { children: "Pendente", variant: "secondary" },
};

export const Destructive: Story = {
  args: { children: "Ausente", variant: "destructive" },
};

export const Outline: Story = {
  args: { children: "Rascunho", variant: "outline" },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
        Concluído
      </span>
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        Em serviço
      </span>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-[#BA7517]">
        A caminho
      </span>
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-[#E24B4A]">
        Descoberto
      </span>
      <span className="rounded-full bg-[#E6F4ED] px-2 py-0.5 text-[10px] font-semibold text-[#1B6545]">
        Ocupada
      </span>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
