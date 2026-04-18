"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

export function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-[#1B6545]">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t("finalCta.title")}
          </h2>
          <p className="mt-5 text-base text-white/70 leading-relaxed">
            {t("finalCta.subtitle")}
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-[#1B6545] hover:bg-gray-50 transition-colors shadow-sm"
          >
            {t("finalCta.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {t("finalCta.noCreditCard")}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {t("finalCta.quickSetup")}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {t("finalCta.freeTrial")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
