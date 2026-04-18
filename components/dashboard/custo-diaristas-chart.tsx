"use client";

import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { getAvatarColor } from "@/lib/avatar-color";

interface CustoDiarista {
  nome: string;
  iniciais: string;
  cor: string;
  custo: number;
  horasExtras: number;
}

export function CustoDiaristasChart({ data }: { data: CustoDiarista[] }) {
  const { language } = useLanguage();
  const { format } = useCurrency();

  if (data.length === 0) {
    return (
      <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {language === "pt" ? "Custo por colaboradora" : "Cost per cleaner"}
        </h3>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-lg">💰</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            {language === "pt" ? "Sem custos ainda" : "No costs yet"}
          </p>
          <p className="text-xs text-gray-400 max-w-[200px]">
            {language === "pt"
              ? "Quando os serviços da semana começarem, os custos por colaboradora aparecerão aqui."
              : "When the week's services begin, costs per cleaner will appear here."}
          </p>
        </div>
      </div>
    );
  }

  const maxCusto = Math.max(...data.map((d) => d.custo));

  return (
    <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        {language === "pt" ? "Custo por colaboradora" : "Cost per cleaner"}
      </h3>
      <div className="space-y-3">
        {data.map((d) => {
          const hasOvertime = d.horasExtras > 0;
          const basePct = hasOvertime ? ((d.custo - d.horasExtras) / maxCusto) * 100 : (d.custo / maxCusto) * 100;
          const overtimePct = hasOvertime ? (d.horasExtras / maxCusto) * 100 : 0;
          const avatarColor = getAvatarColor(d.nome);
          return (
            <div key={d.nome} className="flex items-center gap-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
              >
                {d.iniciais}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{d.nome.split(" ")[0]}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {format(d.custo)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
                  <div
                    className="h-full rounded-l-full bg-[#22C55E] transition-all"
                    style={{ width: `${basePct}%` }}
                  />
                  {hasOvertime && (
                    <div
                      className="h-full rounded-r-full bg-[#6366F1] transition-all"
                      style={{ width: `${overtimePct}%` }}
                    />
                  )}
                </div>
                {hasOvertime && (
                  <span className="text-[10px] text-[#6366F1] mt-0.5 inline-flex items-center gap-1">
                    +{format(d.horasExtras)} {language === "pt" ? "horas extras" : "overtime"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
