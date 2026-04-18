"use client";

import { Check, AlertTriangle, CalendarDays } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const cleaners = [
  { name: "Ana S.", color: "#1B6545", slots: [1, 1, 0, 1, 1] },
  { name: "Maria L.", color: "#4DAE89", slots: [1, 0, 1, 1, 2] },
  { name: "Julia R.", color: "#BA7517", slots: [0, 1, 1, 0, 1] },
  { name: "Carla M.", color: "#6366F1", slots: [1, 1, 1, 1, 0] },
  { name: "Luisa F.", color: "#E24B4A", slots: [1, 0, 1, 1, 1] },
];

export function ScheduleMockup() {
  const { language } = useLanguage();
  const days =
    language === "pt"
      ? ["Seg", "Ter", "Qua", "Qui", "Sex"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const scheduled = cleaners.reduce(
    (sum, c) => sum + c.slots.filter((s) => s === 1).length,
    0
  );
  const conflicts = cleaners.reduce(
    (sum, c) => sum + c.slots.filter((s) => s === 2).length,
    0
  );

  return (
    <div className="min-h-[400px] md:min-h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#1B6545]" />
          <span className="text-sm font-semibold text-[#111827]">
            {language === "pt" ? "Agenda Semanal" : "Weekly Schedule"} —{" "}
            {language === "pt" ? "Semana 14" : "Week 14"}
          </span>
        </div>
        <div className="flex gap-1">
          <button className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-[#6B7280] text-xs">
            ←
          </button>
          <button className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-[#6B7280] text-xs">
            →
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5 mb-2">
        <div />
        {days.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] md:text-xs font-semibold text-[#6B7280] uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 flex flex-col gap-1.5">
        {cleaners.map((cleaner) => (
          <div
            key={cleaner.name}
            className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: cleaner.color }}
              >
                {cleaner.name[0]}
              </div>
              <span className="text-xs md:text-sm font-medium text-[#111827] truncate">
                {cleaner.name}
              </span>
            </div>
            {cleaner.slots.map((cell, ci) => (
              <div
                key={ci}
                className={`h-9 md:h-10 rounded-md flex items-center justify-center ${
                  cell === 1
                    ? "bg-[#E6F4ED] border border-[#4DAE89]/30"
                    : cell === 2
                    ? "bg-[#FEF3C7] border border-[#F59E0B]/30"
                    : "bg-[#F8FAF9] border border-gray-100"
                }`}
              >
                {cell === 1 && <Check className="h-3.5 w-3.5 text-[#1B6545]" />}
                {cell === 2 && (
                  <AlertTriangle className="h-3 w-3 text-[#F59E0B]" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-[#1B6545]" />
          <span className="text-xs text-[#6B7280]">
            {scheduled} {language === "pt" ? "agendados" : "jobs scheduled"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />
          <span className="text-xs text-[#6B7280]">
            {conflicts} {language === "pt" ? "conflito" : "conflict"}
          </span>
        </div>
      </div>
    </div>
  );
}
