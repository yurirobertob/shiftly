import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { Navbar } from "@/components/landing/navbar";

const meta: Meta<typeof Navbar> = {
  title: "Landing/Navbar",
  component: Navbar,
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
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};
