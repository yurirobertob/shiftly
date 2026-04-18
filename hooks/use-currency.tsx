"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Currency = "GBP" | "EUR" | "BRL" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (value: number) => string;
  symbol: string;
}

const symbols: Record<Currency, string> = {
  GBP: "£",
  EUR: "€",
  BRL: "R$",
  USD: "$",
};

// Approximate exchange rates from BRL base
const rates: Record<Currency, number> = {
  BRL: 1,
  GBP: 0.16,
  EUR: 0.18,
  USD: 0.18,
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("GBP");

  useEffect(() => {
    const saved = localStorage.getItem("shiftsly-currency") as Currency | null;
    if (saved && symbols[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem("shiftsly-currency", c);
  }

  function format(valueBRL: number): string {
    const converted = valueBRL * rates[currency];
    const sym = symbols[currency];

    if (currency === "BRL") {
      return `${sym} ${converted.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === "USD") {
      return `${sym} ${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${sym} ${converted.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, symbol: symbols[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
