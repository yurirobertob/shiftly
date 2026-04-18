"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export type StatusType =
  | "concluido"
  | "incidente"
  | "pendente"
  | "atrasado"
  | "em-servico"
  | "a-caminho"
  | "descoberto"
  | "ausente"
  | "ativo"
  | "inativo"
  | "livre"
  | "ocupada"
  | "iniciando"
  | "quase-no-fim";

const STATUS_CONFIG: Record<
  StatusType,
  { bg: string; text: string; dot: string; label: { pt: string; en: string } }
> = {
  concluido: {
    bg: "bg-[#E6F4ED] dark:bg-emerald-900/30",
    text: "text-[#0F6E56] dark:text-emerald-300",
    dot: "bg-[#1B9E60] dark:bg-emerald-400",
    label: { pt: "Concluído", en: "Completed" },
  },
  incidente: {
    bg: "bg-[#FAEEDA] dark:bg-amber-900/30",
    text: "text-[#854F0B] dark:text-amber-300",
    dot: "bg-[#BA7517] dark:bg-amber-400",
    label: { pt: "Incidente", en: "Incident" },
  },
  pendente: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-300",
    dot: "bg-gray-400 dark:bg-gray-500",
    label: { pt: "Pendente", en: "Pending" },
  },
  atrasado: {
    bg: "bg-[#FCEBEB] dark:bg-red-900/30",
    text: "text-[#A32D2D] dark:text-red-300",
    dot: "bg-[#E24B4A] dark:bg-red-400",
    label: { pt: "Atrasado", en: "Late" },
  },
  "em-servico": {
    bg: "bg-[#E6F4ED] dark:bg-emerald-900/30",
    text: "text-[#0F6E56] dark:text-emerald-300",
    dot: "bg-[#1B9E60] dark:bg-emerald-400",
    label: { pt: "Em serviço", en: "In service" },
  },
  "a-caminho": {
    bg: "bg-[#FAEEDA] dark:bg-amber-900/30",
    text: "text-[#854F0B] dark:text-amber-300",
    dot: "bg-[#BA7517] dark:bg-amber-400",
    label: { pt: "A caminho", en: "On the way" },
  },
  descoberto: {
    bg: "bg-[#FCEBEB] dark:bg-red-900/30",
    text: "text-[#A32D2D] dark:text-red-300",
    dot: "bg-[#E24B4A] dark:bg-red-400",
    label: { pt: "Descoberto", en: "Uncovered" },
  },
  ausente: {
    bg: "bg-[#FAEEDA] dark:bg-amber-900/30",
    text: "text-[#854F0B] dark:text-amber-300",
    dot: "bg-[#BA7517] dark:bg-amber-400",
    label: { pt: "Ausente", en: "Absent" },
  },
  ativo: {
    bg: "bg-[#E6F4ED] dark:bg-emerald-900/30",
    text: "text-[#0F6E56] dark:text-emerald-300",
    dot: "bg-[#1B9E60] dark:bg-emerald-400",
    label: { pt: "Ativo", en: "Active" },
  },
  inativo: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-300",
    dot: "bg-gray-400 dark:bg-gray-500",
    label: { pt: "Inativo", en: "Inactive" },
  },
  livre: {
    bg: "bg-[#E6F4ED] dark:bg-emerald-900/30",
    text: "text-[#0F6E56] dark:text-emerald-300",
    dot: "bg-[#1B9E60] dark:bg-emerald-400",
    label: { pt: "Livre", en: "Available" },
  },
  ocupada: {
    bg: "bg-[#E6F4ED] dark:bg-emerald-900/30",
    text: "text-[#0F6E56] dark:text-emerald-300",
    dot: "bg-[#1B9E60] dark:bg-emerald-400",
    label: { pt: "Ocupada", en: "Busy" },
  },
  iniciando: {
    bg: "bg-[#EBF2FF] dark:bg-blue-900/30",
    text: "text-[#2463EB] dark:text-blue-300",
    dot: "bg-[#2463EB] dark:bg-blue-400",
    label: { pt: "Iniciando", en: "Starting" },
  },
  "quase-no-fim": {
    bg: "bg-[#FAEEDA] dark:bg-amber-900/30",
    text: "text-[#854F0B] dark:text-amber-300",
    dot: "bg-[#BA7517] dark:bg-amber-400",
    label: { pt: "Quase no fim", en: "Almost done" },
  },
};

export function StatusBadge({
  status,
  customLabel,
  size = "sm",
  className,
}: {
  status: StatusType;
  customLabel?: string;
  size?: "xs" | "sm";
  className?: string;
}) {
  const { language } = useLanguage();
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap",
        size === "xs"
          ? "text-[10px] px-2 py-0.5"
          : "text-xs px-2.5 py-1",
        config.bg,
        config.text,
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)}
      />
      {customLabel ?? config.label[language]}
    </span>
  );
}
