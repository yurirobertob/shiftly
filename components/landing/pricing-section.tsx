"use client";

import { useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Check, Lock, Loader2 } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { SparklesCore } from "@/components/ui/sparkles";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { cn } from "@/lib/utils";

/* ─── Animation variants ─── */
const revealVariants: Variants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.4,
      duration: 0.5,
    },
  }),
  hidden: {
    filter: "blur(10px)",
    y: -20,
    opacity: 0,
  },
};

/* ─── Toggle component ─── */
function PricingSwitch({
  isYearly,
  onToggle,
  monthlyLabel,
  yearlyLabel,
  saveBadge,
}: {
  isYearly: boolean;
  onToggle: () => void;
  monthlyLabel: string;
  yearlyLabel: string;
  saveBadge: string;
}) {
  return (
    <div className="relative mx-auto flex w-fit items-center rounded-full border border-[#1B6545]/30 bg-[#0F3D28]/80 p-1">
      <button
        onClick={() => !isYearly || onToggle()}
        className="relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors"
      >
        {!isYearly && (
          <motion.div
            layoutId="pricing-switch"
            className="absolute inset-0 rounded-full border-2 border-[#1B6545] bg-gradient-to-t from-[#1B6545] to-[#4DAE89] shadow-sm shadow-[#1B6545]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className={cn("relative z-10", !isYearly ? "text-white" : "text-white/50")}>
          {monthlyLabel}
        </span>
      </button>
      <button
        onClick={() => isYearly || onToggle()}
        className="relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors"
      >
        {isYearly && (
          <motion.div
            layoutId="pricing-switch"
            className="absolute inset-0 rounded-full border-2 border-[#1B6545] bg-gradient-to-t from-[#1B6545] to-[#4DAE89] shadow-sm shadow-[#1B6545]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className={cn("relative z-10 flex items-center gap-1.5", isYearly ? "text-white" : "text-white/50")}>
          {yearlyLabel}
          <span className="bg-[#E6F4ED] text-[#1B6545] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {saveBadge}
          </span>
        </span>
      </button>
    </div>
  );
}

/* ─── Main section ─── */
export function PricingSection() {
  const { t, language } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handlePlanClick = async (planKey: string) => {
    if (planKey === "basic") {
      router.push("/login");
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey,
          interval: isYearly ? "yearly" : "monthly",
        }),
      });
      if (res.status === 401) {
        router.push(`/login?plan=${planKey}&interval=${isYearly ? "yearly" : "monthly"}`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push(`/login?plan=${planKey}&interval=${isYearly ? "yearly" : "monthly"}`);
      }
    } catch {
      router.push(`/login?plan=${planKey}&interval=${isYearly ? "yearly" : "monthly"}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      key: "basic",
      name: t("pricing.basic.name") as string,
      description: t("pricing.basic.desc") as string,
      price: 0,
      yearlyPrice: 0,
      isFree: true,
      buttonText: t("pricing.basic.cta") as string,
      buttonVariant: "outline" as const,
      badge: null as string | null,
      popular: false,
      included: t("pricing.basic.included") as string[],
      excluded: t("pricing.basic.excluded") as string[],
      cardBg: "from-[#0F3D28] via-[#0F3D28]/90 to-[#0F3D28]",
      borderClass: "border-[#1B6545]/15",
      glow: "",
      zIndex: "z-10",
      animDelay: 2,
    },
    {
      key: "pro",
      name: t("pricing.pro.name") as string,
      description: t("pricing.pro.desc") as string,
      price: 39,
      yearlyPrice: 29,
      isFree: false,
      buttonText: t("pricing.pro.cta") as string,
      buttonVariant: "default" as const,
      badge: t("pricing.pro.badge") as string,
      popular: true,
      included: t("pricing.pro.included") as string[],
      excluded: null,
      cardBg: "from-[#0F3D28] via-[#1B6545]/30 to-[#0F3D28]",
      borderClass: "border-[#4DAE89]/40",
      glow: "shadow-[0px_-13px_300px_0px_#1B6545]",
      zIndex: "z-20",
      animDelay: 3,
    },
    {
      key: "plus",
      name: t("pricing.plus.name") as string,
      description: t("pricing.plus.desc") as string,
      price: 59,
      yearlyPrice: 44,
      isFree: false,
      buttonText: t("pricing.plus.cta") as string,
      buttonVariant: "outline" as const,
      badge: t("pricing.plus.badge") as string,
      popular: false,
      included: t("pricing.plus.included") as string[],
      excluded: null,
      cardBg: "from-[#0F3D28] via-[#0F3D28]/95 to-[#0F3D28]",
      borderClass: "border-white/15",
      glow: "shadow-[0px_-8px_150px_0px_rgba(255,255,255,0.08)]",
      zIndex: "z-[15]",
      animDelay: 4,
    },
  ];

  const perMonth = t("pricing.perMonth") as string;

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#0F3D28] py-20 lg:py-28"
    >
      {/* Sparkles background */}
      <div className="pointer-events-none absolute inset-0" style={{ maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)" }}>
        <SparklesCore
          id="pricing-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          speed={2}
          particleDensity={50}
          particleColor="#4DAE89"
          className="h-full w-full"
        />
      </div>

      {/* Ellipse glow behind */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
        style={{
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse, #1B6545 0%, transparent 70%)",
          filter: "blur(92px)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6" ref={timelineRef}>
        {/* Headline */}
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <VerticalCutReveal delay={0}>
              {t("pricing.title") as string}
            </VerticalCutReveal>
          </h2>
        </div>

        {/* Subheadline */}
        <TimelineContent
          animationNum={0}
          timelineRef={timelineRef}
          customVariants={revealVariants}
          className="mb-8 text-center"
        >
          <p className="text-base text-white/60 max-w-xl mx-auto">
            {t("pricing.subtitle") as string}
          </p>
        </TimelineContent>

        {/* Toggle */}
        <TimelineContent
          animationNum={1}
          timelineRef={timelineRef}
          customVariants={revealVariants}
          className="mb-10 flex justify-center"
        >
          <PricingSwitch
            isYearly={isYearly}
            onToggle={() => setIsYearly((v) => !v)}
            monthlyLabel={t("pricing.monthly") as string}
            yearlyLabel={t("pricing.annual") as string}
            saveBadge={t("pricing.save") as string}
          />
        </TimelineContent>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-4 py-2">
          {plans.map((plan, index) => (
            <TimelineContent
              key={plan.key}
              animationNum={plan.animDelay}
              timelineRef={timelineRef}
              customVariants={revealVariants}
              className={cn(
                // Mobile reordering: Pro first, Plus second, Basic last
                index === 0 && "order-3 md:order-1",
                index === 1 && "order-1 md:order-2",
                index === 2 && "order-2 md:order-3",
              )}
            >
              <motion.div
                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-gradient-to-b p-7",
                  plan.cardBg,
                  plan.borderClass,
                  plan.glow,
                  plan.zIndex,
                  plan.popular && "md:scale-[1.02]",
                  !plan.popular && !plan.isFree && "",
                  plan.isFree && "opacity-90",
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="mb-4">
                    {plan.popular ? (
                      <motion.span
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-block bg-[#4DAE89] text-white text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {plan.badge}
                      </motion.span>
                    ) : (
                      <span className="inline-block bg-white/10 text-white/80 text-xs font-medium px-3 py-1 rounded-full border border-white/20">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-white/50 mt-1">{plan.description}</p>

                {/* Price */}
                <div className="mt-5 mb-6">
                  {plan.isFree ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-white">
                        {t("pricing.basic.price") as string}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {isYearly && (
                        <span className="text-xl text-white/30 line-through">
                          £{plan.price}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-white">
                        £<NumberFlow
                          value={isYearly ? plan.yearlyPrice : plan.price}
                          transformTiming={{ duration: 400, easing: "ease-out" }}
                        />
                      </span>
                      <span className="text-white/50 text-sm">{perMonth}</span>
                      {isYearly && (
                        <span className="bg-[#E6F4ED] text-[#1B6545] text-xs font-semibold px-2 py-0.5 rounded-full">
                          {t("pricing.save") as string}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA button */}
                <div className="block mb-6">
                  {plan.popular ? (
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(27,101,69,0.4)" }}
                      onClick={() => handlePlanClick(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className="flex items-center justify-center rounded-xl bg-gradient-to-t from-[#1B6545] to-[#4DAE89] border border-[#4DAE89] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1B6545]/50 transition-all w-full disabled:opacity-70"
                    >
                      {loadingPlan === plan.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        plan.buttonText
                      )}
                    </motion.button>
                  ) : plan.key === "plus" ? (
                    <motion.button
                      whileHover={{ borderColor: "#4DAE89", transition: { duration: 0.2 } }}
                      onClick={() => handlePlanClick(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className="flex items-center justify-center rounded-xl bg-gradient-to-t from-white/5 to-white/15 border border-white/20 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-white/10 transition-all w-full disabled:opacity-70"
                    >
                      {loadingPlan === plan.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        plan.buttonText
                      )}
                    </motion.button>
                  ) : (
                    <button
                      onClick={() => handlePlanClick(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className="flex items-center justify-center rounded-xl bg-gradient-to-t from-[#0F3D28] to-[#1B6545]/60 border border-[#1B6545]/30 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:border-[#1B6545]/60 transition-all w-full disabled:opacity-70"
                    >
                      {loadingPlan === plan.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        plan.buttonText
                      )}
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 mb-5" />

                {/* Included features */}
                <ul className="space-y-3 flex-1">
                  {plan.included.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check className="h-4 w-4 text-[#4DAE89] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Excluded features (Basic only) */}
                {plan.excluded && plan.excluded.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {plan.excluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-white/25">
                        <Lock className="h-3.5 w-3.5 text-white/20 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </TimelineContent>
          ))}
        </div>

        {/* Footnote */}
        <TimelineContent
          animationNum={5}
          timelineRef={timelineRef}
          customVariants={revealVariants}
          className="mt-10"
        >
          <p className="text-sm text-white/40 text-center max-w-lg mx-auto">
            {t("pricing.note") as string}
          </p>
        </TimelineContent>
      </div>
    </section>
  );
}
