"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/use-language";

function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // For numeric values, animate counting
  const numericPart = parseInt(value);
  const isNumeric = !isNaN(numericPart) && value.match(/^\d/);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-5xl sm:text-6xl font-bold text-white"
    >
      {value}
    </motion.span>
  );
}

export function MetricsSection() {
  const { t } = useLanguage();

  const metrics = [
    { value: t("metrics.metric1Value"), desc: t("metrics.metric1Desc") },
    { value: t("metrics.metric2Value"), desc: t("metrics.metric2Desc") },
    { value: t("metrics.metric3Value"), desc: t("metrics.metric3Desc") },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#0F3D28]">
      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-3xl font-bold tracking-tight text-center text-white mb-16"
        >
          {t("metrics.title")}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true, margin: "-80px" }}
              className="text-center"
            >
              <AnimatedNumber value={m.value} />
              <p className="mt-4 text-sm text-white/70 leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
