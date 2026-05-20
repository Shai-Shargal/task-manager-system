/**
 * Employee color theme helpers for dashboard visualization.
 */

export const DEFAULT_EMPLOYEE_COLOR = '#3B82F6';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function normalizeColor(hex) {
  if (!hex || typeof hex !== 'string') return DEFAULT_EMPLOYEE_COLOR;
  const trimmed = hex.trim();
  return HEX_PATTERN.test(trimmed) ? trimmed : DEFAULT_EMPLOYEE_COLOR;
}

function hexToRgb(hex) {
  const color = normalizeColor(hex).slice(1);
  return {
    r: parseInt(color.slice(0, 2), 16),
    g: parseInt(color.slice(2, 4), 16),
    b: parseInt(color.slice(4, 6), 16),
  };
}

export function employeeTheme(hex) {
  const color = normalizeColor(hex);
  const { r, g, b } = hexToRgb(color);

  return {
    color,
    dotStyle: { backgroundColor: color },
    badgeStyle: {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
      color,
      border: `1px solid rgba(${r}, ${g}, ${b}, 0.35)`,
    },
    rowAccentStyle: {
      boxShadow: `inset 4px 0 0 ${color}`,
    },
  };
}
