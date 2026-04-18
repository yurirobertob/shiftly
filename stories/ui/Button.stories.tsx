import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Plus, Download, ArrowRight, Trash2 } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Confirmar",
    variant: "default",
    size: "default",
  },
};

export const Outline: Story = {
  args: {
    children: "Cancelar",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Voltar",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ver mais",
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    children: "Excluir",
    variant: "destructive",
  },
};

export const Link: Story = {
  args: {
    children: "Saiba mais",
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    children: "Ação",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Começar grátis →",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    children: "Indisponível",
    disabled: true,
  },
};

export const WithIconStart: Story = {
  render: () => (
    <Button>
      <Plus data-icon="inline-start" className="h-4 w-4" />
      Novo serviço
    </Button>
  ),
};

export const WithIconEnd: Story = {
  render: () => (
    <Button>
      Download
      <Download data-icon="inline-end" className="h-4 w-4" />
    </Button>
  ),
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    children: <Plus className="h-4 w-4" />,
  },
};

export const ShiftslyGreen: Story = {
  render: () => (
    <Button className="bg-[#1B6545] hover:bg-[#247a52] text-white">
      Começar grátis — 14 dias
      <ArrowRight data-icon="inline-end" className="h-4 w-4" />
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="default">Default</Button>
      <Button size="lg">LG</Button>
      <Button size="icon"><Plus className="h-4 w-4" /></Button>
    </div>
  ),
};
