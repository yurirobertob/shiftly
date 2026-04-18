"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Shield, Zap, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DashboardPlaceholder } from "@/components/landing/dashboard-placeholder";

// Three.js aurora shader — loaded client-side only to avoid SSR on WebGL.
const AuroraFlowBg = dynamic(
  () => import("@/components/ui/aurora-flow-bg").then((m) => m.AuroraFlowBg),
  { ssr: false }
);

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
    <section
      className="relative overflow-hidden"
      style={{
        // Static fallback gradient — visible before the shader mounts
        // and behind the canvas on any transparent pixels.
        backgroundImage:
          "radial-gradient(circle farthest-corner at 10% 20%, rgba(50,172,109,1) 0%, rgba(209,251,155,1) 100.2%)",
      }}
    >
      {/* Animated aurora shader background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AuroraFlowBg />
      </div>

      <div className="relative z-10">
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
              <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-[#0F3F2A] border border-white/60 shadow-sm">
                {t("hero.badge")}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-[#0A2E1E] max-w-3xl [text-shadow:_0_2px_12px_rgba(255,255,255,0.35)]"
            >
              {t("hero.headlinePart1")}{" "}
              <span className="text-white animate-aurora-glow [text-shadow:_0_2px_20px_rgba(10,46,30,0.6)]">
                {t("hero.headlineHighlight")}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg leading-relaxed text-[#0A2E1E] max-w-xl font-medium [text-shadow:_0_1px_8px_rgba(255,255,255,0.4)]"
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
                className="rounded-xl bg-[#0F3F2A] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#0A2E1E] transition-colors shadow-lg shadow-[#0F3F2A]/30"
              >
                {t("hero.ctaPrimary")}
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl bg-white/90 backdrop-blur-sm border border-white px-8 py-3.5 text-sm font-semibold text-[#0F3F2A] hover:bg-white transition-colors shadow-sm"
              >
                {t("hero.ctaSecondary")}
              </a>
            </motion.div>

            {/* Microcopy */}
            <motion.p
              variants={fadeUp}
              className="text-sm text-[#0A2E1E] font-semibold [text-shadow:_0_1px_6px_rgba(255,255,255,0.45)]"
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
                    className="flex items-center gap-1.5 text-xs text-[#0A2E1E] font-semibold [text-shadow:_0_1px_6px_rgba(255,255,255,0.45)]"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#0A2E1E] drop-shadow-[0_1px_4px_rgba(255,255,255,0.5)]" />
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
      </div>
    </section>
  );
}
