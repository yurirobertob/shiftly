"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning";
  action: string;
  onAction: () => void;
}

interface CriticalAlertsProps {
  alerts: AlertItem[];
  onViewAll: () => void;
}

export function CriticalAlerts({ alerts, onViewAll }: CriticalAlertsProps) {
  const { t } = useLanguage();
  const visibleAlerts = alerts.slice(0, 3);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{t('dashboard.home.criticalAlerts')}</h3>
        {alerts.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-xs text-[#1B6545] font-medium hover:underline"
          >
            {t('dashboard.home.viewAll')} →
          </button>
        )}
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-8 h-8 rounded-full bg-[#E6F4ED] flex items-center justify-center mb-2">
            <Check className="w-4 h-4 text-[#1B6545]" />
          </div>
          <p className="text-xs text-gray-400">{t('dashboard.home.noAlerts')}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0"
            >
              <div
                className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                  alert.severity === "critical" ? "bg-red-500" : "bg-amber-500"
                }`}
              />
              <div>
                <p className="text-xs font-medium text-gray-900">{alert.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                <button
                  onClick={alert.onAction}
                  className="text-xs text-[#1B6545] font-medium mt-1 hover:underline"
                >
                  {alert.action} →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
