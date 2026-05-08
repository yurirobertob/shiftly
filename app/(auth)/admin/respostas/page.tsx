"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";

interface UsabilityResponse {
  id: string;
  createdAt: string;
  name: string;
  experienceYears: string;
  currentTools: string[];
  currentToolsOther: string | null;
  completedWeek: string;
  weekBlocker: string | null;
  weekEasiest: string | null;
  weekHardest: string | null;
  quitMoment: string | null;
  exploredSections: string[];
  brokenFeature: string | null;
  missingFeature: string | null;
  dailyPainPoint: string | null;
  oneWordDescription: string | null;
  visualHelped: string;
  npsScore: number;
  npsReason: string | null;
  oneChange: string | null;
}

function npsColor(score: number): string {
  if (score <= 6) return "#EF4444";
  if (score <= 8) return "#F59E0B";
  return "#22C55E";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({ label, value }: { label: string; value: string | string[] | null | undefined }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <p className="mt-0.5 text-sm text-gray-800">
        {Array.isArray(value) ? value.join(", ") : value}
      </p>
    </div>
  );
}

function ResponseRow({ r }: { r: UsabilityResponse }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{r.name}</td>
        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.createdAt)}</td>
        <td className="px-4 py-3 text-center">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: npsColor(r.npsScore) }}
          >
            {r.npsScore}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-600">{r.experienceYears}</td>
        <td className="px-4 py-3 text-gray-600">{r.completedWeek === "yes" ? "Sim" : "Não"}</td>
        <td className="px-4 py-3 text-gray-600">{r.oneWordDescription ?? "—"}</td>
        <td className="px-4 py-3 text-gray-400">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>

      {open && (
        <tr className="bg-gray-50/70">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <DetailRow label="Ferramentas atuais" value={[...r.currentTools, ...(r.currentToolsOther ? [r.currentToolsOther] : [])]} />
              <DetailRow label="O que travou na semana" value={r.weekBlocker} />
              <DetailRow label="O que foi mais fácil" value={r.weekEasiest} />
              <DetailRow label="O que foi mais difícil" value={r.weekHardest} />
              <DetailRow label="Momento que quase desistiu" value={r.quitMoment} />
              <DetailRow label="Seções exploradas" value={r.exploredSections} />
              <DetailRow label="Funcionalidade quebrada" value={r.brokenFeature} />
              <DetailRow label="Funcionalidade que faltou" value={r.missingFeature} />
              <DetailRow label="Maior dor do dia a dia" value={r.dailyPainPoint} />
              <DetailRow label="Visualização ajudou?" value={r.visualHelped} />
              <DetailRow label="Motivo do NPS" value={r.npsReason} />
              <DetailRow label="Uma mudança" value={r.oneChange} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function RespostasPage() {
  const { data, isLoading, isError } = useQuery<UsabilityResponse[]>({
    queryKey: ["usability-responses"],
    queryFn: () => fetch("/api/usability").then((r) => r.json()),
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Respostas do teste de usabilidade</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `${data.length} resposta${data.length !== 1 ? "s" : ""} coletada${data.length !== 1 ? "s" : ""}` : "Carregando..."}
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">Erro ao carregar respostas.</p>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Nenhuma resposta ainda.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Data</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">NPS</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Experiência</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Completou semana</th>
                <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Uma palavra</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <ResponseRow key={r.id} r={r} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
