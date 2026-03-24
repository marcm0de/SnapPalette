"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { usePaletteStore, type SavedPalette } from "@/store/palette-store";

export default function PaletteHistory() {
  const { history, deletePalette, loadPalette } = usePaletteStore();
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Saved Palettes ({history.length})
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
            <div className="mt-3 space-y-2">
              {history.map((palette: SavedPalette) => (
                <motion.div
                  key={palette.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
                >
                  {/* Color dots */}
                  <div className="flex gap-1 shrink-0">
                    {palette.colors.slice(0, 6).map((c, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full border border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                      {palette.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(palette.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => loadPalette(palette)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deletePalette(palette.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
