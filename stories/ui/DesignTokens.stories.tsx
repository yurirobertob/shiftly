import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Design Tokens",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

const colors = [
  { name: "Primary (Shiftsly Green)", hex: "#1B6545", token: "--primary-green" },
  { name: "Primary Medium", hex: "#4DAE89", token: "--medium-green" },
  { name: "Primary Light", hex: "#E6F4ED", token: "--light-green" },
  { name: "Primary Dark", hex: "#0F3D28", token: "--dark-green" },
  { name: "Amber (Alerta)", hex: "#BA7517", token: "--amber" },
  { name: "Red (Perigo)", hex: "#E24B4A", token: "--red" },
  { name: "Background", hex: "#F6F7F9", token: "--background" },
  { name: "Foreground", hex: "#0F172A", token: "--foreground" },
  { name: "Card", hex: "#FFFFFF", token: "--card" },
  { name: "Border", hex: "#E2E8F0", token: "--border" },
  { name: "Muted", hex: "#F1F5F9", token: "--muted" },
  { name: "Muted Foreground", hex: "#64748B", token: "--muted-foreground" },
];

export const ColorPalette: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Paleta de Cores — Shiftsly</h2>
        <p className="text-sm text-gray-500 mb-4">
          Cores do design system utilizadas em todo o app e landing page.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((c) => (
          <div key={c.hex} className="space-y-2">
            <div
              className="h-20 w-full rounded-xl border shadow-sm"
              style={{ backgroundColor: c.hex }}
            />
            <div>
              <p className="text-xs font-semibold text-gray-800">{c.name}</p>
              <p className="text-[11px] font-mono text-gray-500">{c.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Tipografia</h2>
        <p className="text-sm text-gray-500 mb-4">
          Font family: Geist Sans (variable) + Geist Mono
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-mono text-gray-400 block mb-1">text-3xl font-bold</span>
          <p className="text-3xl font-bold text-gray-900">Heading XL — Shiftsly</p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-gray-400 block mb-1">text-2xl font-bold</span>
          <p className="text-2xl font-bold text-gray-900">£ 3.240</p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-gray-400 block mb-1">text-lg font-semibold</span>
          <p className="text-lg font-semibold text-gray-900">Section Title</p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-gray-400 block mb-1">text-sm font-semibold</span>
          <p className="text-sm font-semibold text-gray-900">Card Title</p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-gray-400 block mb-1">text-sm text-gray-600</span>
          <p className="text-sm text-gray-600">Body text — descrição de componentes</p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-gray-400 block mb-1">text-xs text-gray-500</span>
          <p className="text-xs text-gray-500">Caption / helper text</p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-gray-400 block mb-1">text-[11px] text-gray-400</span>
          <p className="text-[11px] text-gray-400">Micro text — timestamps, extra info</p>
        </div>
      </div>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Espaçamento & Radius</h2>
        <p className="text-sm text-gray-500 mb-4">Padrões de radius e gap usados no Shiftsly.</p>
      </div>
      <div className="space-y-4">
        {[
          { label: "Card — rounded-xl", radius: "rounded-xl" },
          { label: "Button — rounded-lg", radius: "rounded-lg" },
          { label: "Badge — rounded-full", radius: "rounded-full" },
          { label: "Avatar — rounded-full", radius: "rounded-full" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <div
              className={`h-14 w-28 border-2 border-[#1B6545] bg-[#E6F4ED] ${item.radius}`}
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
