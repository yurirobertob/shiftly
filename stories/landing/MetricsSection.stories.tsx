import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { MetricsSection } from "@/components/landing/metrics-section";

const meta: Meta<typeof MetricsSection> = {
  title: "Landing/MetricsSection",
  component: MetricsSection,
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
type Story = StoryObj<typeof MetricsSection>;

export const Default: Story = {};
