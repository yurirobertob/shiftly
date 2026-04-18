import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { PricingSection } from "@/components/landing/pricing-section";

const meta: Meta<typeof PricingSection> = {
  title: "Landing/PricingSection",
  component: PricingSection,
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
type Story = StoryObj<typeof PricingSection>;

export const Default: Story = {};
