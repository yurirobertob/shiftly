"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Loader2, FileText, Calculator } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAvatarColor } from "@/lib/avatar-color";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ActiveWeek {
  id: string;
  weekStart: string;
  status: string;
}

interface Payment {
  id: string;
  cleanerId: string;
  cleanerName: string;
  cleanerAvatar?: string | null;
  totalHours: number;
  totalJobs: number;
  totalAbsences: number;
  totalAmount: number;
  status: string;
}

interface PaymentSummary {
  scheduleId: string;
  weekStart: string;
  payments: Payment[];
  grandTotal: number;
}

export default function FechamentoPage() {
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const { language } = useLanguage();
  const { format } = useCurrency();
  const queryClient = useQueryClient();

  // 1. Fetch active week
  const {
    data: activeWeekData,
    isLoading: isLoadingWeek,
    isError: isWeekError,
  } = useQuery({
    queryKey: ["schedule-weeks", "active"],
    queryFn: () =>
      api.get<ActiveWeek[]>("/schedule/weeks?status=ACTIVE&limit=1"),
  });

  const activeWeek = activeWeekData?.[0] ?? null;
  const scheduleId = activeWeek?.id;

  // 2. Fetch payments for active week
  const {
    data: paymentSummary,
    isLoading: isLoadingPayments,
  } = useQuery({
    queryKey: ["payments", scheduleId],
    queryFn: () => api.get<PaymentSummary>(`/payments/${scheduleId}`),
    enabled: !!scheduleId,
  });

  const payments = paymentSummary?.payments ?? [];
  const hasPayments = payments.length > 0;

  // 3. Generate payments mutation
  const generatePaymentsMutation = useMutation({
    mutationFn: () => api.post<PaymentSummary>(`/payments/${scheduleId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", scheduleId] });
      toast.success(
        language === "pt"
          ? "Pagamentos calculados com sucesso!"
          : "Payments calculated successfully!"
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // 4. Close week mutation
  const closeWeekMutation = useMutation({
    mutationFn: async () => {
      // a. Mark all confirmed cleaners as PAID
      const confirmedPayments = payments.filter((p) => confirmed.has(p.cleanerId));
      await Promise.all(
        confirmedPayments.map((p) =>
          api.put(`/payments/${scheduleId}/${p.cleanerId}`, { status: "PAID" })
        )
      );

      // b. Close the week
      await api.put(`/schedule/weeks/${activeWeek!.weekStart}`, {
        status: "CLOSED",
      });

      // c. Export CSV
      const blob = await api.post<Blob>(`/payments/export`, { scheduleId });
      return blob;
    },
    onSuccess: (blob) => {
      // d. Download the CSV
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fechamento-${activeWeek!.weekStart}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // e. Toast success
      toast.success(
        language === "pt"
          ? "Semana fechada com sucesso! Relatório gerado."
          : "Week closed successfully! Report generated."
      );

      queryClient.invalidateQueries({ queryKey: ["schedule-weeks"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const toggleConfirm = (id: string) => {
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allConfirmed = payments.length > 0 && payments.every((p) => confirmed.has(p.cleanerId));
  const isLoading = isLoadingWeek || isLoadingPayments;

  // Totals
  const totalHoras = payments.reduce((a, p) => a + p.totalHours, 0);
  const totalServicos = payments.reduce((a, p) => a + p.totalJobs, 0);
  const totalAusencias = payments.reduce((a, p) => a + p.totalAbsences, 0);
  const totalValor = payments.reduce((a, p) => a + p.totalAmount, 0);

  const formatWeekDate = (weekStart: string) =>
    new Date(weekStart).toLocaleDateString(
      language === "pt" ? "pt-BR" : "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );

  // Skeleton rows
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No active week
  if (!activeWeek || isWeekError) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            {language === "pt" ? "Fechamento da semana" : "Week closing"}
          </h1>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {language === "pt" ? "Voltar" : "Back"}
            </Button>
          </Link>
        </div>
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-500">
            {language === "pt"
              ? "Nenhuma semana ativa para fechar"
              : "No active week to close"}
          </p>
        </div>
      </div>
    );
  }

  // No payments yet — show generate button
  if (!hasPayments) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">
                {language === "pt" ? "Fechamento da semana" : "Week closing"}
              </h1>
              <Badge className="bg-[#F0FDF4] text-[#22C55E] border-0">
                {formatWeekDate(activeWeek.weekStart)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {language === "pt"
                ? "Confirme os valores antes de fechar"
                : "Confirm values before closing"}
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {language === "pt" ? "Voltar" : "Back"}
            </Button>
          </Link>
        </div>
        <div className="rounded-xl border bg-white p-12 text-center space-y-4">
          <p className="text-gray-500">
            {language === "pt"
              ? "Nenhum pagamento calculado para esta semana."
              : "No payments calculated for this week."}
          </p>
          <Button
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
            onClick={() => generatePaymentsMutation.mutate()}
            disabled={generatePaymentsMutation.isPending}
          >
            {generatePaymentsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "pt" ? "Calculando..." : "Calculating..."}
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                {language === "pt" ? "Calcular pagamentos" : "Calculate payments"}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Main table view
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">
              {language === "pt" ? "Fechamento da semana" : "Week closing"}
            </h1>
            <Badge className="bg-[#F0FDF4] text-[#22C55E] border-0">
              {formatWeekDate(activeWeek.weekStart)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {language === "pt"
              ? "Confirme os valores antes de fechar"
              : "Confirm values before closing"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {language === "pt" ? "Voltar" : "Back"}
            </Button>
          </Link>
          <Button
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
            size="sm"
            onClick={() => closeWeekMutation.mutate()}
            disabled={!allConfirmed || closeWeekMutation.isPending}
          >
            {closeWeekMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "pt" ? "Fechando..." : "Closing..."}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {language === "pt"
                  ? "Fechar semana e gerar relatório"
                  : "Close week and generate report"}
              </>
            )}
          </Button>
        </div>
      </div>

      {!allConfirmed && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-[#BA7517]">
          {language === "pt"
            ? `Confirme todas as diaristas antes de fechar a semana (${confirmed.size}/${payments.length} confirmadas)`
            : `Confirm all cleaners before closing the week (${confirmed.size}/${payments.length} confirmed)`}
        </div>
      )}

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">
                {language === "pt" ? "Diarista" : "Cleaner"}
              </th>
              <th className="text-center p-4 font-medium text-gray-500">
                {language === "pt" ? "Horas" : "Hours"}
              </th>
              <th className="text-center p-4 font-medium text-gray-500">
                {language === "pt" ? "Serviços" : "Services"}
              </th>
              <th className="text-center p-4 font-medium text-gray-500">
                {language === "pt" ? "Ausências" : "Absences"}
              </th>
              <th className="text-right p-4 font-medium text-gray-500">
                {language === "pt" ? "Valor total" : "Total value"}
              </th>
              <th className="text-center p-4 font-medium text-gray-500">
                {language === "pt" ? "Confirmar" : "Confirm"}
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const initials = p.cleanerName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <tr key={p.cleanerId} className="border-t hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      {p.cleanerAvatar ? (
                        <img
                          src={p.cleanerAvatar}
                          alt={p.cleanerName}
                          className="h-8 w-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: getAvatarColor(p.cleanerName).bg,
                            color: getAvatarColor(p.cleanerName).text,
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {p.cleanerName}
                      </span>
                    </div>
                  </td>
                  <td className="text-center p-4 text-gray-700">
                    {p.totalHours}h
                  </td>
                  <td className="text-center p-4 text-gray-700">
                    {p.totalJobs}
                  </td>
                  <td className="text-center p-4">
                    {p.totalAbsences > 0 ? (
                      <StatusBadge
                        status="ausente"
                        customLabel={String(p.totalAbsences)}
                        size="xs"
                      />
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="text-right p-4 font-semibold text-gray-900">
                    {format(p.totalAmount)}
                  </td>
                  <td className="text-center p-4">
                    <button
                      onClick={() => toggleConfirm(p.cleanerId)}
                      className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${
                        confirmed.has(p.cleanerId)
                          ? "bg-[#22C55E] border-[#22C55E] text-white"
                          : "border-gray-300 hover:border-[#22C55E]"
                      }`}
                    >
                      {confirmed.has(p.cleanerId) && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t bg-gray-50/50">
            <tr>
              <td className="p-4 font-semibold text-gray-900">
                {language === "pt" ? "Total da semana" : "Week total"}
              </td>
              <td className="text-center p-4 font-semibold text-gray-900">
                {totalHoras}h
              </td>
              <td className="text-center p-4 font-semibold text-gray-900">
                {totalServicos}
              </td>
              <td className="text-center p-4 font-semibold text-gray-900">
                {totalAusencias}
              </td>
              <td className="text-right p-4 font-semibold text-[#22C55E]">
                {format(totalValor)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        {language === "pt"
          ? "Ao fechar a semana, um relatório PDF será gerado automaticamente e os valores ficam bloqueados para edição."
          : "When you close the week, a PDF report will be automatically generated and values will be locked for editing."}
      </p>
    </div>
  );
}
