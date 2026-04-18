import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Detalhes da Diarista</SheetTitle>
          <SheetDescription>
            Veja as informações da diarista e seus serviços.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium">Ana Costa</p>
            <p className="text-xs text-gray-500">Disponível · 3 serviços hoje</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir à esquerda</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Filtre os serviços por status e data.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
