// WCAG contrast ratio calculations
import type { RGB } from "./color-extraction";

function sRGBtoLinear(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: RGB): number {
  return (
    0.2126 * sRGBtoLinear(rgb.r) +
    0.7152 * sRGBtoLinear(rgb.g) +
    0.0722 * sRGBtoLinear(rgb.b)
  );
}

export function contrastRatio(color1: RGB, color2: RGB): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface WCAGResult {
  ratio: number;
  aa: boolean; // >= 4.5:1 for normal text
  aaLarge: boolean; // >= 3:1 for large text
  aaa: boolean; // >= 7:1 for normal text
  aaaLarge: boolean; // >= 4.5:1 for large text
}

export function checkWCAG(foreground: RGB, background: RGB): WCAGResult {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}
