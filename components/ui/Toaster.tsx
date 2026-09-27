"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useUI } from "@/store/ui";

export function Toaster() {
  const toast = useUI((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => useUI.setState({ toast: null }), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex justify-center px-4 md:bottom-8" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="label flex items-center gap-3 border border-line-strong bg-coal/95 px-5 py-3 text-bone shadow-2xl"
          >
            <span className="h-1.5 w-1.5 bg-volt" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
