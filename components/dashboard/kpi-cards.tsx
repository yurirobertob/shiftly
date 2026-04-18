"use client";

import { DollarSign, Clock, ClipboardList, AlertCircle, TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { StatusBadge } from "@/components/ui/status-badge";

interface KPIData {
  custoDaSemana: number; // raw BRL
  custoVariacao: number; // raw BRL delta
  horasRegistradas: string;
  servicosDescobertos: number;
  pendencias: number;
}

export function KPICards({ data }: { data: KPIData }) {
  const { language } = useLanguage();
  const { format, symbol } = useCurrency();

  const variacaoFormatted = format(Math.abs(data.custoVariacao));
  const variacaoPrefix = data.custoVariacao >= 0 ? "+" : "-";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr] gap-2 sm:gap-3">
      {/* Week cost */}
      <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <span className="text-[10px] sm:text-xs font-medium text-gray-500">
            {language === "pt" ? "Custo da semana" : "Week cost"}
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{format(data.custoDaSemana)}</p>
        <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400">
          <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="truncate">{variacaoPrefix}{variacaoFormatted} {language === "pt" ? "vs sem. passada" : "vs last week"}</span>
        </div>
      </div>

      {/* Hours */}
      <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <span className="text-[10px] sm:text-xs font-medium text-gray-500">
            {language === "pt" ? "Horas registradas" : "Hours logged"}
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{data.horasRegistradas}</p>
        <span className="mt-1.5 sm:mt-2 inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400">
          {language === "pt" ? "Esta semana" : "This week"}
        </span>
      </div>

      {/* Uncovered services */}
      <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <span className="text-[10px] sm:text-xs font-medium text-gray-500">
            {language === "pt" ? "Descobertos" : "Uncovered"}
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{data.servicosDescobertos}</p>
        {data.servicosDescobertos > 0 && (
          <StatusBadge status="incidente" size="xs" className="mt-1.5 sm:mt-2" customLabel={language === "pt" ? "Precisam de cleaner" : "Need a cleaner"} />
        )}
      </div>

      {/* Alerts */}
      <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <span className="text-[10px] sm:text-xs font-medium text-gray-500">
            {language === "pt" ? "Alertas" : "Alerts"}
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{data.pendencias}</p>
        {data.pendencias > 0 && (
          <StatusBadge status="incidente" size="xs" className="mt-1.5 sm:mt-2" customLabel={language === "pt" ? "Resolver hoje" : "Resolve today"} />
        )}
      </div>
    </div>
  );
}
