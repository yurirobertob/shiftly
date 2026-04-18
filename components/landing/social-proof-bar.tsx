"use client";

import { Lock, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export function SocialProofBar() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#F8FAF9] py-12 border-y border-gray-100">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-base text-gray-600 leading-relaxed mb-8"
        >
          {t("socialProof.text")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="h-4 w-4 text-[#1B6545]" />
            <span>{t("socialProof.noCreditCard")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Zap className="h-4 w-4 text-[#1B6545]" />
            <span>{t("socialProof.quickSetup")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Check className="h-4 w-4 text-[#1B6545]" />
            <span>{t("socialProof.cancelAnytime")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
