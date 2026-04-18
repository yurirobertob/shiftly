import type { Meta, StoryObj } from "@storybook/react";
import { AlertaDia } from "@/components/dashboard/alerta-dia";

const meta: Meta<typeof AlertaDia> = {
  title: "Dashboard/AlertaDia",
  component: AlertaDia,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AlertaDia>;

export const Default: Story = {
  render: () => (
    <div className="w-[380px]">
      <AlertaDia />
    </div>
  ),
};
