"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MapPin, AlertTriangle, Check, UserPlus, ChevronDown, Sparkles, Home as HomeIcon, Wrench, BedDouble, Shirt, CheckCircle, Trash2, Bell, MoreHorizontal, CalendarClock } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { StatusBadge, type StatusType } from "@/components/ui/status-badge";
import { getAvatarColor } from "@/lib/avatar-color";
import type { Colaborador, ServicoHoje, TipoServico } from "@/lib/mock-data";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  variant?: "neutral" | "alert";
  alertLevel?: number; // 0 = no alerts, 1-2 = low, 3-4 = medium, 5+ = critical
  index: number;
  onClick?: () => void;
}

// Maps alert count to urgency color — from amber → orange → red
function getAlertHoverColor(level: number): string {
  if (level <= 0) return "#1B6545";   // green (no alerts)
  if (level <= 1) return "#BA7517";   // amber (low)
  if (level <= 2) return "#D97706";   // orange (moderate)
  if (level <= 3) return "#EA580C";   // dark orange (elevated)
  if (level <= 4) return "#DC2626";   // red (high)
  return "#991B1B";                    // dark red (critical)
}

function getAlertBorderColor(level: number): string {
  if (level <= 0) return "border-border";
  if (level <= 2) return "border-amber-200";
  if (level <= 4) return "border-orange-200";
  return "border-red-200";
}

function getAlertBgColor(level: number): string {
  if (level <= 0) return "bg-white";
  if (level <= 2) return "bg-amber-50/30";
  if (level <= 4) return "bg-orange-50/30";
  return "bg-red-50/30";
}

function StatCard({ label, value, sub, variant = "neutral", alertLevel = 0, index, onClick }: StatCardProps) {
  const [hovered, setHovered] = useState(false);
  const isAlert = variant === "alert" && alertLevel > 0;
  const hoverColor = isAlert ? getAlertHoverColor(alertLevel) : "#1B6545";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className={`rounded-xl p-5 border cursor-pointer transition-all duration-200 ${
        isAlert && !hovered
          ? `${getAlertBgColor(alertLevel)} ${getAlertBorderColor(alertLevel)}`
          : !hovered ? "bg-white border-border" : ""
      }`}
      style={hovered ? { backgroundColor: hoverColor, borderColor: hoverColor } : undefined}
    >
      <p className={`text-xs font-medium transition-colors duration-200 ${hovered ? "text-white/70" : "text-gray-500"}`}>{label}</p>
      <p className={`text-2xl font-semibold mt-1 transition-colors duration-200 ${hovered ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
      <p className={`text-xs mt-0.5 transition-colors duration-200 ${hovered ? "text-white/60" : "text-gray-400"}`}>{sub}</p>
    </motion.div>
  );
}

/* ─── Drawer Shell ─── */
function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Drawer Contents ─── */
function CleanersDrawerContent({
  cleaners,
  lang,
}: {
  cleaners: Colaborador[];
  lang: "pt" | "en";
}) {
  const activeToday = cleaners.filter(
    (c) => c.status === "active" && c.schedule.seg?.type === "work"
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        {lang === "pt"
          ? `${activeToday.length} cleaners com serviço hoje`
          : `${activeToday.length} cleaners with service today`}
      </p>
      {cleaners
        .filter((c) => c.status === "active")
        .map((c) => {
          const hasWork = Object.values(c.schedule).some(
            (d) => d?.type === "work"
          );
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <img
                src={c.avatar}
                alt={c.name}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {c.name}
                </p>
                <p className="text-[11px] text-gray-400">{c.unit} · {c.hoursThisWeek}h</p>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  hasWork
                    ? "bg-[#E6F4ED] text-[#1B6545]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {hasWork
                  ? lang === "pt" ? "Ativa" : "Active"
                  : lang === "pt" ? "Livre" : "Free"}
              </span>
            </div>
          );
        })}
    </div>
  );
}

const TIPO_SERVICO_CONFIG: Record<string, { label: { pt: string; en: string }; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  "standard":   { label: { pt: "Standard",   en: "Standard"   }, icon: HomeIcon,  color: "#1B6545" },
  "deep-clean": { label: { pt: "Deep Clean", en: "Deep Clean" }, icon: Sparkles,  color: "#185FA5" },
  "pos-obra":   { label: { pt: "Pós-obra",   en: "Post-build" }, icon: Wrench,    color: "#854F0B" },
  "airbnb":     { label: { pt: "Airbnb",     en: "Airbnb"     }, icon: BedDouble, color: "#534AB7" },
  "laundry":    { label: { pt: "Lavanderia", en: "Laundry"    }, icon: Shirt,     color: "#993C1D" },
};

function ServicesDrawerContent({
  services,
  cleaners,
  lang,
  onAssign,
}: {
  services: ServicoHoje[];
  cleaners: Colaborador[];
  lang: "pt" | "en";
  onAssign: (serviceId: string, cleaner: Colaborador) => void;
}) {
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const statusCustomLabels: Record<string, { pt: string; en: string }> = {
    concluido: { pt: "Concluído", en: "Done" },
    "em-servico": { pt: "Em serviço", en: "In progress" },
    "a-caminho": { pt: "A caminho", en: "On the way" },
    descoberto: { pt: "Descoberto", en: "Uncovered" },
  };

  const availableCleaners = cleaners.filter((c) => c.status === "active");

  function handleAssign(serviceId: string, cleaner: Colaborador) {
    onAssign(serviceId, cleaner);
    setAssigningId(null);
  }

  // Status icon per service
  function ServiceIcon({ status }: { status: string }) {
    if (status === "concluido") return <CheckCircle className="h-4 w-4 text-[#1B6545]" />;
    if (status === "descoberto") return <AlertTriangle className="h-4 w-4 text-[#E24B4A]" />;
    if (status === "a-caminho") return <MapPin className="h-4 w-4 text-[#BA7517]" />;
    return <Sparkles className="h-4 w-4 text-[#185FA5]" />;
  }

  return (
    <div className="space-y-2">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-3">
        {[
          { label: lang === "pt" ? "Total" : "Total", value: services.length, color: "text-gray-900" },
          { label: lang === "pt" ? "Concluídos" : "Done", value: services.filter(s => s.status === "concluido").length, color: "text-[#1B6545]" },
          { label: lang === "pt" ? "Descobertos" : "Uncovered", value: services.filter(s => s.status === "descoberto").length, color: "text-[#E24B4A]" },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 text-center py-2 rounded-lg bg-gray-50">
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {services.map((s) => {
        const labels = statusCustomLabels[s.status] || statusCustomLabels["em-servico"];
        const isDescoberto = s.status === "descoberto";
        const tipoConfig = s.tipoServico ? TIPO_SERVICO_CONFIG[s.tipoServico] : null;
        const TipoIcon = tipoConfig?.icon;

        return (
          <div key={s.id}>
            <div
              className={`p-3.5 rounded-xl border transition-colors ${
                isDescoberto
                  ? "border-red-200 bg-red-50/30"
                  : "border-gray-100 bg-white"
              }`}
            >
              {/* Row 1: Client + Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <ServiceIcon status={s.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.cliente}</p>
                  </div>
                </div>
                <StatusBadge
                  status={s.status as StatusType}
                  customLabel={lang === "pt" ? labels.pt : labels.en}
                  size="xs"
                  className="shrink-0"
                />
              </div>

              {/* Row 2: Time + Tipo de serviço */}
              <div className="mt-2 ml-[26px] flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <CalendarClock className="h-3 w-3 shrink-0" />
                  {s.horarioInicio}–{s.horarioFim}
                </span>
                <span className="text-gray-300">·</span>
                {tipoConfig && TipoIcon ? (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: tipoConfig.color + "15", color: tipoConfig.color }}
                  >
                    <TipoIcon className="h-3 w-3" />
                    {lang === "pt" ? tipoConfig.label.pt : tipoConfig.label.en}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                    {lang === "pt" ? "Sem tipo" : "No type"}
                  </span>
                )}
              </div>

              {/* Row 3: Diarista or Assign */}
              <div className="mt-2.5 ml-[26px]">
                {isDescoberto ? (
                  <button
                    onClick={() => setAssigningId(assigningId === s.id ? null : s.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-red-300 bg-red-50/50 text-sm text-[#E24B4A] font-medium hover:bg-red-100/50 transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Atribuir cleaner" : "Assign cleaner"}
                    <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform ${assigningId === s.id ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                      style={{ backgroundColor: getAvatarColor(s.diarista).bg, color: getAvatarColor(s.diarista).text }}
                    >
                      {s.diarista.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-xs text-gray-600 truncate">{s.diarista}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assign picker dropdown */}
            <AnimatePresence>
              {assigningId === s.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 p-2 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider px-2 py-1">
                      {lang === "pt" ? "Cleaners disponíveis" : "Available cleaners"}
                    </p>
                    {availableCleaners.map((c) => {
                      const avatarColor = getAvatarColor(c.name);
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleAssign(s.id, c)}
                          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-white transition-colors text-left"
                        >
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
                          ) : (
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                              style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                            >
                              {c.initials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
                            <p className="text-[10px] text-gray-400">{c.unit} · {c.hoursThisWeek}h</p>
                          </div>
                          <span className="text-[10px] font-medium text-[#1B6545] bg-[#E6F4ED] px-2 py-0.5 rounded-full shrink-0">
                            {lang === "pt" ? "Atribuir" : "Assign"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function AlertsDrawerContent({
  alerts,
  lang,
  onMarkDone,
  onDelete,
  onRemind,
}: {
  alerts: DayStatsAlert[];
  lang: "pt" | "en";
  onMarkDone: (index: number) => void;
  onDelete: (index: number) => void;
  onRemind: (index: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-[#E6F4ED] flex items-center justify-center mb-3">
          <Check className="w-5 h-5 text-[#1B6545]" />
        </div>
        <p className="text-sm font-medium text-gray-700">
          {lang === "pt" ? "Tudo certo!" : "All clear!"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {lang === "pt" ? "Nenhum alerta pendente" : "No pending alerts"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`relative p-3.5 rounded-xl border transition-colors ${
            a.severity === "critical"
              ? "border-red-200 bg-red-50/30"
              : "border-amber-200 bg-amber-50/20"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                a.severity === "critical" ? "bg-[#E24B4A]" : "bg-[#BA7517]"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
            </div>
            <button
              onClick={() => setMenuOpen(menuOpen === i ? null : i)}
              className="p-1 rounded-md hover:bg-black/5 transition-colors shrink-0"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Action buttons row */}
          <AnimatePresence>
            {menuOpen === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200/60">
                  <button
                    onClick={() => { onMarkDone(i); setMenuOpen(null); }}
                    className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-[#E6F4ED] text-[#1B6545] text-[11px] font-medium hover:bg-[#d0ebe0] transition-colors"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {lang === "pt" ? "Concluir" : "Done"}
                  </button>
                  <button
                    onClick={() => { onRemind(i); setMenuOpen(null); }}
                    className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-[#FAEEDA] text-[#854F0B] text-[11px] font-medium hover:bg-[#f5e2c8] transition-colors"
                  >
                    <Bell className="h-3 w-3" />
                    {lang === "pt" ? "Lembrar 1h" : "Remind 1h"}
                  </button>
                  <button
                    onClick={() => { onDelete(i); setMenuOpen(null); }}
                    className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-red-50 text-[#E24B4A] text-[11px] font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    {lang === "pt" ? "Excluir" : "Delete"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export interface DayStatsAlert {
  title: string;
  description: string;
  severity: "critical" | "warning";
}

interface DayStatsProps {
  diaristasHoje: number;
  diaristasAtivas: number;
  servicosHoje: number;
  servicosConcluidos: number;
  servicosAFazer: number;
  alertas: number;
  custoSemana: number; // Raw BRL value
  cleaners: Colaborador[];
  services: ServicoHoje[];
  alertsList: DayStatsAlert[];
}

export function DayStats({
  diaristasHoje,
  diaristasAtivas,
  servicosHoje: _servicosHoje,
  servicosConcluidos: _servicosConcluidos,
  servicosAFazer: _servicosAFazer,
  alertas: _alertas,
  custoSemana,
  cleaners,
  services,
  alertsList,
}: DayStatsProps) {
  const { t, language } = useLanguage();
  const { format } = useCurrency();
  const [openDrawer, setOpenDrawer] = useState<"cleaners" | "services" | "alerts" | "cost" | null>(null);

  // Lifted state for persistence across drawer open/close
  const [liveServices, setLiveServices] = useState(services);
  const [liveAlerts, setLiveAlerts] = useState(alertsList);
  const [reminders, setReminders] = useState<string[]>([]);

  // Derived counts from live state
  const servicosHoje = liveServices.length;
  const servicosConcluidos = liveServices.filter(s => s.status === "concluido").length;
  const servicosAFazer = servicosHoje - servicosConcluidos;
  const alertas = liveAlerts.length;

  function handleAssignService(serviceId: string, cleaner: Colaborador) {
    setLiveServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? { ...s, diarista: cleaner.name, status: "a-caminho" as const }
          : s
      )
    );
  }

  function handleMarkAlertDone(index: number) {
    setLiveAlerts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDeleteAlert(index: number) {
    setLiveAlerts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRemindAlert(index: number) {
    const alert = liveAlerts[index];
    setLiveAlerts((prev) => prev.filter((_, i) => i !== index));
    setReminders((prev) => [...prev, alert.title]);
    // Schedule re-add after 1 hour
    setTimeout(() => {
      setLiveAlerts((prev) => [...prev, alert]);
      setReminders((prev) => prev.filter((t) => t !== alert.title));
    }, 60 * 60 * 1000);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={t("dashboard.home.cleanersToday")}
          value={diaristasHoje}
          sub={t("dashboard.home.ofActive").replace("{n}", String(diaristasAtivas))}
          index={0}
          onClick={() => setOpenDrawer("cleaners")}
        />
        <StatCard
          label={t("dashboard.home.servicesToday")}
          value={servicosHoje}
          sub={`${servicosConcluidos} ${t("dashboard.home.completed")} · ${servicosAFazer} ${t("dashboard.home.toDo")}`}
          index={1}
          onClick={() => setOpenDrawer("services")}
        />
        <StatCard
          label={t("dashboard.home.alerts")}
          value={alertas}
          sub={alertas > 0 ? t("dashboard.home.needAttention") : t("dashboard.home.allGood")}
          variant={alertas > 0 ? "alert" : "neutral"}
          alertLevel={alertas}
          index={2}
          onClick={() => setOpenDrawer("alerts")}
        />
        <StatCard
          label={t("dashboard.home.estimatedCost")}
          value={format(custoSemana)}
          sub={t("dashboard.home.thisWeek")}
          index={3}
          onClick={() => setOpenDrawer("cost")}
        />
      </div>

      {/* Drawers */}
      <Drawer
        open={openDrawer === "cleaners"}
        onClose={() => setOpenDrawer(null)}
        title={language === "pt" ? "Cleaners hoje" : "Cleaners today"}
      >
        <CleanersDrawerContent cleaners={cleaners} lang={language} />
      </Drawer>

      <Drawer
        open={openDrawer === "services"}
        onClose={() => setOpenDrawer(null)}
        title={language === "pt" ? "Serviços de hoje" : "Today's services"}
      >
        <ServicesDrawerContent services={liveServices} cleaners={cleaners} lang={language} onAssign={handleAssignService} />
      </Drawer>

      <Drawer
        open={openDrawer === "alerts"}
        onClose={() => setOpenDrawer(null)}
        title={language === "pt" ? `Alertas pendentes${reminders.length > 0 ? ` (${reminders.length} adiado${reminders.length > 1 ? "s" : ""})` : ""}` : `Pending alerts${reminders.length > 0 ? ` (${reminders.length} snoozed)` : ""}`}
      >
        <AlertsDrawerContent alerts={liveAlerts} lang={language} onMarkDone={handleMarkAlertDone} onDelete={handleDeleteAlert} onRemind={handleRemindAlert} />
      </Drawer>

      <Drawer
        open={openDrawer === "cost"}
        onClose={() => setOpenDrawer(null)}
        title={language === "pt" ? "Custo estimado da semana" : "Estimated weekly cost"}
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-gray-900">{format(custoSemana)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {language === "pt" ? "Total estimado nesta semana" : "Estimated total this week"}
            </p>
          </div>
          <div className="space-y-2">
            {cleaners
              .filter((c) => c.hoursThisWeek > 0)
              .sort((a, b) => b.hoursThisWeek - a.hoursThisWeek)
              .slice(0, 8)
              .map((c) => {
                // rough cost per cleaner proportional to hours
                const pct = c.hoursThisWeek / cleaners.reduce((acc, cl) => acc + cl.hoursThisWeek, 0);
                const cost = custoSemana * pct;
                return (
                  <div key={c.id} className="flex items-center gap-3 py-2">
                    <img src={c.avatar} alt={c.name} className="h-7 w-7 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#1B6545] rounded-full"
                          style={{ width: `${Math.min(pct * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 shrink-0">
                      {format(cost)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </Drawer>
    </>
  );
}
