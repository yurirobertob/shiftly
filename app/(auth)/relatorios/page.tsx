"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, DollarSign, AlertCircle, Download, Loader2, CheckCheck, Calculator } from "lucide-react";
import { useState } from "react";
import { getAvatarColor } from "@/lib/avatar-color";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { usePlan } from "@/hooks/use-plan";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UpgradePrompt } from "@/components/upgrade-prompt";

interface Week {
  id: string;
  weekStart: string;
  status: string;
  totalCost: number;
  totalJobs: number;
  totalAbsences: number;
}

interface PaymentCleaner {
  id: string;
  name: string;
  avatarColor?: string;
}

interface Payment {
  id: string;
  cleanerId: string;
  totalHours: number;
  totalJobs: number;
  totalAbsences: number;
  totalAmount: number;
  status: "PENDING" | "PAID";
  cleaner: PaymentCleaner;
}

interface PaymentSummary {
  scheduleId: string;
  weekStart: string;
  payments: Payment[];
  grandTotal: number;
}

function formatWeekRange(weekStart: string, language: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const locale = language === "pt" ? "pt-BR" : "en-GB";

  return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, { ...opts, year: "numeric" })}`;
}

export default function RelatoriosPage() {
  const { language } = useLanguage();
  const { format } = useCurrency();
  const { canExportReports, plan } = usePlan();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);

  // Fetch weeks
  const { data: weeks, isLoading: weeksLoading } = useQuery<Week[]>({
    queryKey: ["schedule-weeks"],
    queryFn: () => api.get<Week[]>("/schedule/weeks?limit=12"),
  });

  // Default to the most recent week once loaded
  const activeWeekId = selectedWeekId ?? weeks?.[0]?.id ?? null;

  // Fetch payment summary for the selected week
  const {
    data: paymentData,
    isLoading: paymentsLoading,
  } = useQuery<PaymentSummary>({
    queryKey: ["payments", activeWeekId],
    queryFn: () => api.get<PaymentSummary>(`/payments/${activeWeekId}`),
    enabled: !!activeWeekId,
  });

  // Generate payments mutation
  const generateMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      api.post<PaymentSummary>(`/payments/${scheduleId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", activeWeekId] });
      toast.success(
        language === "pt"
          ? "Pagamentos calculados com sucesso"
          : "Payments calculated successfully"
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Mark single payment as paid
  const markPaidMutation = useMutation({
    mutationFn: (cleanerId: string) =>
      api.put(`/payments/${activeWeekId}/${cleanerId}`, { status: "PAID" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", activeWeekId] });
      toast.success(
        language === "pt" ? "Marcado como pago" : "Marked as paid"
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Mark all as paid
  const markAllPaidMutation = useMutation({
    mutationFn: async () => {
      const pending =
        paymentData?.payments.filter((p) => p.status === "PENDING") ?? [];
      await Promise.all(
        pending.map((p) =>
          api.put(`/payments/${activeWeekId}/${p.cleanerId}`, {
            status: "PAID",
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", activeWeekId] });
      toast.success(
        language === "pt"
          ? "Todos marcados como pagos"
          : "All marked as paid"
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Export CSV
  const exportMutation = useMutation({
    mutationFn: () =>
      api.post<Blob>("/payments/export", { scheduleId: activeWeekId }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${activeWeekId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(
        language === "pt" ? "CSV exportado" : "CSV exported"
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const payments = paymentData?.payments ?? [];
  const hasPayments = payments.length > 0;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const totalHours = payments.reduce((s, p) => s + p.totalHours, 0);
  const grandTotal = paymentData?.grandTotal ?? 0;

  const isLoading = weeksLoading || paymentsLoading;

  const summaryCards = [
    {
      label: language === "pt" ? "Horas totais" : "Total hours",
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      iconBg: "bg-[#F0FDF4]",
      iconColor: "text-[#22C55E]",
    },
    {
      label: language === "pt" ? "Custo total" : "Total cost",
      value: format(grandTotal),
      icon: DollarSign,
      iconBg: "bg-[#F0FDF4]",
      iconColor: "text-[#22C55E]",
    },
    {
      label: language === "pt" ? "Pendentes" : "Pending",
      value: String(pendingCount),
      icon: AlertCircle,
      iconBg: "bg-[#F0FDF4]",
      iconColor: "text-[#22C55E]",
    },
  ];

  // Skeleton rows for loading state
  const SkeletonRow = () => (
    <tr className="border-b last:border-0 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="px-3 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
      <td className="px-3 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-12 mx-auto" /></td>
      <td className="px-3 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-16 mx-auto" /></td>
      <td className="px-3 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-16 mx-auto" /></td>
      <td className="px-3 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto" /></td>
    </tr>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">
              {language === "pt" ? "Relatórios" : "Reports"}
            </h1>
            <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
              {language === "pt" ? "Pagamentos" : "Payments"}
            </Badge>
          </div>
          {/* Week selector */}
          {weeks && weeks.length > 0 && (
            <select
              className="mt-2 text-sm text-gray-500 bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
              value={activeWeekId ?? ""}
              onChange={(e) => setSelectedWeekId(e.target.value)}
            >
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {language === "pt" ? "Semana de " : "Week of "}
                  {formatWeekRange(w.weekStart, language)}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasPayments && pendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllPaidMutation.mutate()}
              disabled={markAllPaidMutation.isPending}
            >
              {markAllPaidMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              {language === "pt" ? "Marcar todos como pagos" : "Mark all as paid"}
            </Button>
          )}
          <Button
            className="bg-[#22C55E] hover:bg-[#16a34a] text-white"
            size="sm"
            onClick={() => {
              if (!canExportReports) { setShowUpgrade(true); return; }
              exportMutation.mutate();
            }}
            disabled={exportMutation.isPending || !hasPayments}
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "pt" ? "Exportando..." : "Exporting..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {language === "pt" ? "Exportar CSV" : "Export CSV"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-3 py-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold">
                    {isLoading ? (
                      <span className="inline-block h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No weeks empty state */}
      {!weeksLoading && (!weeks || weeks.length === 0) && (
        <div className="overflow-x-auto rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-500">
            {language === "pt"
              ? "Nenhuma semana encontrada"
              : "No weeks found"}
          </p>
        </div>
      )}

      {/* No payments for week empty state */}
      {activeWeekId && !paymentsLoading && !hasPayments && weeks && weeks.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-500 mb-4">
            {language === "pt"
              ? "Nenhum pagamento calculado para esta semana"
              : "No payments calculated for this week"}
          </p>
          <Button
            className="bg-[#22C55E] hover:bg-[#16a34a] text-white"
            onClick={() => generateMutation.mutate(activeWeekId)}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            {language === "pt" ? "Calcular pagamentos" : "Calculate payments"}
          </Button>
        </div>
      )}

      {/* Report table */}
      {(isLoading || hasPayments) && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="sticky left-0 z-10 bg-gray-50/50 px-4 py-3 text-left font-medium text-gray-500 min-w-[200px]">
                  {language === "pt" ? "Colaboradora" : "Cleaner"}
                </th>
                <th className="px-3 py-3 text-center font-medium text-gray-500">
                  {language === "pt" ? "Serviços" : "Jobs"}
                </th>
                <th className="px-3 py-3 text-center font-medium text-gray-500">
                  {language === "pt" ? "Horas" : "Hours"}
                </th>
                <th className="px-3 py-3 text-right font-medium text-gray-500">
                  {language === "pt" ? "Valor total" : "Total amount"}
                </th>
                <th className="px-3 py-3 text-center font-medium text-gray-500">
                  Status
                </th>
                <th className="px-3 py-3 text-center font-medium text-gray-500">
                  {language === "pt" ? "Ações" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !hasPayments ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : (
                payments.map((payment) => {
                  const initials = payment.cleaner.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const avatarColors = getAvatarColor(payment.cleaner.name);

                  return (
                    <tr
                      key={payment.id}
                      className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-white px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: avatarColors.bg,
                              color: avatarColors.text,
                            }}
                          >
                            {initials}
                          </div>
                          <span className="truncate font-medium text-gray-900">
                            {payment.cleaner.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {payment.totalJobs}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {payment.totalHours.toFixed(1)}h
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900">
                        {format(payment.totalAmount)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StatusBadge
                          status={
                            payment.status === "PAID" ? "concluido" : "pendente"
                          }
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        {payment.status === "PENDING" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              markPaidMutation.mutate(payment.cleanerId)
                            }
                            disabled={markPaidMutation.isPending}
                          >
                            {markPaidMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : language === "pt" ? (
                              "Marcar como pago"
                            ) : (
                              "Mark as paid"
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {hasPayments && (
              <tfoot>
                <tr className="border-t bg-gray-50/50 font-semibold">
                  <td className="sticky left-0 z-10 bg-gray-50/50 px-4 py-3 text-gray-900">
                    Total
                  </td>
                  <td className="px-3 py-3 text-center text-gray-900">
                    {payments.reduce((s, p) => s + p.totalJobs, 0)}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-900">
                    {totalHours.toFixed(1)}h
                  </td>
                  <td className="px-3 py-3 text-right text-gray-900">
                    {format(grandTotal)}
                  </td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      <UpgradePrompt
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentPlan={plan}
        targetPlan={plan === "pro" ? "plus" : "pro"}
        trigger="feature_locked"
      />
    </div>
  );
}
