import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { ForWhoSection } from "@/components/landing/for-who-section";

const meta: Meta<typeof ForWhoSection> = {
  title: "Landing/ForWhoSection",
  component: ForWhoSection,
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
type Story = StoryObj<typeof ForWhoSection>;

export const Default: Story = {};
