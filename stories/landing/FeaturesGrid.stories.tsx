import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { FeaturesGrid } from "@/components/landing/features-grid";

const meta: Meta<typeof FeaturesGrid> = {
  title: "Landing/FeaturesGrid",
  component: FeaturesGrid,
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
type Story = StoryObj<typeof FeaturesGrid>;

export const Default: Story = {};
