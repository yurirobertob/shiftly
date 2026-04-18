import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { ProblemSection } from "@/components/landing/problem-section";

const meta: Meta<typeof ProblemSection> = {
  title: "Landing/ProblemSection",
  component: ProblemSection,
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
type Story = StoryObj<typeof ProblemSection>;

export const Default: Story = {};
