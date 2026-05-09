import type { Metadata } from "next";
import { VsPlanilhaPage } from "@/components/landing/vs-planilha-page";

export const metadata: Metadata = {
  title: "Escala de limpeza: Shiftsly vs Planilha — pare de perder tempo no Excel",
  description:
    "Você usa planilha para escala de limpeza? Veja como o Shiftsly resolve o que o Excel nunca vai conseguir — 8 critérios comparados lado a lado.",
  keywords: [
    "escala de limpeza planilha",
    "substituir planilha escala limpeza",
    "software gestão equipe limpeza",
    "escala colaboradoras limpeza",
    "planilha diaristas",
  ],
  openGraph: {
    title: "Escala de limpeza: Shiftsly vs Planilha",
    description:
      "Chega de escala de limpeza por planilha. 8 critérios comparados honestamente — ausência, pagamento, mobile e mais.",
    url: "https://apporganizacao.vercel.app/vs/planilha",
    siteName: "Shiftsly",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escala de limpeza: Shiftsly vs Planilha",
    description:
      "Chega de escala de limpeza por planilha. 8 critérios comparados honestamente.",
  },
  alternates: {
    canonical: "https://apporganizacao.vercel.app/vs/planilha",
  },
};

export default function Page() {
  return <VsPlanilhaPage />;
}
