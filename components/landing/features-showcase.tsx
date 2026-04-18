"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Calculator,
  ShieldAlert,
  FileText,
  History,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { ScheduleMockup } from "@/components/landing/feature-mockups/schedule-mockup";
import { PaymentMockup } from "@/components/landing/feature-mockups/payment-mockup";
import { AbsenceMockup } from "@/components/landing/feature-mockups/absence-mockup";
import { ReportMockup } from "@/components/landing/feature-mockups/report-mockup";
import { HistoryMockup } from "@/components/landing/feature-mockups/history-mockup";

const featureKeys = [
  "schedule",
  "payment",
  "absence",
  "reports",
  "history",
] as const;

const featureIcons = [CalendarDays, Calculator, ShieldAlert, FileText, History];

const AUTO_PLAY_INTERVAL = 5000;
const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeaturesShowcase() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % featureKeys.length) + featureKeys.length) % featureKeys.length;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const diff =
      (index - currentIndex + featureKeys.length) % featureKeys.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = featureKeys.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  const mockupComponents = [
    <ScheduleMockup key="schedule" />,
    <PaymentMockup key="payment" />,
    <AbsenceMockup key="absence" />,
    <ReportMockup key="report" />,
    <HistoryMockup key="history" />,
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-[#F8FAF9]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-6xl px-4 md:px-6"
      >
        {/* Headline + Subheadline */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111827]">
            {t("features.title")}
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto mt-4">
            {t("features.subheadline")}
          </p>
        </div>

        {/* ======= MOBILE LAYOUT ======= */}
        <div className="md:hidden">
          {/* Horizontal pills */}
          <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide">
            {featureKeys.map((key, i) => {
              const Icon = featureIcons[i];
              const isActive = currentIndex === i;
              return (
                <button
                  key={key}
                  onClick={() => handleChipClick(i)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border",
                    isActive
                      ? "bg-[#1B6545] text-white border-[#1B6545]"
                      : "bg-white border-gray-200 text-[#6B7280]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`features.${key}.title`)}
                </button>
              );
            })}
          </div>

          {/* Mobile mockup card */}
          <div className="rounded-2xl border border-[#1B6545]/20 bg-[#0F3D28] p-4 shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-xl bg-white p-4"
              >
                {mockupComponents[currentIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed mt-4">
            {t(`features.${featureKeys[currentIndex]}.desc`)}
          </p>
        </div>

        {/* ======= DESKTOP CAROUSEL LAYOUT ======= */}
        <div className="hidden md:block">
          <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] flex flex-col lg:flex-row min-h-[580px] border border-[#1B6545]/15 shadow-xl">
            {/* LEFT PANEL — lighter green with chip selector */}
            <div className="w-full lg:w-[38%] min-h-[350px] lg:h-auto relative z-30 flex flex-col items-start justify-center overflow-hidden px-10 lg:pl-12 bg-[#4DAE89]">
              {/* Top/bottom fade gradients */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#4DAE89] via-[#4DAE89]/80 to-transparent z-40 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#4DAE89] via-[#4DAE89]/80 to-transparent z-40 pointer-events-none" />

              <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20 min-h-[350px]">
                {featureKeys.map((key, index) => {
                  const Icon = featureIcons[index];
                  const isActive = index === currentIndex;
                  const distance = index - currentIndex;
                  const wrappedDistance = wrap(
                    -(featureKeys.length / 2),
                    featureKeys.length / 2,
                    distance
                  );

                  return (
                    <motion.div
                      key={key}
                      style={{
                        height: ITEM_HEIGHT,
                        width: "fit-content",
                      }}
                      animate={{
                        y: wrappedDistance * ITEM_HEIGHT,
                        opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 90,
                        damping: 22,
                        mass: 1,
                      }}
                      className="absolute flex items-center justify-start"
                    >
                      <button
                        onClick={() => handleChipClick(index)}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        className={cn(
                          "relative flex items-center gap-4 px-8 py-4 rounded-full transition-all duration-700 text-left group border",
                          isActive
                            ? "bg-white text-[#1B6545] border-white z-10 shadow-lg"
                            : "bg-transparent text-white/70 border-white/20 hover:border-white/40 hover:text-white"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] transition-colors duration-500 shrink-0",
                            isActive ? "text-[#1B6545]" : "text-white/50"
                          )}
                        />
                        <span className="font-medium text-[14px] tracking-tight whitespace-nowrap">
                          {t(`features.${key}.title`)}
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL — darker green with mockup cards */}
            <div className="flex-1 min-h-[500px] lg:h-auto relative bg-[#0F3D28] flex items-center justify-center py-16 lg:py-10 px-8 lg:px-10 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#1B6545]/20">
              {/* Subtle glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full opacity-[0.08]"
                  style={{
                    background:
                      "radial-gradient(ellipse, #4DAE89 0%, transparent 70%)",
                  }}
                />
              </div>

              <div className="relative w-full max-w-[500px] min-h-[460px] flex items-center justify-center">
                {featureKeys.map((key, index) => {
                  const status = getCardStatus(index);
                  const isActive = status === "active";
                  const isPrev = status === "prev";
                  const isNext = status === "next";

                  return (
                    <motion.div
                      key={key}
                      initial={false}
                      animate={{
                        x: isActive ? 0 : isPrev ? -80 : isNext ? 80 : 0,
                        scale: isActive ? 1 : isPrev || isNext ? 0.88 : 0.75,
                        opacity: isActive ? 1 : isPrev || isNext ? 0.3 : 0,
                        rotate: isPrev ? -2 : isNext ? 2 : 0,
                        zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                        mass: 0.8,
                      }}
                      className="absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-2xl"
                      style={{
                        pointerEvents: isActive ? "auto" : "none",
                      }}
                    >
                      <div className="h-full w-full p-5 overflow-y-auto">
                        {mockupComponents[index]}
                      </div>

                      {/* Active indicator badge */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-4 right-4 flex items-center gap-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#4DAE89] shadow-[0_0_8px_#4DAE89]" />
                            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#6B7280]">
                              {index + 1}/{featureKeys.length}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
