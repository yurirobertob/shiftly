import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { FinalCTA } from "@/components/landing/final-cta";

const meta: Meta<typeof FinalCTA> = {
  title: "Landing/FinalCTA",
  component: FinalCTA,
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
type Story = StoryObj<typeof FinalCTA>;

export const Default: Story = {};
