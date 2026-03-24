"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import ImageDropzone from "@/components/ImageDropzone";
import ColorSwatch from "@/components/ColorSwatch";
import ExportPanel from "@/components/ExportPanel";
import SavePalette from "@/components/SavePalette";
import SharePalette from "@/components/SharePalette";
import PaletteHistory from "@/components/PaletteHistory";
import DarkModeToggle from "@/components/DarkModeToggle";
import ToastContainer from "@/components/Toast";
import { usePaletteStore } from "@/store/palette-store";
import {
  extractColors,
  imageFileToImageData,
} from "@/lib/color-extraction";

export default function Home() {
  const {
    currentColors,
    currentImagePreview,
    darkMode,
    setCurrentColors,
    setCurrentImagePreview,
  } = usePaletteStore();
  const [processing, setProcessing] = useState(false);
  const [numColors, setNumColors] = useState(6);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for shared palette in URL params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paletteParam = params.get("palette");
      if (paletteParam) {
        const hexColors = paletteParam.split("-").filter(Boolean);
        if (hexColors.length > 0) {
          const parsedColors = hexColors.map((hex) => {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const rr = r / 255, gg = g / 255, bb = b / 255;
            const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
            let h = 0, s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
                case gg: h = ((bb - rr) / d + 2) / 6; break;
                case bb: h = ((rr - gg) / d + 4) / 6; break;
              }
            }
            return {
              hex: `#${hex}`,
              rgb: { r, g, b },
              hsl: { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) },
            };
          });
          setCurrentColors(parsedColors);
        }
      }
    }
  }, [setCurrentColors]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleImageSelected = useCallback(
    async (file: File) => {
      setProcessing(true);
      try {
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          // Create small thumbnail for storage
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 80;
            canvas.height = 80;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, 80, 80);
              setCurrentImagePreview(canvas.toDataURL("image/jpeg", 0.5));
            }
          };
          img.src = result;
          setCurrentImagePreview(result);
        };
        reader.readAsDataURL(file);

        const imageData = await imageFileToImageData(file);
        const colors = extractColors(imageData, numColors);
        setCurrentColors(colors);
      } catch (err) {
        console.error("Error extracting colors:", err);
      } finally {
        setProcessing(false);
      }
    },
    [numColors, setCurrentColors, setCurrentImagePreview]
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <ToastContainer />

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">SnapPalette</h1>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-2">
            Instant Color Palettes from Images
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Drop an image to extract its dominant colors. Copy, export, and
            check accessibility — all in your browser.
          </p>
        </motion.div>

        {/* Dropzone */}
        <ImageDropzone
          onImageSelected={handleImageSelected}
          preview={currentImagePreview}
        />

        {/* Color count selector */}
        {currentColors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3"
          >
            <label className="text-sm text-gray-500 dark:text-gray-400">
              Colors:
            </label>
            <div className="flex gap-1">
              {[4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumColors(n)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    numColors === n
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {processing && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
          </div>
        )}

        {/* Color swatches grid */}
        {currentColors.length > 0 && !processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {currentColors.map((color, i) => (
              <ColorSwatch key={`${color.hex}-${i}`} color={color} index={i} />
            ))}
          </motion.div>
        )}

        {/* Save & Export */}
        {currentColors.length > 0 && !processing && (
          <div className="space-y-4">
            <SavePalette />
            <SharePalette />
            <ExportPanel colors={currentColors} paletteName="palette" />
          </div>
        )}

        {/* History */}
        <PaletteHistory />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          SnapPalette — Open source color palette generator. No data leaves your
          browser.
        </div>
      </footer>
    </div>
  );
}
