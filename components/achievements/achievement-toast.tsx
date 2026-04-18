"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

interface AchievementToastData {
  id: string;
  title: string;
  xpReward: number;
}

let showToastFn: ((data: AchievementToastData) => void) | null = null;

/**
 * Call this from anywhere to trigger the achievement toast.
 * The AchievementToastProvider must be mounted in the layout.
 */
export function showAchievementToast(data: AchievementToastData) {
  showToastFn?.(data);
}

export function AchievementToastProvider() {
  const [toast, setToast] = useState<AchievementToastData | null>(null);

  const show = useCallback((data: AchievementToastData) => {
    setToast(data);
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => {
      showToastFn = null;
    };
  }, [show]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-center gap-3 bg-[#0F3D28] text-white rounded-xl px-4 py-3 shadow-lg min-w-[280px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B6545] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-[#FAC775]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Conquista desbloqueada!</p>
              <p className="text-xs text-[#4DAE89] mt-0.5">{toast.title}</p>
            </div>
            <span className="text-sm font-bold text-[#FAC775] shrink-0">
              +{toast.xpReward} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
