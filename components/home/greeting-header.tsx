"use client";

import { useLanguage } from "@/hooks/use-language";

function getGreeting(lang: "pt" | "en"): string {
  const hour = new Date().getHours();
  if (lang === "pt") {
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date, lang: "pt" | "en"): string {
  if (lang === "pt") {
    const days = [
      "Domingo", "Segunda-feira", "Ter\u00e7a-feira", "Quarta-feira",
      "Quinta-feira", "Sexta-feira", "S\u00e1bado",
    ];
    const months = [
      "janeiro", "fevereiro", "mar\u00e7o", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  }
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

interface GreetingHeaderProps {
  userName: string;
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const { t, language } = useLanguage();
  const firstName = userName?.split(" ")[0] || (language === "pt" ? "Gestora" : "Manager");

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">
          {getGreeting(language)}, {firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('dashboard.home.greeting')}
        </p>
      </div>
      <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5">
        {formatDate(new Date(), language)}
      </span>
    </div>
  );
}
