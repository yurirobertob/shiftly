/**
 * Shiftsly Design System Tokens
 *
 * Single source of truth for all design tokens used across the app.
 * These get converted to CSS custom properties via generate-css.ts.
 */

export const tokens = {
  // ─── Colors ──────────────────────────────────────────────────────────────────

  background: "#F6F7F9",
  foreground: "#0F172A",
  card: "#FFFFFF",
  cardForeground: "#0F172A",
  popover: "#FFFFFF",
  popoverForeground: "#0F172A",
  primary: "#2463EB",
  primaryForeground: "#FFFFFF",
  secondary: "#F1F5F9",
  secondaryForeground: "#0F172A",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  accent: "#F1F5F9",
  accentForeground: "#0F172A",
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",
  border: "#E2E8F0",
  input: "#E2E8F0",
  ring: "#2463EB",

  // ─── Chart Colors ────────────────────────────────────────────────────────────

  chart1: "#2463EB",
  chart2: "#10B981",
  chart3: "#F59E0B",
  chart4: "#EF4444",
  chart5: "#8B5CF6",

  // ─── Sidebar ─────────────────────────────────────────────────────────────────

  sidebar: {
    background: "#FFFFFF",
    foreground: "#0F172A",
    primary: "#2463EB",
    primaryForeground: "#FFFFFF",
    accent: "#F1F5F9",
    accentForeground: "#0F172A",
    border: "#E2E8F0",
    ring: "#2463EB",
  },

  // ─── Radius ──────────────────────────────────────────────────────────────────

  radius: "0.625rem",
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  fontSans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

// ─── Spacing Scale ───────────────────────────────────────────────────────────

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export type Tokens = typeof tokens;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
