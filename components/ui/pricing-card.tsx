"use client";
import * as React from "react";
import { BadgeCheck, ArrowRight } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

export interface PricingTier {
  name: string;
  price: Record<string, number | string>;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  popular?: boolean;
}

interface PricingCardProps { tier: PricingTier; paymentFrequency: string; }

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const price = tier.price[paymentFrequency];
  const isPopular = tier.popular;
  return (
    <div className={cn(
      "group relative flex flex-col gap-8 overflow-hidden rounded-2xl border p-8 shadow-sm transition-all duration-300 cursor-pointer",
      "bg-card text-card-foreground border-gray-200",
      "hover:bg-[#2463EB] hover:border-[#2463EB] hover:shadow-2xl hover:shadow-[#2463EB]/25 hover:scale-[1.02]",
    )}>
      {isPopular && (
        <div className="absolute top-4 left-4 bg-[#2463EB] text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 tracking-wider uppercase group-hover:bg-white group-hover:text-[#2463EB] transition-colors duration-300">
          ⭐ Recomendado
        </div>
      )}
      <h2 className={cn(
        "flex items-center gap-3 text-xl font-semibold capitalize transition-colors duration-300 group-hover:text-white",
        isPopular && "mt-4"
      )}>
        {tier.name}
      </h2>
      <div className="relative h-12">
        {typeof price === "number" ? (
          <>
            <NumberFlow format={{ style: "currency", currency: "BRL", trailingZeroDisplay: "stripIfInteger" }} value={price} className="text-4xl font-bold transition-colors duration-300 group-hover:text-white" />
            <p className="-mt-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-blue-100">Por mês</p>
          </>
        ) : (
          <h1 className="text-4xl font-bold transition-colors duration-300 group-hover:text-white">{price}</h1>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-medium transition-colors duration-300 group-hover:text-white">{tier.description}</h3>
        <ul className="space-y-2.5">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-white/90">
              <BadgeCheck className="h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-white" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <button className="w-full inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 bg-[#2463EB] text-white group-hover:bg-white group-hover:text-[#2463EB] shadow-sm group-hover:shadow-md">
        {tier.cta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
}
