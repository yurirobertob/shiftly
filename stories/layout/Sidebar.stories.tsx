import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "@/components/layout/sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Sidebar />
      <main className="ml-[220px] p-6">
        <div className="rounded-xl border bg-white p-8">
          <h1 className="text-xl font-bold text-gray-900">Conteúdo da página</h1>
          <p className="text-sm text-gray-500 mt-2">
            A sidebar fica fixa à esquerda com 220px de largura.
          </p>
        </div>
      </main>
    </div>
  ),
};
