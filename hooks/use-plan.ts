"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PlanKey } from "@/lib/stripe";

interface SubscriptionData {
  plan: string;
  status: string;
  subscribed: boolean;
  trialActive: boolean;
  hasAccess: boolean;
  daysLeft: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: { cleaners: number; clients: number };
  usage: {
    cleaners: { current: number; limit: number };
    clients: { current: number; limit: number };
  };
}

export function usePlan() {
  const { data, isLoading, refetch } = useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: () => api.get("/subscription"),
    staleTime: 30000,
    retry: 1,
  });

  const plan = ((data?.plan ?? "BASIC").toLowerCase()) as PlanKey;

  return {
    plan,
    planLabel: plan === "plus" ? "Plus" : plan === "pro" ? "Pro" : "Basic",
    status: data?.status ?? "ACTIVE",
    isSubscribed: data?.subscribed ?? false,
    isTrialing: data?.trialActive ?? false,
    hasAccess: data?.hasAccess ?? true,
    isPastDue: data?.status === "PAST_DUE",
    trialDaysLeft: data?.daysLeft ?? null,
    cancelAtPeriodEnd: data?.cancelAtPeriodEnd ?? false,
    maxCleaners: data?.limits?.cleaners ?? 5,
    maxClients: data?.limits?.clients ?? 10,
    currentCleaners: data?.usage?.cleaners?.current ?? 0,
    currentClients: data?.usage?.clients?.current ?? 0,
    canAddCleaner: (data?.usage?.cleaners?.current ?? 0) < (data?.limits?.cleaners ?? 5),
    canAddClient: (data?.usage?.clients?.current ?? 0) < (data?.limits?.clients ?? 10),
    canUpgrade: plan !== "plus",
    canExportReports: plan === "pro" || plan === "plus",
    canExportExcel: plan === "plus",
    hasAbsenceAlerts: plan === "pro" || plan === "plus",
    isLoading,
    refetch,
  };
}
