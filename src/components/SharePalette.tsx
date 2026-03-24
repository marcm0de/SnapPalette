"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { usePaletteStore } from "@/store/palette-store";
import { toast } from "./Toast";

export default function SharePalette() {
  const { currentColors } = usePaletteStore();
  const [copied, setCopied] = useState(false);

  if (currentColors.length === 0) return null;

  const generateShareUrl = (): string => {
    const hexColors = currentColors.map((c) => c.hex.replace("#", "")).join("-");
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}?palette=${hexColors}`;
  };

  const copyShareLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      toast("Share link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={copyShareLink}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share Palette Link
        </>
      )}
    </button>
  );
}
