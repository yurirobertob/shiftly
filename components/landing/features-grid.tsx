"use client";

import { motion } from "framer-motion";
import { CalendarDays, Calculator, Bell, Smartphone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function FeaturesGrid() {
  const { t } = useLanguage();

  const features = [
    { icon: CalendarDays, titleKey: "features.schedule.title", descKey: "features.schedule.desc" },
    { icon: Calculator, titleKey: "features.pay.title", descKey: "features.pay.desc" },
    { icon: Bell, titleKey: "features.alerts.title", descKey: "features.alerts.desc" },
    { icon: Smartphone, titleKey: "features.app.title", descKey: "features.app.desc" },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#F8FAF9]">
      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-3xl font-bold tracking-tight text-center text-gray-900 mb-16"
        >
          {t("features.title")}
        </motion.h2>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.15 } }}
                className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-md transition-shadow cursor-default"
              >
                <div className="h-12 w-12 rounded-xl bg-[#E6F4ED] flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-[#1B6545]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{t(feat.titleKey)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(feat.descKey)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
