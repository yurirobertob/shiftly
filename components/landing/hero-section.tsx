"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DashboardPlaceholder } from "@/components/landing/dashboard-placeholder";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export function HeroSection() {
  const { t, language } = useLanguage();

  const seals = t("hero.seals") as string[];

  const sealIcons = [Shield, Zap, Clock];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle green glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-[0.07]"
        style={{
          width: 800,
          height: 600,
          background:
            "radial-gradient(ellipse, #1B6545 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <ContainerScroll
        titleComponent={
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center rounded-full bg-[#E6F4ED] px-4 py-1.5 text-xs font-medium text-[#1B6545] border border-[#1B6545]/10">
                {t("hero.badge")}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-gray-900 max-w-3xl"
            >
              {t("hero.headlinePart1")}{" "}
              <span className="text-[#1B6545]">
                {t("hero.headlineHighlight")}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg leading-relaxed text-gray-500 max-w-xl"
            >
              {t("hero.subheadline")}
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <Link
                href="/login"
                className="rounded-xl bg-[#1B6545] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#155236] transition-colors shadow-lg shadow-[#1B6545]/20"
              >
                {t("hero.ctaPrimary")}
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-gray-200 px-8 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("hero.ctaSecondary")}
              </a>
            </motion.div>

            {/* Microcopy */}
            <motion.p
              variants={fadeUp}
              className="text-sm text-gray-400"
            >
              {t("hero.microcopy")}
            </motion.p>

            {/* Trust seals */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-2"
            >
              {seals.map((seal, i) => {
                const Icon = sealIcons[i] || Shield;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-xs text-gray-400"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#4DAE89]" />
                    <span>{seal}</span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        }
      >
        <DashboardPlaceholder />
      </ContainerScroll>
    </section>
  );
}
