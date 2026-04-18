"use client";

import { motion } from "framer-motion";
import { Calendar, UserPlus, Clock, BarChart3, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import type { LucideIcon } from "lucide-react";

interface Shortcut {
  label: string;
  sub: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  action: () => void;
}

export function QuickShortcuts() {
  const router = useRouter();
  const { t } = useLanguage();

  const shortcuts: Shortcut[] = [
    {
      label: t('dashboard.home.viewSchedule'),
      sub: t('dashboard.home.fullSchedule'),
      icon: Calendar,
      iconBg: "#E6F4ED",
      iconColor: "#1B6545",
      action: () => router.push("/dashboard"),
    },
    {
      label: t('dashboard.home.newCleaner'),
      sub: t('dashboard.home.register'),
      icon: UserPlus,
      iconBg: "#E6F4ED",
      iconColor: "#1B6545",
      action: () => router.push("/colaboradores"),
    },
    {
      label: t('dashboard.home.newService'),
      sub: t('dashboard.home.bookIt'),
      icon: Clock,
      iconBg: "#FAEEDA",
      iconColor: "#854F0B",
      action: () => router.push("/servicos"),
    },
    {
      label: t('dashboard.home.report'),
      sub: t('dashboard.home.currentWeek'),
      icon: BarChart3,
      iconBg: "#E6F4ED",
      iconColor: "#1B6545",
      action: () => router.push("/relatorios"),
    },
  ];

  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('dashboard.home.quickShortcuts')}</h3>
      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <motion.button
              key={shortcut.label}
              onClick={shortcut.action}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-3 p-3.5 bg-white hover:bg-gray-50 border border-border hover:border-gray-300 rounded-xl transition-all duration-150 cursor-pointer w-full text-left group"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: shortcut.iconBg }}
              >
                <Icon className="w-[18px] h-[18px]" style={{ color: shortcut.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-[#1B6545] transition-colors truncate">
                  {shortcut.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{shortcut.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-transparent group-hover:text-muted-foreground/50 ml-auto transition-all duration-150 shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
