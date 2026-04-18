"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { BrazilFlag, UKFlag } from "@/components/ui/flag-icons";

interface LanguageToggleProps {
  language: "pt" | "en";
  onChangeLanguage: (lang: "pt" | "en") => void;
  /** Height of the outer container */
  size?: "sm" | "md";
}

export function LanguageToggle({ language, onChangeLanguage, size = "md" }: LanguageToggleProps) {
  const isMd = size === "md";
  const containerW = isMd ? 140 : 120;
  const pillW = isMd ? 66 : 56;
  const h = isMd ? 34 : 30;
  const pillH = h - 4;
  const maxX = containerW - pillW - 4; // 4 = 2px padding each side

  const x = useMotionValue(language === "pt" ? 0 : maxX);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Spring snap to nearest side
  const snapTo = useCallback(
    (lang: "pt" | "en") => {
      const target = lang === "pt" ? 0 : maxX;
      animate(x, target, { type: "spring", stiffness: 500, damping: 35 });
      onChangeLanguage(lang);
    },
    [x, maxX, onChangeLanguage]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const currentX = x.get();
      const mid = maxX / 2;
      // Also consider velocity for a flick gesture
      if (info.velocity.x > 200) {
        snapTo("en");
      } else if (info.velocity.x < -200) {
        snapTo("pt");
      } else {
        snapTo(currentX > mid ? "en" : "pt");
      }
    },
    [x, maxX, snapTo]
  );

  const handleClick = useCallback(
    (lang: "pt" | "en") => {
      if (isDragging) return;
      snapTo(lang);
    },
    [isDragging, snapTo]
  );

  // Sync x when language changes externally
  const prevLang = useRef(language);
  if (prevLang.current !== language) {
    prevLang.current = language;
    const target = language === "pt" ? 0 : maxX;
    animate(x, target, { type: "spring", stiffness: 500, damping: 35 });
  }

  // Opacity for labels based on pill position
  const ptOpacity = useTransform(x, [0, maxX], [1, 0.4]);
  const enOpacity = useTransform(x, [0, maxX], [0.4, 1]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full shrink-0 select-none"
      style={{ width: containerW, height: h, padding: 2 }}
    >
      {/* Draggable pill */}
      <motion.div
        className="absolute rounded-full bg-white dark:bg-gray-600 shadow-sm cursor-grab active:cursor-grabbing"
        style={{
          width: pillW,
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

      {/* PT button */}
      <motion.button
        onClick={() => handleClick("pt")}
        className="relative z-10 flex items-center justify-center gap-1.5 rounded-full font-medium text-gray-700 dark:text-gray-200 transition-colors"
        style={{
          width: pillW,
          height: pillH,
          fontSize: isMd ? 12 : 11,
          opacity: ptOpacity,
        }}
      >
        <BrazilFlag className={isMd ? "w-4 h-3 rounded-[2px]" : "w-3.5 h-2.5 rounded-[1px]"} />
        <span>PT</span>
      </motion.button>

      {/* EN button */}
      <motion.button
        onClick={() => handleClick("en")}
        className="relative z-10 flex items-center justify-center gap-1.5 rounded-full font-medium text-gray-700 dark:text-gray-200 transition-colors"
        style={{
          width: pillW,
          height: pillH,
          fontSize: isMd ? 12 : 11,
          opacity: enOpacity,
        }}
      >
        <UKFlag className={isMd ? "w-4 h-3 rounded-[2px]" : "w-3.5 h-2.5 rounded-[1px]"} />
        <span>EN</span>
      </motion.button>
    </div>
  );
}
