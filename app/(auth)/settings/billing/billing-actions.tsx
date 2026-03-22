"use client";

import { useState } from "react";

interface BillingActionsProps {
  subscribed: boolean;
  hasStripeCustomer: boolean;
}

export function BillingActions({ subscribed, hasStripeCustomer }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex gap-3">
      {!subscribed && (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="rounded-lg bg-[#2463EB] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1d4fc7] transition-colors disabled:opacity-50"
        >
          {loading ? "Processando..." : "Fazer upgrade para Pro"}
        </button>
      )}

      {hasStripeCustomer && (
        <button
          onClick={handlePortal}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? "Processando..." : "Gerenciar assinatura"}
        </button>
      )}
    </div>
  );
}
