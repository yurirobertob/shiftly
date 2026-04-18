import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { WeekBuilderDemo } from "@/components/landing/week-builder-demo";

const meta: Meta<typeof WeekBuilderDemo> = {
  title: "Landing/WeekBuilderDemo",
  component: WeekBuilderDemo,
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
type Story = StoryObj<typeof WeekBuilderDemo>;

export const Default: Story = {};
