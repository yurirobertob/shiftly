"use client";

import { RotaTimer } from "./rota-timer";
import { StatusBadge, type StatusType } from "@/components/ui/status-badge";
import { getAvatarColor } from "@/lib/avatar-color";

interface RotaAtiva {
  id: string;
  diarista: {
    nome: string;
    iniciais: string;
    corAvatar: string;
  };
  local: string;
  tipoServico: string;
  inicioISO: string;
  terminoPrevisoISO: string;
  status: "iniciando" | "em-servico" | "quase-no-fim" | "atrasada";
}

const statusLabels: Record<string, string> = {
  iniciando: "Iniciando",
  "em-servico": "Em servico",
  "quase-no-fim": "Quase no fim",
  atrasada: "Atrasada",
};

// Map rota statuses to StatusBadge types
const statusMap: Record<string, StatusType> = {
  iniciando: "iniciando",
  "em-servico": "em-servico",
  "quase-no-fim": "quase-no-fim",
  atrasada: "atrasado",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getProgress(inicioISO: string, terminoPrevisoISO: string): number {
  const start = new Date(inicioISO).getTime();
  const end = new Date(terminoPrevisoISO).getTime();
  const now = Date.now();
  const total = end - start;
  if (total <= 0) return 100;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function RotaCard({ rota }: { rota: RotaAtiva }) {
  const isLate = rota.status === "atrasada";
  const progress = isLate ? 100 : getProgress(rota.inicioISO, rota.terminoPrevisoISO);

  let barColor = "bg-[#1B9E60]";
  if (progress >= 90 && !isLate) barColor = "bg-[#BA7517]";
  if (isLate) barColor = "bg-[#E24B4A]";

  return (
    <div className="rounded-xl border bg-gray-50 p-3.5 space-y-2.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: getAvatarColor(rota.diarista.nome).bg, color: getAvatarColor(rota.diarista.nome).text }}
          >
            {rota.diarista.iniciais}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{rota.diarista.nome}</p>
            <p className="text-[11px] text-gray-500 truncate">
              {rota.local} · {rota.tipoServico}
            </p>
          </div>
        </div>
        <RotaTimer inicioISO={rota.inicioISO} isLate={isLate} />
      </div>

      {/* Status + times */}
      <div className="flex items-center justify-between">
        <StatusBadge
          status={statusMap[rota.status] || "em-servico"}
          customLabel={statusLabels[rota.status]}
          size="xs"
        />
        <div className="text-[11px] text-gray-400">
          Inicio {formatTime(rota.inicioISO)} · Termino prev. {formatTime(rota.terminoPrevisoISO)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
