"use client";

import { StatusBadge, type StatusType } from "@/components/ui/status-badge";
import { useLanguage } from "@/hooks/use-language";
import { getAvatarColor } from "@/lib/avatar-color";

interface DiaristaStatus {
  nome: string;
  iniciais: string;
  cor: string;
  tarefa: string;
  status: "livre" | "ocupada" | "a-caminho" | "ausente";
}

const statusLabels: Record<string, { pt: string; en: string }> = {
  livre: { pt: "Livre", en: "Free" },
  ocupada: { pt: "Ocupada", en: "Busy" },
  "a-caminho": { pt: "A caminho", en: "On the way" },
  ausente: { pt: "Ausente", en: "Absent" },
};

export function DiaristasHoje({ data }: { data: DiaristaStatus[] }) {
  const { language } = useLanguage();

  return (
    <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {language === "pt" ? "Colaboradoras hoje" : "Cleaners today"}
      </h3>
      <div className="space-y-2">
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="text-2xl mb-2">👥</span>
            <p className="text-sm font-medium text-gray-500">
              {language === "pt" ? "Nenhum serviço alocado hoje" : "No services allocated today"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {language === "pt" ? "Quando houver serviços, as colaboradoras aparecerão aqui." : "When there are services, cleaners will appear here."}
            </p>
          </div>
        )}
        {data.map((d) => {
          const avatarColor = getAvatarColor(d.nome);
          return (
            <div key={d.nome} className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
              >
                {d.iniciais}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{d.nome}</p>
                <p className="text-[11px] text-gray-500 truncate">{d.tarefa}</p>
              </div>
              <StatusBadge
                status={d.status as StatusType}
                customLabel={language === "pt" ? statusLabels[d.status].pt : statusLabels[d.status].en}
                size="xs"
                className="shrink-0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
