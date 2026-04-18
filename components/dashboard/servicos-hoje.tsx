"use client";

import { Plus } from "lucide-react";
import { StatusBadge, type StatusType } from "@/components/ui/status-badge";
import { useLanguage } from "@/hooks/use-language";

interface ServicoHoje {
  id: string;
  cliente: string;
  diarista: string;
  horarioInicio: string;
  horarioFim: string;
  status: "concluido" | "em-servico" | "a-caminho" | "descoberto";
}

const statusLabelsMap: Record<string, { pt: string; en: string }> = {
  concluido: { pt: "Concluído", en: "Completed" },
  "em-servico": { pt: "Em serviço", en: "In service" },
  "a-caminho": { pt: "A caminho", en: "On the way" },
  descoberto: { pt: "Descoberto", en: "Uncovered" },
};

export function ServicosHoje({ data }: { data: ServicoHoje[] }) {
  const { language } = useLanguage();

  if (data.length === 0) {
    return (
      <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{language === "pt" ? "Serviços de hoje" : "Today's services"}</h3>
        </div>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-lg">📋</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            {language === "pt" ? "Dia livre!" : "Free day!"}
          </p>
          <p className="text-xs text-gray-400 max-w-[200px]">
            {language === "pt"
              ? "Nenhum serviço agendado para hoje. Aproveite para organizar a próxima semana."
              : "No services scheduled for today. Take the chance to organize next week."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{language === "pt" ? "Serviços de hoje" : "Today's services"}</h3>
        <button
          onClick={() => alert(language === "pt" ? "Em breve: adicionar novo serviço" : "Coming soon: add new service")}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {language === "pt" ? "Novo" : "New"}
        </button>
      </div>
      <div className="space-y-2">
        {data.slice(0, 5).map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{s.cliente}</p>
              <p className="text-[11px] text-gray-500 truncate">
                {s.diarista} · {s.horarioInicio}–{s.horarioFim}
              </p>
            </div>
            <StatusBadge
              status={s.status as StatusType}
              customLabel={statusLabelsMap[s.status]?.[language]}
              size="xs"
              className="shrink-0 ml-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
