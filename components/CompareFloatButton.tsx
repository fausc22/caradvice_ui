"use client";

import { useComparisonStore } from "@/store/useComparisonStore";
import { GitCompare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CompareFloatButton() {
  const selectedCount = useComparisonStore((state) => state.getSelectedCount());

  if (selectedCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      >
        <Link
          href="/comparar"
          className="flex items-center gap-2 sm:gap-3 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 sm:px-6 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          <GitCompare size={18} className="sm:w-5 sm:h-5" />
          <span className="font-antenna text-sm sm:text-base lg:text-lg whitespace-nowrap">
            Comparar ({selectedCount})
          </span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

