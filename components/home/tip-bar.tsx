"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const tipsPt = [
  "Voc\u00ea pode arrastar diaristas entre dias na tela de Semana para reorganizar rapidamente.",
  "Use os filtros \"Com alertas\" e \"Com aus\u00eancia\" na grade para focar no que precisa de aten\u00e7\u00e3o.",
  "O relat\u00f3rio semanal pode ser exportado em PDF a qualquer momento \u2014 n\u00e3o precisa fechar a semana.",
  "Cada diarista v\u00ea apenas sua pr\u00f3pria agenda no app mobile \u2014 sem acesso aos dados das outras.",
  "Servi\u00e7os marcados como \"Airbnb\" t\u00eam adicional de fim de semana calculado automaticamente.",
];

const tipsEn = [
  "You can drag cleaners between days on the Week view to quickly reorganise.",
  "Use the \"With alerts\" and \"With absence\" filters on the grid to focus on what needs attention.",
  "The weekly report can be exported as PDF at any time \u2014 no need to close the week first.",
  "Each cleaner only sees her own schedule on the mobile app \u2014 no access to other cleaners\u2019 data.",
  "Services marked as \"Airbnb\" have the weekend surcharge calculated automatically.",
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function TipBar() {
  const [tipDismissed, setTipDismissed] = useState(false);
  const { t, language } = useLanguage();
  const tips = language === "pt" ? tipsPt : tipsEn;
  const currentTip = tips[getDayOfYear() % tips.length];

  if (tipDismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-[#E6F4ED] rounded-lg px-4 py-2.5 border-l-2 border-[#1B6545]">
      <div className="w-1.5 h-1.5 rounded-full bg-[#1B6545] shrink-0" />
      <p className="text-xs text-[#0F6E56] flex-1">{currentTip}</p>
      <button
        onClick={() => setTipDismissed(true)}
        className="p-0.5 rounded hover:bg-[#1B6545]/10 text-[#4DAE89] hover:text-[#1B6545] transition-colors"
        title={t('dashboard.home.tipDismiss')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
