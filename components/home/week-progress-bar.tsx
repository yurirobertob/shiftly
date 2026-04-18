"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";

interface WeekProgressBarProps {
  weekRange: string;
  filledPct: number;
}

export function WeekProgressBar({ weekRange, filledPct }: WeekProgressBarProps) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 p-4 bg-white border border-gray-200 rounded-xl">
      {/* Left: week info */}
      <div className="shrink-0">
        <p className="text-sm font-medium text-gray-900">{t('dashboard.home.weekCurrent')} · {weekRange}</p>
        <p className="text-xs text-gray-400 mt-0.5">{t('dashboard.home.inProgress')}</p>
      </div>

      {/* Center: progress bar */}
      <div className="flex-1">
        <p className={`text-xs mb-1.5 font-medium ${
          filledPct === 100 ? "text-[#1B6545]" : "text-muted-foreground"
        }`}>
          {filledPct}% {t('dashboard.home.weekFilled')}
        </p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1B6545] rounded-full transition-all duration-500"
            style={{ width: `${filledPct}%` }}
          />
        </div>
      </div>

      {/* Right: CTA */}
      <button
        onClick={() => router.push("/dashboard")}
        className="bg-[#1B6545] hover:bg-[#155236] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
      >
        {t('dashboard.home.openSchedule')}
      </button>
    </div>
  );
}
