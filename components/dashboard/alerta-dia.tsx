"use client";

import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface Absence {
  id: string;
  cleanerId: string;
  date: string;
  reason: string | null;
  jobsAffected: number;
  covered: boolean;
  cleaner: { id: string; name: string; avatarColor: string | null };
}

interface AlertaDiaProps {
  absences?: Absence[];
}

export function AlertaDia({ absences = [] }: AlertaDiaProps) {
  const { language } = useLanguage();

  // Only show uncovered absences
  const uncovered = absences.filter((a) => !a.covered);

  // Empty state — no alerts
  if (uncovered.length === 0) {
    return (
      <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {language === "pt" ? "Alerta do dia" : "Alert of the day"}
        </h3>
        <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-4 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-2">
            <CheckCircle2 className="h-5 w-5 text-[#15803D]" />
          </div>
          <p className="text-sm font-semibold text-[#15803D]">
            {language === "pt" ? "Tudo certo!" : "All clear!"}
          </p>
          <p className="text-xs text-[#15803D]/70 mt-0.5">
            {language === "pt"
              ? "Nenhum alerta pendente para hoje."
              : "No pending alerts for today."}
          </p>
        </div>
      </div>
    );
  }

  const main = uncovered[0];
  const remaining = uncovered.length - 1;

  return (
    <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {language === "pt" ? "Alerta do dia" : "Alert of the day"}
      </h3>
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-[#BA7517]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {main.cleaner.name} — {language === "pt" ? "Ausente" : "Absent"}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {main.reason
                ? main.reason
                : language === "pt"
                  ? "Sem motivo informado."
                  : "No reason provided."}
              {main.jobsAffected > 0 && (
                <>
                  {" "}
                  {language === "pt"
                    ? `${main.jobsAffected} ${main.jobsAffected === 1 ? "serviço precisa" : "serviços precisam"} de substituta hoje.`
                    : `${main.jobsAffected} ${main.jobsAffected === 1 ? "service needs" : "services need"} a replacement today.`}
                </>
              )}
            </p>
          </div>
        </div>
        <button className="mt-3 w-full rounded-lg bg-[#BA7517] px-3 py-2 text-xs font-semibold text-white hover:bg-[#a5690f] transition-colors flex items-center justify-center gap-1.5">
          {language === "pt" ? "Substituir colaboradora" : "Replace cleaner"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        {remaining > 0 && (
          <p className="text-[11px] text-gray-500 mt-2 text-center">
            + {remaining}{" "}
            {language === "pt"
              ? remaining === 1
                ? "outro alerta"
                : "outros alertas"
              : remaining === 1
                ? "other alert"
                : "other alerts"}
          </p>
        )}
      </div>
    </div>
  );
}
