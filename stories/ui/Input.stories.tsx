import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Nome da diarista...",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@exemplo.com",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="nome">Nome da diarista</Label>
      <Input id="nome" placeholder="Ex: Ana Costa" />
    </div>
  ),
};

export const FormGroup: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input id="nome" placeholder="Ex: Ana Costa da Silva" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="ana@email.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="valor">Valor por diária (£)</Label>
        <Input id="valor" type="number" placeholder="65" />
      </div>
    </div>
  ),
};
