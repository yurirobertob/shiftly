import type { Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/hooks/use-language";
import { SocialProofBar } from "@/components/landing/social-proof-bar";

const meta: Meta<typeof SocialProofBar> = {
  title: "Landing/SocialProofBar",
  component: SocialProofBar,
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
type Story = StoryObj<typeof SocialProofBar>;

export const Default: Story = {};
