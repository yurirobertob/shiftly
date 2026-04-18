import type { Preview } from "@storybook/react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "#F6F7F9" },
        { name: "white", value: "#ffffff" },
        { name: "dark", value: "#0F3D28" },
      ],
    },
    layout: "centered",
  },
};

export default preview;
