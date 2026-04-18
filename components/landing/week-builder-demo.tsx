"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, ArrowRight, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

type CellState = 0 | 1 | 2; // 0=empty, 1=scheduled, 2=absence

interface Achievement {
  id: string;
  message: string;
  shown: boolean;
}

export function WeekBuilderDemo() {
  const { t, language } = useLanguage();
  const days = (t("weekBuilder.days") as unknown as string[]) || ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const cleanerNames = (t("weekBuilder.cleaners") as unknown as string[]) || ["Ana", "Maria", "Julia"];
  const cleanerColors = ["#1B6545", "#4DAE89", "#BA7517"];
  const ratePerDay = 60;

  const [grid, setGrid] = useState<CellState[][]>([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const totalScheduled = grid.flat().filter((c) => c === 1).length;
  const totalAbsences = grid.flat().filter((c) => c === 2).length;
  const weekCost = totalScheduled * ratePerDay;
  const totalCells = grid.length * grid[0].length;
  const filledCells = grid.flat().filter((c) => c !== 0).length;

  // Count full days (all cleaners scheduled for that day)
  const fullDays = days.filter((_, di) => grid.every((row) => row[di] === 1)).length;
  const completionPct = Math.round((totalScheduled / totalCells) * 100);

  const addAchievement = useCallback((id: string, message: string) => {
    setShownAchievements((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      setAchievements((a) => [...a, { id, message, shown: true }]);
      setTimeout(() => {
        setAchievements((a) => a.filter((x) => x.id !== id));
      }, 2500);
      return next;
    });
  }, []);

  const toggleCell = (row: number, col: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      const current = next[row][col];
      // Cycle: 0 → 1 → 2 → 0
      next[row][col] = ((current + 1) % 3) as CellState;
      return next;
    });
  };

  // Check achievements
  useEffect(() => {
    if (totalScheduled === 1) {
      addAchievement("first", t("weekBuilder.achieveFirst"));
    }
    // Check if Monday (index 0) is full
    if (grid.every((row) => row[0] === 1)) {
      addAchievement("fullMonday", t("weekBuilder.achieveFullDay"));
    }
    // Check complete
    if (totalScheduled === totalCells) {
      addAchievement("complete", t("weekBuilder.achieveComplete"));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [totalScheduled, grid, totalCells, addAchievement, t]);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("weekBuilder.title")}
          </h2>
          <p className="mt-3 text-base text-gray-600">
            {t("weekBuilder.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative mx-auto max-w-2xl"
        >
          {/* Achievement toasts */}
          <div className="fixed top-20 right-6 z-50 space-y-2">
            <AnimatePresence>
              {achievements.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 rounded-lg bg-[#1B6545] px-4 py-2.5 text-sm font-medium text-white shadow-lg"
                >
                  <Trophy className="h-4 w-4 text-amber-300" />
                  {a.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    x: Math.random() * 100 + "%",
                    y: -20,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: 0,
                    y: 400,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: ["#1B6545", "#4DAE89", "#BA7517", "#E6F4ED", "#0F3D28"][i % 5],
                  }}
                />
              ))}
            </div>
          )}

          {/* Main card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-[#1B6545]" />
              <span className="text-sm font-semibold text-gray-800">{t("weekBuilder.headerTitle")}</span>
            </div>

            {/* Cleaners */}
            <div className="flex items-center gap-3 mb-5">
              {cleanerNames.map((name: string, i: number) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: cleanerColors[i] }}
                  >
                    {name[0]}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{name}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="mb-5">
              {/* Day headers */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div />
                {days.map((d: string) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {cleanerNames.map((name: string, ri: number) => (
                <div key={name} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-600">{name}</span>
                  </div>
                  {days.map((_: string, ci: number) => {
                    const state = grid[ri][ci];
                    return (
                      <motion.button
                        key={ci}
                        onClick={() => toggleCell(ri, ci)}
                        whileTap={{ scale: 0.9 }}
                        className={`h-10 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                          state === 1
                            ? "bg-[#E6F4ED] border-[#4DAE89] shadow-sm"
                            : state === 2
                            ? "bg-amber-50 border-amber-300 shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {state === 1 && (
                            <motion.div
                              key="check"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="h-4 w-4 text-[#1B6545]" />
                            </motion.div>
                          )}
                          {state === 2 && (
                            <motion.div
                              key="alert"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                            >
                              <AlertTriangle className="h-4 w-4 text-[#BA7517]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Absence banner */}
            <AnimatePresence>
              {totalAbsences > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#BA7517]" />
                    <span className="text-xs font-medium text-[#BA7517]">
                      {totalAbsences} {t("weekBuilder.uncoveredAlert")}
                    </span>
                  </div>
                  <button className="text-xs font-semibold text-[#BA7517] hover:underline">
                    {t("weekBuilder.reassign")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <div className="rounded-xl bg-[#F8FAF9] border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{t("weekBuilder.weekTotal")}</span>
                <motion.span
                  key={weekCost}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-[#1B6545]"
                >
                  £ {weekCost}
                </motion.span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">{t("weekBuilder.weekCompletion")}</span>
                  <span className="text-xs font-semibold text-gray-700">{completionPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#1B6545]"
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="h-3.5 w-3.5 text-[#1B6545]" />
                {totalAbsences === 0 ? t("weekBuilder.noConflicts") : `${totalAbsences} ${t("weekBuilder.absence").toLowerCase()}`}
              </div>
            </div>

            {/* Perfect week message */}
            <AnimatePresence>
              {totalScheduled === totalCells && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-[#E6F4ED] border border-[#4DAE89]/30 p-4 text-center"
                >
                  <p className="text-sm font-semibold text-[#1B6545]">{t("weekBuilder.perfectWeek")}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <Link
              href="/login"
              className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#1B6545] px-6 py-3 text-sm font-semibold text-white hover:bg-[#155236] transition-colors w-full"
            >
              {t("weekBuilder.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
