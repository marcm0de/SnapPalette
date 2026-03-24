"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface ToastMessage {
  id: string;
  text: string;
}

let addToast: (text: string) => void = () => {};

export function toast(text: string) {
  addToast(text);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToast = (text: string) => {
      const id = Date.now().toString(36);
      setToasts((prev) => [...prev, { id, text }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2000);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-gray-100 px-4 py-2.5 text-sm text-white dark:text-gray-900 shadow-lg"
          >
            <Check className="h-4 w-4 text-green-400 dark:text-green-600" />
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
