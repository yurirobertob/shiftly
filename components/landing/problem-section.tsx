"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function ProblemSection() {
  const { t } = useLanguage();
  const beforeItems = t("problem.before") as unknown as string[];
  const afterItems = t("problem.after") as unknown as string[];

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-2xl bg-[#FEF2F2] p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t("problem.beforeTitle")}</h3>
            <div className="space-y-3">
              {(Array.isArray(beforeItems) ? beforeItems : []).map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-200 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-2xl bg-[#E6F4ED] p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t("problem.afterTitle")}</h3>
            <div className="space-y-3">
              {(Array.isArray(afterItems) ? afterItems : []).map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#1B6545] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
