"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { usePaletteStore } from "@/store/palette-store";
import { toast } from "./Toast";

export default function SavePalette() {
  const { currentColors, savePalette } = usePaletteStore();
  const [name, setName] = useState("");

  if (currentColors.length === 0) return null;

  const handleSave = () => {
    const paletteName = name.trim() || `Palette ${new Date().toLocaleDateString()}`;
    savePalette(paletteName);
    setName("");
    toast(`Saved "${paletteName}"`);
  };

  return (
    <div className="flex gap-2 w-full">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder="Name your palette..."
        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors placeholder:text-gray-400"
      />
      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-gray-100 px-5 py-2.5 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        <Save className="h-4 w-4" />
        Save
      </button>
    </div>
  );
}
