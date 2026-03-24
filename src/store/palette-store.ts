import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExtractedColor } from "@/lib/color-extraction";

export interface SavedPalette {
  id: string;
  name: string;
  colors: ExtractedColor[];
  createdAt: number;
  imagePreview?: string; // small base64 thumbnail
}

interface PaletteState {
  currentColors: ExtractedColor[];
  currentImagePreview: string | null;
  history: SavedPalette[];
  darkMode: boolean;
  setCurrentColors: (colors: ExtractedColor[]) => void;
  setCurrentImagePreview: (preview: string | null) => void;
  savePalette: (name: string) => void;
  deletePalette: (id: string) => void;
  loadPalette: (palette: SavedPalette) => void;
  toggleDarkMode: () => void;
}

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      currentColors: [],
      currentImagePreview: null,
      history: [],
      darkMode: false,

      setCurrentColors: (colors) => set({ currentColors: colors }),

      setCurrentImagePreview: (preview) =>
        set({ currentImagePreview: preview }),

      savePalette: (name) => {
        const { currentColors, currentImagePreview, history } = get();
        if (currentColors.length === 0) return;

        const newPalette: SavedPalette = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          name,
          colors: currentColors,
          createdAt: Date.now(),
          imagePreview: currentImagePreview ?? undefined,
        };

        // Keep last 10
        const updated = [newPalette, ...history].slice(0, 10);
        set({ history: updated });
      },

      deletePalette: (id) =>
        set((s) => ({ history: s.history.filter((p) => p.id !== id) })),

      loadPalette: (palette) =>
        set({
          currentColors: palette.colors,
          currentImagePreview: palette.imagePreview ?? null,
        }),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    {
      name: "snappalette-storage",
    }
  )
);
