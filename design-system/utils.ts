/**
 * Design System Utilities
 *
 * Helper functions for converting token keys to CSS custom property names.
 */

/**
 * Convert a camelCase token key to a CSS custom property name.
 * e.g. "primaryForeground" -> "--primary-foreground"
 */
export function tokenKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
  // Handle numbered keys like "chart1" -> "chart-1"
  const withNumberSep = kebab.replace(/([a-z])(\d)/g, "$1-$2");
  return `--${withNumberSep}`;
}

/**
 * Convert a sidebar token key to a CSS custom property name.
 * e.g. "primaryForeground" -> "--sidebar-primary-foreground"
 */
export function sidebarKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
  return `--sidebar-${kebab}`;
}
