"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon, Link, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onImageSelected: (file: File) => void;
  preview: string | null;
  onUrlGenerate?: (file: File) => void;
}

export default function ImageDropzone({ onImageSelected, preview }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");

  const handleUrlGenerate = async () => {
    if (!imageUrl.trim()) return;
    setLoadingUrl(true);
    setUrlError("");

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("URL is not an image");
      const file = new File([blob], "url-image.jpg", { type: blob.type });
      onImageSelected(file);
      setShowUrlInput(false);
      setImageUrl("");
    } catch {
      // Try with a proxy approach — create an Image element
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Could not load image from URL"));
          img.src = imageUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/png")
        );
        const file = new File([blob], "url-image.png", { type: "image/png" });
        onImageSelected(file);
        setShowUrlInput(false);
        setImageUrl("");
      } catch {
        setUrlError("Could not load image. Try downloading it first.");
      }
    } finally {
      setLoadingUrl(false);
    }
  };

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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUrlInput(!showUrlInput);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Link className="h-3.5 w-3.5" />
                  Or paste an image URL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* URL Input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlGenerate()}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                autoFocus
              />
              <button
                onClick={handleUrlGenerate}
                disabled={loadingUrl || !imageUrl.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
              >
                {loadingUrl ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </button>
            </div>
            {urlError && (
              <p className="text-xs text-red-500 mt-1">{urlError}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
