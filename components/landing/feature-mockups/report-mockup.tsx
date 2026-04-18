"use client";

import { FileText, Download, Mail } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function ReportMockup() {
  const { language } = useLanguage();

  return (
    <div className="min-h-[400px] md:min-h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <FileText className="h-4 w-4 text-[#1B6545]" />
        <span className="text-sm font-semibold text-[#111827]">
          {language === "pt" ? "Relatório Semanal" : "Weekly Report"} —{" "}
          {language === "pt" ? "Semana 14" : "Week 14"}
        </span>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-lg border border-gray-200 p-5 md:p-6">
        {/* Logo */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[#1B6545] tracking-wide">
            SHIFTSLY
          </span>
          <span className="text-[10px] text-[#6B7280]">PDF</span>
        </div>

        <p className="text-xs text-[#6B7280] mb-5">
          {language === "pt"
            ? "Relatório Semanal · 31 Mar – 4 Abr, 2026"
            : "Weekly Report · Mar 31 – Apr 4, 2026"}
        </p>

        {/* Summary section */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#111827] uppercase mb-3">
            {language === "pt" ? "Resumo" : "Summary"}
          </p>
          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-xs text-[#6B7280]">
                {language === "pt" ? "Colaboradoras ativas" : "Active cleaners"}
              </span>
              <span className="text-xs font-semibold text-[#111827]">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#6B7280]">
                {language === "pt" ? "Serviços concluídos" : "Jobs completed"}
              </span>
              <span className="text-xs font-semibold text-[#111827]">22</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#6B7280]">
                {language === "pt" ? "Ausências" : "Absences"}
              </span>
              <span className="text-xs font-semibold text-[#111827]">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#6B7280]">
                {language === "pt" ? "Custo total" : "Total cost"}
              </span>
              <span className="text-xs font-bold text-[#1B6545]">£1,290</span>
            </div>
          </div>
        </div>

        {/* Attendance bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#111827]">
              {language === "pt" ? "Presença" : "Attendance"}
            </span>
            <span className="text-xs font-semibold text-[#1B6545]">92%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4DAE89] rounded-full"
              style={{ width: "92%" }}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          <Download className="h-3 w-3" />
          {language === "pt" ? "Baixar PDF" : "Download PDF"}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          <Mail className="h-3 w-3" />
          {language === "pt" ? "Enviar por email" : "Send via email"}
        </button>
      </div>
    </div>
  );
}
