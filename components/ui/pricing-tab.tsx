"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabProps { text: string; selected: boolean; setSelected: (text: string) => void; discount?: boolean; }

export function Tab({ text, selected, setSelected, discount = false }: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn("relative w-fit px-4 py-2 text-sm font-semibold capitalize", "text-foreground transition-colors", discount && "flex items-center justify-center gap-2.5")}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span layoutId="tab" transition={{ type: "spring", duration: 0.4 }} className="absolute inset-0 z-0 rounded-full bg-background shadow-sm" />
      )}
      {discount && (
        <span className={cn("relative z-10 inline-flex items-center rounded-full border-transparent bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700", selected && "bg-green-50")}>
          Economize 35%
        </span>
      )}
    </button>
  );
}
