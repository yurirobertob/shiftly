"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export function ForWhoSection() {
  const { t } = useLanguage();
  const cards = t("forWho.cards") as unknown as string[];

  return (
    <section id="for-who" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-3xl font-bold tracking-tight text-center text-gray-900 mb-16"
        >
          {t("forWho.title")}
        </motion.h2>

        <div className="grid sm:grid-cols-2 gap-5">
          {(Array.isArray(cards) ? cards : []).map((card: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
              className="border-l-4 border-[#1B6545] rounded-r-xl bg-white p-6 shadow-sm hover:bg-[#E6F4ED] transition-colors duration-200 cursor-default"
            >
              <p className="text-sm text-gray-700 leading-relaxed">{card}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
