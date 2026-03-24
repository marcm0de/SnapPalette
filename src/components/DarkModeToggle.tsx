"use client";

import { Moon, Sun } from "lucide-react";
import { usePaletteStore } from "@/store/palette-store";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = usePaletteStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={darkMode ? "Light mode" : "Dark mode"}
    >
      {darkMode ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}
