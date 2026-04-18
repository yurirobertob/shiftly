import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Serviço #1024</CardTitle>
        <CardDescription>Limpeza residencial — 3h previstas</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Cliente: Maria da Silva · Diarista: Ana Costa
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Ver detalhes</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-[320px]">
      <CardHeader>
        <CardTitle>KPI Resumo</CardTitle>
        <CardDescription>Custos desta semana</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">R$ 3.240</p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Diaristas ativas</CardTitle>
        <CardDescription>12 cadastradas</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Gerenciar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">8 disponíveis hoje</p>
      </CardContent>
    </Card>
  ),
};
