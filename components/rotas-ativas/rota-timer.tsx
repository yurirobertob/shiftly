"use client";

import { useState, useEffect, useRef } from "react";

export function useRotaTimer(inicioISO: string) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = new Date(inicioISO).getTime();

    const tick = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [inicioISO]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { elapsed, formatted };
}

export function RotaTimer({ inicioISO, isLate }: { inicioISO: string; isLate: boolean }) {
  const { formatted } = useRotaTimer(inicioISO);

  return (
    <span className={`text-xs font-mono font-bold tabular-nums ${isLate ? "text-[#E24B4A]" : "text-gray-700"}`}>
      {formatted}
    </span>
  );
}
