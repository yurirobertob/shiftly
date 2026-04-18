"use client";

import { motion } from "framer-motion";
import { UserPlus, CalendarDays, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

function StepCard({ icon, title, description, benefits }: StepCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[#E6F4ED] bg-white p-6 text-[#111827] transition-all duration-300 ease-in-out",
        "hover:scale-[1.03] hover:shadow-lg hover:border-[#4DAE89]/50 hover:bg-[#F8FAF9]"
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#E6F4ED] text-[#1B6545]">
        {icon}
      </div>
      {/* Title and Description */}
      <h3 className="mb-2 text-xl font-semibold text-[#111827]">{title}</h3>
      <p className="mb-6 text-[#6B7280] text-sm leading-relaxed">
        {description}
      </p>
      {/* Benefits List */}
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#1B6545]/15">
              <div className="h-2 w-2 rounded-full bg-[#1B6545]" />
            </div>
            <span className="text-sm text-[#6B7280]">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: t("howItWorks.step1Title") as string,
      desc: t("howItWorks.step1Desc") as string,
      benefits: (t("howItWorks.step1Benefits") as unknown as string[]) || [],
    },
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: t("howItWorks.step2Title") as string,
      desc: t("howItWorks.step2Desc") as string,
      benefits: (t("howItWorks.step2Benefits") as unknown as string[]) || [],
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: t("howItWorks.step3Title") as string,
      desc: t("howItWorks.step3Desc") as string,
      benefits: (t("howItWorks.step3Benefits") as unknown as string[]) || [],
    },
  ];

  return (
    <section id="how-it-works" className="w-full bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111827]">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-4 text-lg text-[#6B7280]">
            {t("howItWorks.subtitle")}
          </p>
        </motion.div>

        {/* Step Number Indicators with Connecting Line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative mx-auto mb-8 w-full max-w-4xl"
        >
          {/* Connecting line */}
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-0.5 w-[66.6667%] -translate-y-1/2 bg-[#E6F4ED]"
          />
          {/* Numbers */}
          <div className="relative grid grid-cols-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-full bg-[#E6F4ED] font-bold text-[#1B6545] ring-4 ring-white text-sm"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Steps Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <StepCard
                icon={step.icon}
                title={step.title}
                description={step.desc}
                benefits={step.benefits}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
