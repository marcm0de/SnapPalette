import type { ExtractedColor } from "./color-extraction";

function sanitizeName(name: string, index: number): string {
  return name
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : `color-${index + 1}`;
}

export function exportCSS(
  colors: ExtractedColor[],
  paletteName = "palette"
): string {
  const prefix = sanitizeName(paletteName, 0);
  const vars = colors
    .map((c, i) => `  --${prefix}-${i + 1}: ${c.hex};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

export function exportTailwind(
  colors: ExtractedColor[],
  paletteName = "palette"
): string {
  const name = sanitizeName(paletteName, 0);
  const entries = colors
    .map((c, i) => `      ${(i + 1) * 100}: '${c.hex}',`)
    .join("\n");
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${name}': {\n${entries}\n        },\n      },\n    },\n  },\n};`;
}

export function exportSCSS(
  colors: ExtractedColor[],
  paletteName = "palette"
): string {
  const prefix = sanitizeName(paletteName, 0);
  return colors
    .map((c, i) => `$${prefix}-${i + 1}: ${c.hex};`)
    .join("\n");
}

export function exportJSON(colors: ExtractedColor[]): string {
  return JSON.stringify(
    colors.map((c) => ({
      hex: c.hex,
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      hsl: `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`,
    })),
    null,
    2
  );
}

export function exportSVG(colors: ExtractedColor[]): string {
  const width = colors.length * 100;
  const rects = colors
    .map(
      (c, i) =>
        `  <rect x="${i * 100}" y="0" width="100" height="200" fill="${c.hex}" />\n  <text x="${i * 100 + 50}" y="220" text-anchor="middle" font-family="monospace" font-size="11" fill="#666">${c.hex}</text>`
    )
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 240" width="${width}" height="240">\n${rects}\n</svg>`;
}

export function exportGradientCSS(colors: ExtractedColor[]): string {
  const stops = colors.map((c) => c.hex).join(", ");
  return `/* Gradient */\nbackground: linear-gradient(90deg, ${stops});\n\n/* Radial */\nbackground: radial-gradient(circle, ${stops});`;
}
