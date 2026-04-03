"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, RotateCcw } from "lucide-react";
import { usePaletteStore } from "@/store/palette-store";
import type { ExtractedColor } from "@/lib/color-extraction";
import { toast } from "./Toast";

function interpolateColor(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number },
  t: number
) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function randomHue() {
  return Math.floor(Math.random() * 360);
}

function hslToRgb(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export default function GradientGenerator() {
  const { currentColors, setCurrentColors } = usePaletteStore();
  const [steps, setSteps] = useState(6);
  const [gradientType, setGradientType] = useState<"from-palette" | "random">("random");
  const [seed, setSeed] = useState(0);

  const gradientColors: ExtractedColor[] = useMemo(() => {
    if (gradientType === "from-palette" && currentColors.length >= 2) {
      // Generate gradient between first and last palette colors
      const start = currentColors[0].rgb;
      const end = currentColors[currentColors.length - 1].rgb;
      return Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        const rgb = interpolateColor(start, end, t);
        return {
          hex: rgbToHex(rgb.r, rgb.g, rgb.b),
          rgb,
          hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
        };
      });
    } else {
      // Random gradient: pick two random hues
      const h1 = (seed * 137 + 42) % 360;
      const h2 = (h1 + 120 + (seed * 37) % 120) % 360;
      const start = hslToRgb(h1, 70, 55);
      const end = hslToRgb(h2, 70, 55);
      return Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        const rgb = interpolateColor(start, end, t);
        return {
          hex: rgbToHex(rgb.r, rgb.g, rgb.b),
          rgb,
          hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
        };
      });
    }
  }, [currentColors, steps, gradientType, seed]);

  const cssGradient = `linear-gradient(90deg, ${gradientColors.map((c) => c.hex).join(", ")})`;

  const copyGradient = async () => {
    await navigator.clipboard.writeText(`background: ${cssGradient};`);
    toast("CSS gradient copied!");
  };

  const applyAsPalette = () => {
    setCurrentColors(gradientColors);
    toast("Gradient applied as palette!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Gradient Generator
        </h3>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          <button
            onClick={() => setGradientType("random")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              gradientType === "random"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}
          >
            Random
          </button>
          {currentColors.length >= 2 && (
            <button
              onClick={() => setGradientType("from-palette")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                gradientType === "from-palette"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }`}
            >
              From Palette
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Steps:</label>
          <div className="flex gap-1">
            {[4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => setSteps(n)}
                className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                  steps === n
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Shuffle
        </button>
      </div>

      {/* Gradient preview */}
      <div
        className="h-16 w-full rounded-xl shadow-inner"
        style={{ background: cssGradient }}
      />

      {/* Color dots */}
      <div className="flex gap-2 justify-center">
        {gradientColors.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
              style={{ backgroundColor: c.hex }}
            />
            <span className="text-[10px] font-mono text-gray-400">
              {c.hex}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={copyGradient}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-medium transition-colors"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy CSS
        </button>
        <button
          onClick={applyAsPalette}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-medium transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Use as Palette
        </button>
      </div>
    </motion.div>
  );
}
