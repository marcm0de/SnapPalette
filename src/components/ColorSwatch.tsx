"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check as CheckIcon, Eye } from "lucide-react";
import type { ExtractedColor } from "@/lib/color-extraction";
import { checkWCAG, type WCAGResult } from "@/lib/contrast";
import { toast } from "./Toast";

interface Props {
  color: ExtractedColor;
  index: number;
}

export default function ColorSwatch({ color, index }: Props) {
  const [showContrast, setShowContrast] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const whiteContrast: WCAGResult = checkWCAG(
    { r: 255, g: 255, b: 255 },
    color.rgb
  );
  const blackContrast: WCAGResult = checkWCAG(
    { r: 0, g: 0, b: 0 },
    color.rgb
  );

  // Use white text if white has better contrast on this background
  const useWhiteText = whiteContrast.ratio > blackContrast.ratio;
  const textColor = useWhiteText ? "text-white" : "text-black";

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast(`Copied ${label}: ${value}`);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const formatRgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const formatHsl = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow"
    >
      {/* Main color block */}
      <div
        className="aspect-square w-full relative"
        style={{ backgroundColor: color.hex }}
      >
        <button
          onClick={() => setShowContrast(!showContrast)}
          className={`absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${textColor} hover:bg-black/10 dark:hover:bg-white/10`}
          title="Check contrast"
        >
          <Eye className="h-4 w-4" />
        </button>

        {showContrast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/20 p-2 ${textColor} text-xs font-mono`}
          >
            <div className="bg-black/40 rounded px-2 py-1 text-white">
              <span>White: {whiteContrast.ratio}:1</span>
              <span className="ml-1">
                {whiteContrast.aa ? "AA ✓" : ""}{" "}
                {whiteContrast.aaa ? "AAA ✓" : ""}
              </span>
            </div>
            <div className="bg-white/80 rounded px-2 py-1 text-black">
              <span>Black: {blackContrast.ratio}:1</span>
              <span className="ml-1">
                {blackContrast.aa ? "AA ✓" : ""}{" "}
                {blackContrast.aaa ? "AAA ✓" : ""}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Color info panel */}
      <div className="bg-white dark:bg-gray-800 p-3 space-y-1.5">
        <CopyRow
          label="HEX"
          value={color.hex}
          copied={copiedField === "HEX"}
          onClick={() => copyValue(color.hex, "HEX")}
        />
        <CopyRow
          label="RGB"
          value={formatRgb}
          copied={copiedField === "RGB"}
          onClick={() => copyValue(formatRgb, "RGB")}
        />
        <CopyRow
          label="HSL"
          value={formatHsl}
          copied={copiedField === "HSL"}
          onClick={() => copyValue(formatHsl, "HSL")}
        />
      </div>
    </motion.div>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onClick,
}: {
  label: string;
  value: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between text-xs font-mono rounded px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="text-gray-400 dark:text-gray-500 mr-2">{label}</span>
      <span className="text-gray-700 dark:text-gray-300 truncate">{value}</span>
      {copied ? (
        <CheckIcon className="h-3 w-3 ml-1 text-green-500 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 ml-1 text-gray-300 dark:text-gray-600 shrink-0" />
      )}
    </button>
  );
}
