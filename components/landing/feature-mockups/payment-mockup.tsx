"use client";

import { Calculator, Download, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const paymentData = [
  { name: "Ana S.", days: 4, rate: 65, total: 260 },
  { name: "Maria L.", days: 3, rate: 70, total: 210 },
  { name: "Julia R.", days: 4, rate: 65, total: 260 },
  { name: "Carla M.", days: 5, rate: 60, total: 300 },
  { name: "Luisa F.", days: 4, rate: 65, total: 260 },
];

export function PaymentMockup() {
  const { language } = useLanguage();
  const grandTotal = paymentData.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="min-h-[400px] md:min-h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="h-4 w-4 text-[#1B6545]" />
        <span className="text-sm font-semibold text-[#111827]">
          {language === "pt" ? "Resumo de Pagamento Semanal" : "Weekly Payment Summary"}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_60px_60px_80px] gap-2 pb-2 border-b border-gray-100 mb-1">
          <span className="text-[10px] md:text-xs uppercase font-semibold text-[#6B7280]">
            {language === "pt" ? "Colaboradora" : "Cleaner"}
          </span>
          <span className="text-[10px] md:text-xs uppercase font-semibold text-[#6B7280] text-center">
            {language === "pt" ? "Dias" : "Days"}
          </span>
          <span className="text-[10px] md:text-xs uppercase font-semibold text-[#6B7280] text-center">
            {language === "pt" ? "Diária" : "Rate"}
          </span>
          <span className="text-[10px] md:text-xs uppercase font-semibold text-[#6B7280] text-right">
            Total
          </span>
        </div>

        {/* Rows */}
        {paymentData.map((row, i) => (
          <div
            key={row.name}
            className={`grid grid-cols-[1fr_60px_60px_80px] gap-2 py-2.5 ${
              i % 2 === 0 ? "bg-[#F8FAF9]" : "bg-white"
            } rounded px-2`}
          >
            <span className="text-xs md:text-sm text-[#111827] font-medium">
              {row.name}
            </span>
            <span className="text-xs md:text-sm text-[#111827] text-center">
              {row.days}
            </span>
            <span className="text-xs md:text-sm text-[#6B7280] text-center">
              £{row.rate}
            </span>
            <span className="text-xs md:text-sm text-[#111827] font-semibold text-right">
              £{row.total}
            </span>
          </div>
        ))}

        {/* Total */}
        <div className="mt-4 bg-[#E6F4ED] rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#111827]">Total</span>
          <span className="text-lg font-bold text-[#1B6545]">
            £{grandTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          <Download className="h-3 w-3" />
          {language === "pt" ? "Exportar PDF" : "Export PDF"}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          <CheckCircle className="h-3 w-3" />
          {language === "pt" ? "Marcar como pago" : "Mark as paid"}
        </button>
      </div>
    </div>
  );
}
