"use client";

import { useCurrency, type Currency } from "@/hooks/use-currency";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";

const options: { value: Currency; label: string; flag: string }[] = [
  { value: "GBP", label: "£", flag: "🇬🇧" },
  { value: "EUR", label: "€", flag: "🇪🇺" },
  { value: "BRL", label: "R$", flag: "🇧🇷" },
];

export function CurrencySelector({ size = "md" }: { size?: "sm" | "md" }) {
  const { currency, setCurrency } = useCurrency();
  const isMd = size === "md";
  const itemW = isMd ? 46 : 40;
  const containerW = itemW * 3 + 4; // 3 items + 4px padding
  const h = isMd ? 34 : 30;
  const pillH = h - 4;

  const currentIdx = options.findIndex((o) => o.value === currency);
  const maxX = itemW * 2; // max translate for last item

  const x = useMotionValue(currentIdx * itemW);
  const [isDragging, setIsDragging] = useState(false);

  const snapTo = useCallback(
    (idx: number) => {
      const target = idx * itemW;
      animate(x, target, { type: "spring", stiffness: 500, damping: 35 });
      setCurrency(options[idx].value);
    },
    [x, itemW, setCurrency]
  );

  const handleDragEnd = useCallback(
    (_: any, info: any) => {
      setIsDragging(false);
      const currentX = x.get();
      // Find nearest slot
      let nearest = 0;
      let minDist = Infinity;
      for (let i = 0; i < 3; i++) {
        const dist = Math.abs(currentX - i * itemW);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
      // Also consider velocity
      if (info.velocity.x > 200 && nearest < 2) nearest++;
      if (info.velocity.x < -200 && nearest > 0) nearest--;
      snapTo(nearest);
    },
    [x, itemW, snapTo]
  );

  // Sync when currency changes externally
  const prevCurrency = useRef(currency);
  if (prevCurrency.current !== currency) {
    prevCurrency.current = currency;
    const idx = options.findIndex((o) => o.value === currency);
    animate(x, idx * itemW, { type: "spring", stiffness: 500, damping: 35 });
  }

  return (
    <div
      className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full shrink-0 select-none"
      style={{ width: containerW, height: h, padding: 2 }}
    >
      {/* Draggable pill */}
      <motion.div
        className="absolute rounded-full bg-white dark:bg-gray-600 shadow-sm cursor-grab active:cursor-grabbing"
        style={{
          width: itemW,
          height: pillH,
          top: 2,
          left: 2,
          x,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      />

      {options.map((opt, i) => {
        const isActive = currency === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => {
              if (!isDragging) snapTo(i);
            }}
            className={`relative z-10 flex items-center justify-center gap-1 rounded-full font-medium transition-colors ${
              isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
            }`}
            style={{
              width: itemW,
              height: pillH,
              fontSize: isMd ? 11 : 10,
            }}
          >
            <span style={{ fontSize: isMd ? 12 : 11 }}>{opt.flag}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
