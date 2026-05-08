"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function ObrigadaPage() {
  const discountCode = process.env.NEXT_PUBLIC_DISCOUNT_CODE || "BETA3MESES";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text manually
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#FAF9F6", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}
    >
      <div className="w-full max-w-lg text-center">
        <div className="text-6xl mb-6">🎉</div>

        <h1
          className="text-4xl text-[#2D2D2D] mb-5"
          style={{ fontFamily: "var(--font-dm-serif, DM Serif Display, serif)" }}
        >
          Você terminou!
        </h1>

        <p className="text-[16px] text-[#7A7A7A] leading-relaxed mb-4">
          Muito obrigada pela sua participação. Seu feedback é extremamente
          valioso para o desenvolvimento do Shiftly.
        </p>

        <p className="text-[16px] text-[#7A7A7A] leading-relaxed mb-8">
          Como prometido, aqui está seu código para{" "}
          <strong className="text-[#2D2D2D]">3 meses grátis do plano PRO</strong>:
        </p>

        {/* Discount code box */}
        <div className="bg-white rounded-3xl border-2 border-[#A8C5B5] p-8 mb-8 shadow-sm">
          <p
            className="text-3xl font-bold text-[#2D2D2D] tracking-[0.18em] mb-5"
            style={{ fontFamily: "var(--font-dm-serif, DM Serif Display, serif)" }}
          >
            {discountCode}
          </p>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#A8C5B5]/20 hover:bg-[#A8C5B5]/35 text-[#2D2D2D] text-[14px] font-medium transition-all duration-200 border border-[#A8C5B5]/40"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#A8C5B5]" />
            ) : (
              <Copy className="w-4 h-4 text-[#7A7A7A]" />
            )}
            {copied ? "Copiado!" : "Copiar código"}
          </button>
        </div>

        <p className="text-[14px] text-[#7A7A7A] leading-relaxed mb-2">
          Para usar, acesse as configurações da sua conta no Shiftly e insira o
          código no campo de desconto.
        </p>
        <p className="text-[14px] text-[#7A7A7A]">
          Qualquer dúvida, fale com a gente. 💚
        </p>
      </div>
    </div>
  );
}
