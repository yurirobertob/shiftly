import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="sem-atribuicao" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="sem-atribuicao">Sem atribuição (3)</TabsTrigger>
        <TabsTrigger value="atribuidos">Atribuídos (8)</TabsTrigger>
        <TabsTrigger value="todos">Todos (11)</TabsTrigger>
      </TabsList>
      <TabsContent value="sem-atribuicao">
        <div className="rounded-lg border bg-white p-4 mt-2">
          <p className="text-sm text-gray-600">3 serviços precisam de diarista</p>
        </div>
      </TabsContent>
      <TabsContent value="atribuidos">
        <div className="rounded-lg border bg-white p-4 mt-2">
          <p className="text-sm text-gray-600">8 serviços com diarista atribuída</p>
        </div>
      </TabsContent>
      <TabsContent value="todos">
        <div className="rounded-lg border bg-white p-4 mt-2">
          <p className="text-sm text-gray-600">11 serviços no total</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
