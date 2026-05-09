/**
 * Shiftsly Design System Tokens — MD3 Green
 *
 * Source color: #00B359 (Material Theme Builder)
 * Single source of truth for all design tokens.
 * Colors get injected into globals.css via `npm run tokens`.
 * Elevation, shape, state layers are exported for direct use.
 */

export const tokens = {
  // ─── Surface / Background ────────────────────────────────────────────────────
  background: "#F6FBF3",          // MD3 surface
  foreground: "#181D18",          // MD3 on-surface
  card: "#EAEFE7",                // MD3 surface-container
  cardForeground: "#181D18",
  popover: "#FFFFFF",             // MD3 surface-container-lowest
  popoverForeground: "#181D18",

  // ─── Primary (Green) ─────────────────────────────────────────────────────────
  primary: "#006D3D",             // MD3 primary
  primaryForeground: "#FFFFFF",   // MD3 on-primary

  // ─── Secondary ───────────────────────────────────────────────────────────────
  secondary: "#D2E8D5",           // MD3 secondary-container
  secondaryForeground: "#0C1F13", // MD3 on-secondary-container

  // ─── Muted / Surface Variants ────────────────────────────────────────────────
  muted: "#E4EAE1",               // MD3 surface-container-high
  mutedForeground: "#414941",     // MD3 on-surface-variant
  accent: "#D2E8D5",              // MD3 secondary-container
  accentForeground: "#0C1F13",

  // ─── Destructive / Error ─────────────────────────────────────────────────────
  destructive: "#BA1A1A",         // MD3 error
  destructiveForeground: "#FFFFFF",

  // ─── Border / Input / Ring ───────────────────────────────────────────────────
  border: "#C1C9C0",              // MD3 outline-variant
  input: "#C1C9C0",
  ring: "#006D3D",                // MD3 primary

  // ─── MD3 Extended Roles ──────────────────────────────────────────────────────
  primaryContainer: "#97F7B7",
  onPrimaryContainer: "#00210F",
  secondaryBase: "#4F6354",
  onSecondary: "#FFFFFF",
  tertiaryBase: "#3B6470",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#BFE9F8",
  onTertiaryContainer: "#001F27",
  surfaceVariant: "#DDE5DA",
  onSurfaceVariant: "#414941",
  outline: "#717971",
  outlineVariant: "#C1C9C0",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#410002",
  success: "#2FBF71",
  warning: "#FF8C42",
  info: "#1976D2",

  // ─── Chart Colors ────────────────────────────────────────────────────────────
  chart1: "#006D3D",
  chart2: "#2FBF71",
  chart3: "#FF8C42",
  chart4: "#BA1A1A",
  chart5: "#3B6470",

  // ─── Sidebar ─────────────────────────────────────────────────────────────────
  sidebar: {
    background: "#F0F5ED",        // MD3 surface-container-low
    foreground: "#181D18",
    primary: "#006D3D",
    primaryForeground: "#FFFFFF",
    accent: "#D2E8D5",
    accentForeground: "#0C1F13",
    border: "#C1C9C0",
    ring: "#006D3D",
  },

  // ─── Radius ──────────────────────────────────────────────────────────────────
  radius: "0.75rem",              // shape-md (12px) as base radius
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  fontSans: "'Roboto', ui-sans-serif, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

// ─── Spacing Scale ───────────────────────────────────────────────────────────

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
} as const;

// ─── Elevation (MD3 tonal surface shadows) ───────────────────────────────────

export const elevation = {
  0: "none",
  1: "0px 1px 2px rgba(0,0,0,0.30), 0px 1px 3px 1px rgba(0,0,0,0.15)",
  2: "0px 1px 2px rgba(0,0,0,0.30), 0px 2px 6px 2px rgba(0,0,0,0.15)",
  3: "0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px rgba(0,0,0,0.30)",
  4: "0px 6px 10px 4px rgba(0,0,0,0.15), 0px 2px 3px rgba(0,0,0,0.30)",
  5: "0px 8px 12px 6px rgba(0,0,0,0.15), 0px 4px 4px rgba(0,0,0,0.30)",
} as const;

// ─── Shape (Border Radius) ───────────────────────────────────────────────────

export const shape = {
  none: "0px",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "28px",
  full: "9999px",
} as const;

// ─── State Layer Opacities (MD3) ─────────────────────────────────────────────

export const stateLayer = {
  hover: 0.08,
  focus: 0.12,
  pressed: 0.12,
  dragged: 0.16,
  disabled: 0.38,
  disabledContainer: 0.12,
} as const;

// ─── Hit Area (Accessibility) ────────────────────────────────────────────────

export const hitArea = {
  min: "48px",
} as const;

export type Tokens = typeof tokens;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Elevation = typeof elevation;
export type Shape = typeof shape;
