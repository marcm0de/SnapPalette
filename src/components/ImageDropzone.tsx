"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onImageSelected: (file: File) => void;
  preview: string | null;
}

export default function ImageDropzone({ onImageSelected, preview }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        onImageSelected(file);
      }
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed
          transition-all duration-300 overflow-hidden
          ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.02]"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${preview ? "p-2" : "p-12"}
        `}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded"
                className="max-h-64 rounded-xl object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-gray-400 dark:text-gray-500"
            >
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                {isDragging ? (
                  <ImageIcon className="h-8 w-8" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  Drop an image here or click to browse
                </p>
                <p className="mt-1 text-sm">PNG, JPG, WEBP supported</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
