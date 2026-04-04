"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, Copy } from "lucide-react";
import type { ExtractedColor } from "@/lib/color-extraction";
import { exportCSS, exportTailwind, exportSCSS, exportJSON, exportSVG, exportGradientCSS } from "@/lib/export";
import { toast } from "./Toast";

interface Props {
  colors: ExtractedColor[];
  paletteName: string;
}

const formats = [
  { id: "css", label: "CSS Variables", fn: exportCSS },
  { id: "tailwind", label: "Tailwind Config", fn: exportTailwind },
  { id: "scss", label: "SCSS Variables", fn: exportSCSS },
  { id: "json", label: "JSON", fn: exportJSON },
  { id: "svg", label: "SVG Swatch", fn: exportSVG },
  { id: "gradient", label: "Gradient CSS", fn: exportGradientCSS },
] as const;

export default function ExportPanel({ colors, paletteName }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("css");

  if (colors.length === 0) return null;

  const format = formats.find((f) => f.id === selected) ?? formats[0];
  const output =
    format.id === "json"
      ? exportJSON(colors)
      : format.fn(colors, paletteName);

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    toast(`Copied ${format.label}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 px-5 py-4 text-sm font-semibold hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <span className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Download className="h-5 w-5" />
          Export Palette
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              {/* Format tabs */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected === f.id
                        ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Code output */}
              <div className="relative">
                <pre className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-60">
                  {output}
                </pre>
                <button
                  onClick={copyOutput}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
