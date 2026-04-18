"use client";

import { useState, useMemo } from "react";

/** Get Monday of the current week as YYYY-MM-DD */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split("T")[0];
}

/** Navigate weeks: offset = -1 (prev), +1 (next) */
export function offsetWeek(weekStart: string, offset: number): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + offset * 7);
  return d.toISOString().split("T")[0];
}

/** Format week range for display */
export function formatWeekRange(weekStart: string, lang: "pt" | "en"): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const locale = lang === "pt" ? "pt-BR" : "en-GB";

  const startStr = start.toLocaleDateString(locale, opts);
  const endStr = end.toLocaleDateString(locale, { ...opts, year: "numeric" });

  return `${startStr} – ${endStr}`;
}

/** Get dates for each day of the week */
export function getWeekDates(weekStart: string): { date: string; dayOfWeek: number; dateObj: Date }[] {
  const monday = new Date(weekStart + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      dayOfWeek: i, // 0=Mon, 6=Sun
      dateObj: d,
    };
  });
}

export function useWeekNavigation(initial?: string) {
  const [weekStart, setWeekStart] = useState(initial ?? getCurrentWeekStart());

  const goBack = () => setWeekStart((w) => offsetWeek(w, -1));
  const goForward = () => setWeekStart((w) => offsetWeek(w, 1));
  const goToday = () => setWeekStart(getCurrentWeekStart());

  return { weekStart, setWeekStart, goBack, goForward, goToday };
}
