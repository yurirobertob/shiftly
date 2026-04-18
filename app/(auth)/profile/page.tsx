"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Calendar,
  Users,
  Star,
  TrendingUp,
  Clock,
  Award,
  Shield,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Download,
  Briefcase,
  Target,
  Zap,
  Heart,
  Lock,
  Trophy,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { colaboradores, servicosAtribuidos } from "@/lib/mock-data";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const userName = session?.user?.name || "Manager";
  const userEmail = session?.user?.email || "manager@shiftsly.com";
  const userImage = session?.user?.image;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeCleaners = colaboradores.filter((c) => c.status === "active").length;
  const totalServices = servicosAtribuidos.length;
  const totalHours = colaboradores.reduce((acc, c) => acc + c.hoursThisWeek, 0);
  const memberSince = language === "pt" ? "Janeiro 2026" : "January 2026";

  const pt = language === "pt";

  // Info grid data (like Sex/Age/Blood in reference)
  const infoGrid = [
    { label: pt ? "Função" : "Role", value: pt ? "Gestora" : "Manager" },
    { label: pt ? "Cleaners" : "Cleaners", value: String(activeCleaners) },
    { label: pt ? "Região" : "Area", value: "London" },
    { label: pt ? "Status" : "Status", value: pt ? "Ativa" : "Active" },
    { label: pt ? "Plano" : "Plan", value: "Pro" },
    { label: pt ? "Desde" : "Since", value: pt ? "20 Jan, 2026" : "20 Jan, 2026" },
  ];

  // Performance vitals (like Patient Current Vitals)
  const vitals = [
    {
      label: pt ? "Taxa de cobertura" : "Coverage rate",
      value: "94%",
      sub: pt ? "No padrão" : "On track",
      status: "good" as const,
    },
    {
      label: pt ? "Avaliação média" : "Avg rating",
      value: "4.8",
      sub: pt ? "Excelente" : "Excellent",
      status: "good" as const,
    },
    {
      label: pt ? "Serviços/mês" : "Services/month",
      value: "187",
      sub: pt ? "Acima da média" : "Above average",
      status: "good" as const,
    },
    {
      label: pt ? "Faltas no mês" : "Absences/month",
      value: "3",
      sub: pt ? "Atenção" : "Attention",
      status: "warning" as const,
    },
  ];

  // Service history (like Patient History)
  const serviceHistory = [
    {
      date: "24 Mar, 2026",
      client: "Cobertura Oliveira",
      type: "Deep Clean",
      cleaners: 3,
      status: "completed" as const,
    },
    {
      date: "23 Mar, 2026",
      client: "Apt. Marques",
      type: "Standard",
      cleaners: 2,
      status: "completed" as const,
    },
    {
      date: "22 Mar, 2026",
      client: "Studio Alves",
      type: "Airbnb",
      cleaners: 1,
      status: "completed" as const,
    },
    {
      date: "21 Mar, 2026",
      client: "Casa Ferreira",
      type: "Standard",
      cleaners: 2,
      status: "issue" as const,
    },
    {
      date: "20 Mar, 2026",
      client: "Residência Lima",
      type: "Post-renovation",
      cleaners: 4,
      status: "completed" as const,
    },
    {
      date: "19 Mar, 2026",
      client: "Apt. Nascimento",
      type: "Deep Clean",
      cleaners: 2,
      status: "completed" as const,
    },
    {
      date: "18 Mar, 2026",
      client: "Casa Vila Nova",
      type: "Standard",
      cleaners: 1,
      status: "issue" as const,
    },
  ];

  // Achievements — conquered + locked
  const achievements = [
    {
      icon: Zap,
      label: pt ? "Primeira semana completa" : "First full week",
      date: "Jan 2026",
      color: "#F59E0B",
      unlocked: true,
    },
    {
      icon: Users,
      label: pt ? "10+ cleaners gerenciadas" : "10+ cleaners managed",
      date: "Feb 2026",
      color: "#1B6545",
      unlocked: true,
    },
    {
      icon: Target,
      label: pt ? "100 serviços agendados" : "100 services scheduled",
      date: "Feb 2026",
      color: "#2463EB",
      unlocked: true,
    },
    {
      icon: Shield,
      label: pt ? "Zero faltas na semana" : "Zero absences in a week",
      date: "Mar 2026",
      color: "#8B5CF6",
      unlocked: true,
    },
    {
      icon: Heart,
      label: pt ? "Nota 5.0 de um cliente" : "5.0 rating from a client",
      date: "Mar 2026",
      color: "#EC4899",
      unlocked: true,
    },
    {
      icon: TrendingUp,
      label: pt ? "Custo reduzido em 15%" : "Cost reduced by 15%",
      date: "Mar 2026",
      color: "#1B6545",
      unlocked: true,
    },
    {
      icon: Award,
      label: pt ? "500 serviços concluídos" : "500 services completed",
      date: "",
      color: "#9CA3AF",
      unlocked: false,
    },
    {
      icon: Sparkles,
      label: pt ? "30 dias sem incidentes" : "30 days incident-free",
      date: "",
      color: "#9CA3AF",
      unlocked: false,
    },
    {
      icon: Briefcase,
      label: pt ? "20+ clientes ativos" : "20+ active clients",
      date: "",
      color: "#9CA3AF",
      unlocked: false,
    },
    {
      icon: Star,
      label: pt ? "Nota média 4.9+" : "Avg rating 4.9+",
      date: "",
      color: "#9CA3AF",
      unlocked: false,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-gray-500"
      >
        <span className="hover:text-gray-700 cursor-pointer transition-colors">{pt ? "Configurações" : "Settings"}</span>
        <span className="text-gray-300">›</span>
        <span className="hover:text-gray-700 cursor-pointer transition-colors">{pt ? "Perfil" : "Profile"}</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">{userName}</span>
      </motion.div>

      {/* Header card — inspired by reference */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Avatar + identity */}
          <div className="flex flex-col items-center md:items-start gap-3 md:w-[200px] shrink-0">
            <div className="relative">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover ring-3 ring-[#1B6545] ring-offset-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1B6545] flex items-center justify-center ring-3 ring-[#1B6545] ring-offset-2">
                  <span className="text-xl font-bold text-white">{initials}</span>
                </div>
              )}
              {/* Plan badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1B6545] rounded-full px-2.5 py-0.5 shadow-sm">
                <Shield className="h-3 w-3 text-white" />
                <span className="text-[10px] font-semibold text-white">Pro</span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-lg font-semibold text-gray-900">{userName}</h1>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
            <button className="mt-1 text-xs font-medium text-[#1B6545] border border-[#1B6545] rounded-full px-4 py-1.5 hover:bg-[#E6F4ED] transition-colors">
              {pt ? "Editar perfil" : "Edit Profile"}
            </button>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-px bg-gray-200 self-stretch" />

          {/* Right: Info grid (like reference Sex/Age/Blood etc) */}
          <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-4">
            {infoGrid.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400">{item.label}</p>
                {item.label === "Status" || item.label === "status" ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#1B6545]" />
                    <span className="text-xs font-semibold text-[#1B6545]">{item.value}</span>
                  </div>
                ) : item.label === (pt ? "Plano" : "Plan") ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B6545] bg-[#E6F4ED] rounded-full px-2 py-0.5 mt-0.5">
                    <Shield className="h-3 w-3" />
                    {item.value}
                  </span>
                ) : (
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                )}
              </div>
            ))}
            {/* Contact row */}
            <div>
              <p className="text-xs text-gray-400">{pt ? "Telefone" : "Phone"}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">+44 7911 123456</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{pt ? "Serviços/semana" : "Services/week"}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{totalServices}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{pt ? "Horas gerenciadas" : "Hours managed"}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{totalHours}h</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Vitals — inspired by "Patient Current Vitals" */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {pt ? "Indicadores de performance" : "Performance Indicators"}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {vitals.map((v) => (
            <div key={v.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">{v.label}</p>
              <span className="text-3xl font-bold text-gray-900 tracking-tight">{v.value}</span>
              <div className="mt-2">
                <StatusBadge
                  status={v.status === "good" ? "ativo" : "incidente"}
                  customLabel={v.sub}
                  size="xs"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Two columns: Service History + Right column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Service History — inspired by "Patient History" */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.16 }}
          className="bg-white border border-gray-200 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {pt ? "Histórico de serviços" : "Service History"}
            </h3>
            <span className="text-xs text-gray-400">
              {pt ? `Total ${totalServices} serviços` : `Total ${totalServices} services`}
            </span>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_0.7fr_0.5fr_0.7fr] gap-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
            <span>{pt ? "Data" : "Date"}</span>
            <span>{pt ? "Cliente" : "Client"}</span>
            <span>{pt ? "Tipo" : "Type"}</span>
            <span>{pt ? "Cleaners" : "Cleaners"}</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {serviceHistory.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_0.7fr_0.5fr_0.7fr] gap-1 sm:gap-2 py-3 items-center"
              >
                <span className="text-xs text-gray-600">{row.date}</span>
                <span className="text-xs font-medium text-gray-900">{row.client}</span>
                <span className="text-xs text-gray-500">{row.type}</span>
                <span className="text-xs text-gray-500 text-center">{row.cleaners}</span>
                <span>
                  <StatusBadge
                    status={row.status === "completed" ? "concluido" : "incidente"}
                    customLabel={
                      row.status === "completed"
                        ? pt ? "Concluido" : "Completed"
                        : pt ? "Incidente" : "Issue"
                    }
                    size="xs"
                  />
                </span>
              </motion.div>
            ))}
          </div>

          {/* View more */}
          <button className="mt-3 text-xs text-[#1B6545] font-medium hover:underline">
            {pt ? "Ver histórico completo →" : "View full history →"}
          </button>
        </motion.div>

        {/* Right column: Achievements + Preferences */}
        <div className="space-y-6">
          {/* Achievements — Compact Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="flex items-center justify-between p-4 bg-gray-50/80 border border-gray-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F3D28] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#FAC775]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {unlockedCount} {pt ? "de" : "of"} {totalAchievements} {pt ? "conquistas" : "achievements"}
                </p>
                <p className="text-xs text-gray-500">
                  {pt ? "Nivel" : "Level"} 3 · 280 XP
                </p>
              </div>
            </div>
            <Link
              href="/conquistas"
              className="text-sm text-[#1B6545] font-medium hover:underline"
            >
              {pt ? "Ver todas" : "View all"} →
            </Link>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.28 }}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 pb-3 mb-3 border-b border-gray-100">
              {pt ? "Preferências" : "Preferences"}
            </h3>

            <div className="space-y-3">
              {/* Currency */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {pt ? "Moeda" : "Currency"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {pt ? "Exibição de valores" : "Value display"}
                  </p>
                </div>
                <CurrencySelector size="sm" />
              </div>

              {/* Timezone */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {pt ? "Fuso horário" : "Time zone"}
                  </p>
                </div>
                <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  GMT+0 London
                </span>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {pt ? "Notificações" : "Notifications"}
                  </p>
                </div>
                <span className="text-[11px] text-[#1B6545] bg-[#E6F4ED] px-2 py-0.5 rounded-full font-medium">
                  {pt ? "Ativado" : "Enabled"}
                </span>
              </div>

              {/* Weekly report */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {pt ? "Relatório semanal" : "Weekly report"}
                  </p>
                </div>
                <span className="text-[11px] text-[#1B6545] bg-[#E6F4ED] px-2 py-0.5 rounded-full font-medium">
                  {pt ? "Sexta 18h" : "Friday 6pm"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
