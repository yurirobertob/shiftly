import type { Meta, StoryObj } from "@storybook/react"
import { AlertBanner } from "@/components/shiftsly/alert-banner"

const meta: Meta<typeof AlertBanner> = {
  title: "Shiftsly/AlertBanner",
  component: AlertBanner,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    type: { control: "select", options: ["error", "warning", "info"] },
  },
}

export default meta
type Story = StoryObj<typeof AlertBanner>

export const Warning: Story = {
  args: {
    type: "warning",
    title: "Falta de colaboradora",
    message: "Sábado, 10/05 está sem ninguém escalado",
    action: { label: "Escalar agora", onClick: () => {} },
    dismissible: true,
  },
}

export const Error: Story = {
  args: {
    type: "error",
    title: "Conflito de escala",
    message: "Maria Silva está escalada em dois setores ao mesmo tempo",
    action: { label: "Ver conflito", onClick: () => {} },
    dismissible: true,
  },
}

export const Info: Story = {
  args: {
    type: "info",
    title: "Semana publicada",
    message: "A escala da semana 10–16 mai foi enviada para as colaboradoras",
    dismissible: true,
  },
}

export const WithoutDismiss: Story = {
  args: {
    type: "warning",
    title: "Aprovação pendente",
    message: "3 trocas de turno aguardam sua aprovação",
    action: { label: "Revisar", onClick: () => {} },
    dismissible: false,
  },
}
