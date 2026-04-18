"use client";

import { History, AlertTriangle, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const topCleaners = [
  { name: "Ana S.", jobs: 48, pct: 100 },
  { name: "Carla M.", jobs: 41, pct: 85 },
  { name: "Julia R.", jobs: 38, pct: 79 },
];

const clientFrequency = [
  { name: "Casa Ramos", visits: 12, cost: 780 },
  { name: "Apt. Silva", visits: 8, cost: 520 },
  { name: "Casa Oliveira", visits: 6, cost: 390 },
];

const attendance = [
  { name: "Ana", rate: 98, warn: false },
  { name: "Carla", rate: 95, warn: false },
  { name: "Julia", rate: 92, warn: false },
  { name: "Maria", rate: 84, warn: true },
  { name: "Luisa", rate: 96, warn: false },
];

export function HistoryMockup() {
  const { language } = useLanguage();

  return (
    <div className="min-h-[400px] md:min-h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-[#1B6545]" />
        <span className="text-sm font-semibold text-[#111827]">
          {language === "pt" ? "Histórico e Insights" : "History & Insights"}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        <button className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#6B7280]">
          {language === "pt" ? "Todas colaboradoras" : "All cleaners"}
          <ChevronDown className="h-3 w-3" />
        </button>
        <button className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#6B7280]">
          {language === "pt" ? "Últimos 30 dias" : "Last 30 days"}
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {/* Top cleaners by jobs */}
        <div className="bg-[#F8FAF9] rounded-lg p-4">
          <p className="text-[10px] md:text-xs font-semibold text-[#6B7280] uppercase mb-3">
            {language === "pt"
              ? "Top colaboradoras por serviços"
              : "Top cleaners by jobs"}
          </p>
          <div className="space-y-2.5">
            {topCleaners.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280] w-3">{i + 1}.</span>
                <span className="text-xs md:text-sm font-medium text-[#111827] w-20 truncate">
                  {c.name}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4DAE89] rounded-full"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#111827] w-16 text-right">
                  {c.jobs} {language === "pt" ? "serv." : "jobs"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Client frequency */}
        <div className="bg-[#F8FAF9] rounded-lg p-4">
          <p className="text-[10px] md:text-xs font-semibold text-[#6B7280] uppercase mb-3">
            {language === "pt"
              ? "Frequência por cliente"
              : "Client frequency"}
          </p>
          <div className="space-y-2">
            {clientFrequency.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-[#111827]">
                  {c.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7280]">
                    {c.visits} {language === "pt" ? "visitas" : "visits"}
                  </span>
                  <span className="text-xs font-semibold text-[#1B6545]">
                    £{c.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance rate */}
        <div className="bg-[#F8FAF9] rounded-lg p-4">
          <p className="text-[10px] md:text-xs font-semibold text-[#6B7280] uppercase mb-3">
            {language === "pt" ? "Taxa de presença" : "Attendance rate"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {attendance.map((a) => (
              <span
                key={a.name}
                className={`text-xs ${
                  a.warn
                    ? "text-[#F59E0B] font-medium"
                    : "text-[#111827]"
                }`}
              >
                {a.name}: {a.rate}%
                {a.warn && (
                  <AlertTriangle className="inline h-3 w-3 ml-0.5 -mt-0.5" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
