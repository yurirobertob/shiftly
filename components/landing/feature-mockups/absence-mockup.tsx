"use client";

import { AlertTriangle, Check, ChevronDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function AbsenceMockup() {
  const { language } = useLanguage();

  const uncoveredJobs = [
    { client: "Casa Ramos", time: "9h–12h" },
    { client: "Apt. Silva", time: "13h–16h" },
    { client: "Casa Oliveira", time: "16h–18h" },
  ];

  return (
    <div className="min-h-[400px] md:min-h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
        <span className="text-sm font-semibold text-[#111827]">
          {language === "pt" ? "Alerta de Ausência" : "Absence Alert"}
        </span>
      </div>

      {/* Alert card */}
      <div className="bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mt-1.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {language === "pt"
                ? "Maria L. faltou hoje"
                : "Maria L. called in sick"}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {language === "pt"
                ? "Sexta, 4 de Abril · 3 serviços descobertos"
                : "Friday, April 4 · 3 jobs uncovered"}
            </p>
          </div>
        </div>
      </div>

      {/* Uncovered jobs */}
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#6B7280] uppercase mb-3">
          {language === "pt" ? "Serviços descobertos:" : "Uncovered jobs:"}
        </p>

        <div className="space-y-0">
          {uncoveredJobs.map((job, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100"
            >
              <div>
                <span className="text-sm text-[#111827] font-medium">
                  {job.client}
                </span>
                <span className="text-xs text-[#6B7280] ml-2">{job.time}</span>
              </div>
              <button className="flex items-center gap-1 text-sm font-medium text-[#1B6545]">
                {language === "pt" ? "Reatribuir" : "Reassign"}
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Suggested cover */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase mb-3">
            {language === "pt" ? "Cobertura sugerida:" : "Suggested cover:"}
          </p>
          <div className="bg-[#E6F4ED] border border-[#4DAE89]/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-[#1B6545] flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#111827]">
                  {language === "pt"
                    ? "Ana S. está disponível na sexta"
                    : "Ana S. is available on Friday"}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {language === "pt"
                    ? "Atualmente: 3 serviços · Pode assumir mais 2"
                    : "Currently: 3 jobs · Can take 2 more"}
                </p>
                <button className="mt-3 flex items-center gap-1.5 bg-[#1B6545] text-white text-xs font-medium px-4 py-2 rounded-lg">
                  {language === "pt"
                    ? "Atribuir Ana a todos"
                    : "Assign Ana to all"}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
