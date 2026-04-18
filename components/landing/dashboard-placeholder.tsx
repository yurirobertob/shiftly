"use client";

import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  Check,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const kpiCards = [
  {
    icon: Users,
    labelKey: "cleanersToday" as const,
    value: "6/8",
    color: "#4DAE89",
    bg: "rgba(77, 174, 137, 0.15)",
  },
  {
    icon: CalendarCheck,
    labelKey: "servicesToday" as const,
    value: "12",
    color: "#4DAE89",
    bg: "rgba(77, 174, 137, 0.15)",
  },
  {
    icon: AlertTriangle,
    labelKey: "alerts" as const,
    value: "1",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: TrendingUp,
    labelKey: "weekCost" as const,
    value: "£ 840",
    color: "#4DAE89",
    bg: "rgba(77, 174, 137, 0.15)",
  },
];

const scheduleData = [
  { name: "Ana", avatar: "#1B6545", slots: [1, 1, 0, 1, 1] },
  { name: "Maria", avatar: "#4DAE89", slots: [1, 0, 1, 0, 1] },
  { name: "Julia", avatar: "#BA7517", slots: [0, 1, 1, 2, 0] },
  { name: "Sofia", avatar: "#6366F1", slots: [1, 1, 1, 0, 1] },
];

const kpiLabels: Record<string, { en: string; pt: string }> = {
  cleanersToday: { en: "Cleaners today", pt: "Cleaners hoje" },
  servicesToday: { en: "Services today", pt: "Serviços hoje" },
  alerts: { en: "Alerts", pt: "Alertas" },
  weekCost: { en: "Week cost", pt: "Custo semanal" },
};

export function DashboardPlaceholder() {
  const { language } = useLanguage();
  const days =
    language === "pt"
      ? ["Seg", "Ter", "Qua", "Qui", "Sex"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const activityItems =
    language === "pt"
      ? [
          { text: "Ana confirmou · Casa Ramos", time: "2 min", icon: Check, color: "#4DAE89" },
          { text: "Maria faltou · 2 serviços", time: "15 min", icon: AlertTriangle, color: "#F59E0B" },
          { text: "Sofia a caminho · Baker St", time: "30 min", icon: Clock, color: "#6366F1" },
        ]
      : [
          { text: "Ana confirmed · Casa Ramos", time: "2 min", icon: Check, color: "#4DAE89" },
          { text: "Maria called in sick · 2 jobs", time: "15 min", icon: AlertTriangle, color: "#F59E0B" },
          { text: "Sofia en route · Baker St", time: "30 min", icon: Clock, color: "#6366F1" },
        ];

  return (
    <div className="h-full w-full flex flex-col gap-3 md:gap-4 p-2 md:p-0 text-white/90 select-none pointer-events-none">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.labelKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
            className="rounded-xl border border-white/10 bg-white/5 p-3 md:p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: kpi.bg }}
              >
                <kpi.icon className="h-3.5 w-3.5" style={{ color: kpi.color }} />
              </div>
              <span className="text-[10px] md:text-xs text-white/50 font-medium">
                {kpiLabels[kpi.labelKey]?.[language] ?? kpi.labelKey}
              </span>
            </div>
            <p className="text-lg md:text-xl font-bold text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main content: schedule + activity */}
      <div className="flex-1 grid md:grid-cols-[1fr_280px] gap-3 min-h-0">
        {/* Schedule grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-3 md:p-4 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-[#4DAE89]" />
            <span className="text-xs font-semibold text-white/70">
              {language === "pt" ? "Agenda da semana" : "Weekly schedule"}
            </span>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-2">
            <div />
            {days.map((d) => (
              <div
                key={d}
                className="text-center text-[9px] md:text-[10px] font-semibold text-white/40 uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Rows */}
          {scheduleData.map((cleaner, ri) => (
            <div
              key={cleaner.name}
              className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1.5"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-5 w-5 md:h-6 md:w-6 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold text-white shrink-0"
                  style={{ backgroundColor: cleaner.avatar }}
                >
                  {cleaner.name[0]}
                </div>
                <span className="text-[10px] md:text-[11px] font-medium text-white/60 truncate">
                  {cleaner.name}
                </span>
              </div>
              {cleaner.slots.map((cell, ci) => (
                <div
                  key={ci}
                  className={`h-7 md:h-8 rounded-md flex items-center justify-center ${
                    cell === 1
                      ? "bg-[#4DAE89]/15 border border-[#4DAE89]/25"
                      : cell === 2
                      ? "bg-amber-500/15 border border-amber-500/25"
                      : "bg-white/5 border border-white/5"
                  }`}
                >
                  {cell === 1 && (
                    <Check className="h-3 w-3 text-[#4DAE89]" />
                  )}
                  {cell === 2 && (
                    <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="rounded-xl border border-white/10 bg-white/5 p-3 md:p-4 hidden md:flex flex-col"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-[#4DAE89] animate-pulse" />
            <span className="text-xs font-semibold text-white/70">
              {language === "pt" ? "Atividade recente" : "Recent activity"}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {activityItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.4 + i * 0.15 }}
                className="flex items-start gap-2.5"
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon
                    className="h-3 w-3"
                    style={{ color: item.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-[11px] text-white/70 leading-snug truncate">
                    {item.text}
                  </p>
                  <p className="text-[9px] text-white/30 mt-0.5">
                    {item.time} {language === "pt" ? "atrás" : "ago"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
