import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { HowItWorks } from "@/components/landing/how-it-works";

const meta: Meta<typeof HowItWorks> = {
  title: "Landing/HowItWorks",
  component: HowItWorks,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <LanguageProvider>
        <Story />
      </LanguageProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HowItWorks>;

export const Default: Story = {};
