"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  UserPlus,
  Clock,
  BarChart3,
  ChevronRight,
  Sparkles,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  MapPin,
  ArrowUpRight,
  X,
  Bell,
  Trash2,
  MoreHorizontal,
  CalendarClock,
  ChevronDown,
  Home as HomeIcon,
  Wrench,
  BedDouble,
  Shirt,
  Check,
  Pin,
  Plus,
  Zap,
  Pencil,
  Radio,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { StatusBadge, type StatusType } from "@/components/ui/status-badge";
import { getAvatarColor } from "@/lib/avatar-color";
import type { Colaborador, ServicoHoje } from "@/lib/mock-data";

/* ─── Types ─── */
export interface DashboardAlert {
  title: string;
  description: string;
  severity: "critical" | "warning";
}

interface WeekDay {
  dia: string;
  total: number;
  hoje: boolean;
}

interface Reminder {
  id: string;
  text: string;
  date: string;
  time: string;
  completed: boolean;
}

interface HomeDashboardProps {
  userName: string;
  avatarUrl?: string;
  role?: string;
  cleaners: Colaborador[];
  services: ServicoHoje[];
  alerts: DashboardAlert[];
  weekServices: WeekDay[];
  custoSemana: number;
  diaristasAtivas: number;
  unidades: number;
}

/* ─── Helpers ─── */
function getGreeting(lang: "pt" | "en"): string {
  const hour = new Date().getHours();
  if (lang === "pt") {
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date, lang: "pt" | "en"): string {
  if (lang === "pt") {
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  }
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

const TIPO_SERVICO_CONFIG: Record<string, { icon: any; label: { pt: string; en: string }; color: string; bgClass: string; textClass: string }> = {
  standard: { icon: HomeIcon, label: { pt: "Standard", en: "Standard" }, color: "#6B7280", bgClass: "bg-gray-100", textClass: "text-gray-600" },
  "deep-clean": { icon: Sparkles, label: { pt: "Deep Clean", en: "Deep Clean" }, color: "#15803D", bgClass: "bg-green-50", textClass: "text-green-700" },
  "pos-obra": { icon: Wrench, label: { pt: "Pós-obra", en: "Post-renovation" }, color: "#92400E", bgClass: "bg-amber-50", textClass: "text-amber-800" },
  airbnb: { icon: BedDouble, label: { pt: "Airbnb", en: "Airbnb" }, color: "#DC2626", bgClass: "bg-red-50", textClass: "text-red-600" },
  laundry: { icon: Shirt, label: { pt: "Lavanderia", en: "Laundry" }, color: "#534AB7", bgClass: "bg-purple-50", textClass: "text-purple-700" },
};

/* ─── Circular Progress (Donut) ─── */
function CircularProgress({ value, total, size = 100 }: { value: number; total: number; size?: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-[#F0FDF4] dark:stroke-gray-700" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22C55E"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{value}/{total}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{total > 0 ? "concluídos" : ""}</span>
      </div>
    </div>
  );
}

/* ─── Bar Chart ─── */
function WeekBarChart({ data, lang }: { data: WeekDay[]; lang: "pt" | "en" }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const totalHours = data.reduce((acc, d) => acc + d.total * 2.5, 0);

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalHours.toFixed(0)}h</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{lang === "pt" ? "Horas estimadas" : "Estimated hours"}</span>
      </div>
      <p className="text-xs text-gray-400 mb-5">{lang === "pt" ? "esta semana" : "this week"}</p>
      <div className="flex items-end gap-3 h-28">
        {data.map((d) => {
          const heightPct = (d.total / maxVal) * 100;
          return (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-1.5" style={{ minWidth: 28 }}>
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{d.total}</span>
              <motion.div
                className={`w-full rounded-t-md ${!d.hoje ? "dark:!bg-gray-700" : ""}`}
                style={{ backgroundColor: d.hoje ? "#22C55E" : "#F0FDF4" }}
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              />
              <span className={`text-[11px] font-medium ${d.hoje ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                {d.dia.charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {data.map((d) => (
          <div key={d.dia + "-dot"} className={`w-1.5 h-1.5 rounded-full ${d.hoje ? "bg-[#22C55E]" : "bg-gray-200"}`} />
        ))}
      </div>
    </div>
  );
}

/* ─── Drawer Shell ─── */
function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
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

/* ─── Services Drawer Content ─── */
function ServicesDrawerContent({ services, cleaners, lang, onAssign }: { services: ServicoHoje[]; cleaners: Colaborador[]; lang: "pt" | "en"; onAssign: (serviceId: string, cleaner: Colaborador) => void }) {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const statusLabels: Record<string, { pt: string; en: string }> = {
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

  function ServiceIcon({ status }: { status: string }) {
    if (status === "concluido") return <CheckCircle className="h-4 w-4 text-[#22C55E]" />;
    if (status === "descoberto") return <AlertTriangle className="h-4 w-4 text-[#EF4444]" />;
    if (status === "a-caminho") return <MapPin className="h-4 w-4 text-[#F59E0B]" />;
    return <Sparkles className="h-4 w-4 text-[#22C55E]" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {[
          { label: "Total", value: services.length, color: "text-gray-900" },
          { label: lang === "pt" ? "Concluídos" : "Done", value: services.filter((s) => s.status === "concluido").length, color: "text-[#22C55E]" },
          { label: lang === "pt" ? "Descobertos" : "Uncovered", value: services.filter((s) => s.status === "descoberto").length, color: "text-[#EF4444]" },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 text-center py-2 rounded-lg bg-gray-50">
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      {services.map((s) => {
        const labels = statusLabels[s.status] || statusLabels["em-servico"];
        const isDescoberto = s.status === "descoberto";
        const tipoConfig = s.tipoServico ? TIPO_SERVICO_CONFIG[s.tipoServico] : null;
        const TipoIcon = tipoConfig?.icon;

        return (
          <div key={s.id}>
            <div className={`p-3.5 rounded-2xl border transition-colors ${isDescoberto ? "bg-red-50/50 border-red-200" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <ServiceIcon status={s.status} />
                  <p className="text-sm font-medium text-gray-900 truncate">{s.cliente}</p>
                </div>
                <StatusBadge status={s.status as StatusType} customLabel={lang === "pt" ? labels.pt : labels.en} size="xs" className="shrink-0" />
              </div>
              <div className="mt-2 ml-[26px] flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <CalendarClock className="h-3 w-3 shrink-0" />
                  {s.horarioInicio}–{s.horarioFim}
                </span>
                <span className="text-gray-300">·</span>
                {tipoConfig && TipoIcon ? (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${tipoConfig.bgClass} ${tipoConfig.textClass}`}>
                    <TipoIcon className="h-3 w-3" />
                    {lang === "pt" ? tipoConfig.label.pt : tipoConfig.label.en}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">{lang === "pt" ? "Sem tipo" : "No type"}</span>
                )}
              </div>
              <div className="mt-2.5 ml-[26px]">
                {isDescoberto ? (
                  <button onClick={() => setAssigningId(assigningId === s.id ? null : s.id)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-red-300 bg-red-50/50 text-sm text-[#EF4444] font-medium hover:bg-red-100/50 transition-colors">
                    <UserPlus className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Atribuir cleaner" : "Assign cleaner"}
                    <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform ${assigningId === s.id ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ backgroundColor: getAvatarColor(s.diarista).bg, color: getAvatarColor(s.diarista).text }}>
                      {s.diarista.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-xs text-gray-500 truncate">{s.diarista}</span>
                  </div>
                )}
              </div>
            </div>
            <AnimatePresence>
              {assigningId === s.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="mt-1 p-2 rounded-2xl bg-gray-50 space-y-1 border border-gray-100">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-2 py-1">{lang === "pt" ? "Cleaners disponíveis" : "Available cleaners"}</p>
                    {availableCleaners.map((c) => {
                      const avatarColor = getAvatarColor(c.name);
                      return (
                        <button key={c.id} onClick={() => handleAssign(s.id, c)} className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl hover:bg-white transition-colors text-left">
                          {c.avatar ? <img src={c.avatar} alt={c.name} className="h-7 w-7 rounded-full object-cover shrink-0" /> : (
                            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>{c.initials}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
                            <p className="text-[10px] text-gray-400">{c.unit} · {c.hoursThisWeek}h</p>
                          </div>
                          <span className="text-[10px] font-medium text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full shrink-0">{lang === "pt" ? "Atribuir" : "Assign"}</span>
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

/* ─── Alerts Drawer Content ─── */
function AlertsDrawerContent({ alerts, lang, onMarkDone, onDelete, onRemind }: { alerts: DashboardAlert[]; lang: "pt" | "en"; onMarkDone: (i: number) => void; onDelete: (i: number) => void; onRemind: (i: number) => void }) {
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-3"><Check className="w-5 h-5 text-[#22C55E]" /></div>
        <p className="text-sm font-medium text-gray-900">{lang === "pt" ? "Tudo certo!" : "All clear!"}</p>
        <p className="text-xs text-gray-400 mt-1">{lang === "pt" ? "Nenhum alerta pendente" : "No pending alerts"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div key={i} className={`relative p-3.5 rounded-2xl border transition-colors ${a.severity === "critical" ? "bg-red-50/50 border-red-200" : "bg-amber-50/50 border-amber-200"}`}>
          <div className="flex items-start gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${a.severity === "critical" ? "bg-[#EF4444]" : "bg-[#F59E0B]"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
            </div>
            <button onClick={() => setMenuOpen(menuOpen === i ? null : i)} className="p-1 rounded-md hover:bg-black/5 transition-colors shrink-0">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <AnimatePresence>
            {menuOpen === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200/60">
                  <button onClick={() => { onMarkDone(i); setMenuOpen(null); }} className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-[#F0FDF4] text-[#22C55E] text-[11px] font-medium hover:bg-[#DCFCE7] transition-colors">
                    <CheckCircle className="h-3 w-3" />{lang === "pt" ? "Concluir" : "Done"}
                  </button>
                  <button onClick={() => { onRemind(i); setMenuOpen(null); }} className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-medium hover:bg-amber-100 transition-colors">
                    <Bell className="h-3 w-3" />{lang === "pt" ? "Lembrar 1h" : "Remind 1h"}
                  </button>
                  <button onClick={() => { onDelete(i); setMenuOpen(null); }} className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-red-50 text-[#EF4444] text-[11px] font-medium hover:bg-red-100 transition-colors">
                    <Trash2 className="h-3 w-3" />{lang === "pt" ? "Excluir" : "Delete"}
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

/* ─── Cleaners Drawer Content ─── */
function CleanersDrawerContent({ cleaners, lang }: { cleaners: Colaborador[]; lang: "pt" | "en" }) {
  const activeToday = cleaners.filter((c) => c.status === "active" && c.schedule.seg?.type === "work");
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{lang === "pt" ? `${activeToday.length} cleaners com serviço hoje` : `${activeToday.length} cleaners with service today`}</p>
      {cleaners.filter((c) => c.status === "active").map((c) => {
        const hasWork = Object.values(c.schedule).some((d) => d?.type === "work");
        return (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 bg-white">
            {c.avatar ? <img src={c.avatar} alt={c.name} className="h-9 w-9 rounded-full object-cover shrink-0" /> : (
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: getAvatarColor(c.name).bg, color: getAvatarColor(c.name).text }}>{c.initials}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
              <p className="text-[11px] text-gray-400">{c.role} · {c.unit} · {c.hoursThisWeek}h</p>
            </div>
            <div className={`w-2 h-2 rounded-full shrink-0 ${hasWork ? "bg-[#22C55E]" : "bg-gray-300"}`} />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Reminders Card ─── */
const INITIAL_REMINDERS: Reminder[] = [
  { id: "r1", text: "Comprar produtos de limpeza", date: "2026-03-31", time: "09:00", completed: false },
  { id: "r2", text: "Revisar escala da semana", date: "2026-04-01", time: "08:00", completed: false },
  { id: "r3", text: "Enviar relatório mensal", date: "2026-03-28", time: "17:00", completed: true },
];

function RemindersCard({ lang }: { lang: "pt" | "en" }) {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  function toggleReminder(id: string) {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, completed: !r.completed } : r));
  }

  function startEditing(r: Reminder) {
    setEditingId(r.id);
    setNewText(r.text);
    setNewDate(r.date);
    setNewTime(r.time);
    setShowForm(true);
  }

  function saveReminder() {
    if (!newText.trim()) return;
    if (editingId) {
      setReminders((prev) => prev.map((r) => r.id === editingId ? { ...r, text: newText.trim(), date: newDate || r.date, time: newTime || r.time } : r));
    } else {
      const newR: Reminder = {
        id: `r${Date.now()}`,
        text: newText.trim(),
        date: newDate || new Date().toISOString().slice(0, 10),
        time: newTime || "09:00",
        completed: false,
      };
      setReminders((prev) => [newR, ...prev]);
    }
    setNewText("");
    setNewDate("");
    setNewTime("");
    setEditingId(null);
    setShowForm(false);
  }

  function deleteReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setNewText("");
    setNewDate("");
    setNewTime("");
  }

  function formatReminderDate(dateStr: string, timeStr: string): string {
    const d = new Date(dateStr + "T" + timeStr);
    const days = lang === "pt"
      ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = lang === "pt"
      ? ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} · ${timeStr}`;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-gray-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{lang === "pt" ? "Lembretes" : "Reminders"}</h3>
        </div>
        <button onClick={() => { setEditingId(null); setNewText(""); setNewDate(""); setNewTime(""); setShowForm(!showForm); }} className="text-sm text-[#22C55E] font-medium hover:text-[#16A34A] transition-colors flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />
          {lang === "pt" ? "Novo" : "New"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={lang === "pt" ? "O que precisa lembrar?" : "What to remember?"}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E]"
              />
              <div className="flex gap-2">
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30" />
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveReminder} className="bg-[#22C55E] text-white text-sm rounded-lg px-3 py-1.5 font-medium hover:bg-[#16A34A] transition-colors">
                  {editingId ? (lang === "pt" ? "Atualizar" : "Update") : (lang === "pt" ? "Salvar" : "Save")}
                </button>
                <button onClick={cancelForm} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  {lang === "pt" ? "Cancelar" : "Cancel"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divide-y divide-gray-50">
        {reminders.map((r) => (
          <div key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 group/reminder">
            <button
              onClick={() => toggleReminder(r.id)}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                r.completed ? "bg-[#22C55E] border-[#22C55E]" : "border-gray-300 hover:border-[#22C55E]"
              }`}
            >
              {r.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${r.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{r.text}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {formatReminderDate(r.date, r.time)}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover/reminder:opacity-100 transition-opacity shrink-0">
              <button onClick={() => startEditing(r)} className="p-1 rounded hover:bg-gray-100 transition-colors" title={lang === "pt" ? "Editar" : "Edit"}>
                <Pencil className="w-3 h-3 text-gray-400" />
              </button>
              <button onClick={() => deleteReminder(r.id)} className="p-1 rounded hover:bg-red-50 transition-colors" title={lang === "pt" ? "Excluir" : "Delete"}>
                <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ════════════════════════════════════════════════════════════════ */
export function HomeDashboard({
  userName,
  avatarUrl,
  role,
  cleaners,
  services,
  alerts: alertsProp,
  weekServices,
  custoSemana,
  diaristasAtivas,
  unidades,
}: HomeDashboardProps) {
  const { t, language: lang } = useLanguage();
  const { format } = useCurrency();
  const [openDrawer, setOpenDrawer] = useState<"cleaners" | "services" | "alerts" | "cost" | null>(null);

  const [liveServices, setLiveServices] = useState(services);
  const [liveAlerts, setLiveAlerts] = useState(alertsProp);
  const [snoozedReminders, setSnoozedReminders] = useState<string[]>([]);

  const servicosConcluidos = liveServices.filter((s) => s.status === "concluido").length;
  const totalServicos = liveServices.length;
  const servicosDescobertos = liveServices.filter((s) => s.status === "descoberto").length;

  const firstName = userName?.split(" ")[0] || (lang === "pt" ? "Gestora" : "Manager");

  function handleAssignService(serviceId: string, cleaner: Colaborador) {
    setLiveServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, diarista: cleaner.name, status: "a-caminho" as const } : s)));
  }
  function handleMarkAlertDone(i: number) { setLiveAlerts((prev) => prev.filter((_, idx) => idx !== i)); }
  function handleDeleteAlert(i: number) { setLiveAlerts((prev) => prev.filter((_, idx) => idx !== i)); }
  function handleRemindAlert(i: number) {
    const alert = liveAlerts[i];
    setLiveAlerts((prev) => prev.filter((_, idx) => idx !== i));
    setSnoozedReminders((prev) => [...prev, alert.title]);
    setTimeout(() => {
      setLiveAlerts((prev) => [...prev, alert]);
      setSnoozedReminders((prev) => prev.filter((t) => t !== alert.title));
    }, 60 * 60 * 1000);
  }

  /* Group services by start time for agenda */
  const servicesByTime = liveServices.reduce<Record<string, ServicoHoje[]>>((acc, s) => {
    if (!acc[s.horarioInicio]) acc[s.horarioInicio] = [];
    acc[s.horarioInicio].push(s);
    return acc;
  }, {});
  const sortedTimes = Object.keys(servicesByTime).sort();

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFB] dark:bg-gray-950 p-4 md:p-6 lg:p-8">
        {/* ── Row 1: Greeting + Bell + Date ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {getGreeting(lang)}, {firstName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("dashboard.home.greeting")}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Bell icon with badge */}
              <button
                onClick={() => setOpenDrawer("alerts")}
                className="relative p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                {liveAlerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {liveAlerts.length}
                  </span>
                )}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(new Date(), lang)}</span>
            </div>
          </div>

          {/* KPI stat cards */}
          <div className="flex gap-3 mt-5">
            {[
              { icon: Zap, value: totalServicos, label: lang === "pt" ? "Serviços" : "Services" },
              { icon: Users, value: diaristasAtivas, label: "Cleaners" },
              { icon: Building2, value: unidades, label: lang === "pt" ? "Unidades" : "Units" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-2.5 hover:shadow-md transition-shadow duration-200">
                <stat.icon className="w-4 h-4 text-[#22C55E]" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Row 2: Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ─── Column 1: Profile + Shortcuts ─── */}
          <div className="lg:col-span-3 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Profile photo — Crextio style, 80% height */}
              <div className="relative" style={{ paddingBottom: "80%" }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center text-5xl font-bold" style={{ backgroundColor: getAvatarColor(userName).bg, color: getAvatarColor(userName).text }}>
                    {firstName.charAt(0)}
                  </div>
                )}
                {/* Name + badge overlay at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-12 pb-4 px-4">
                  <h3 className="text-lg font-semibold text-white leading-tight">{userName}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{role || (lang === "pt" ? "Gestora de Operações" : "Operations Manager")}</p>
                  <div className="mt-2 inline-flex items-center bg-[#22C55E] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {format(custoSemana)}
                  </div>
                </div>
              </div>

              {/* Shortcuts */}
              <div className="border-t border-gray-100 dark:border-gray-800 mx-5 mb-5 pt-4 space-y-1">
                {[
                  { label: t("dashboard.home.viewSchedule"), icon: Calendar, href: "/dashboard" },
                  { label: t("dashboard.home.newCleaner"), icon: UserPlus, href: "/colaboradores" },
                  { label: t("dashboard.home.newService"), icon: Clock, href: "/servicos" },
                  { label: t("dashboard.home.report"), icon: BarChart3, href: "/relatorios" },
                ].map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                  >
                    <s.icon className="w-4 h-4 text-gray-400 group-hover:text-[#22C55E] transition-colors" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{s.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── Column 2: Progress + Agenda ─── */}
          <div className="lg:col-span-5 space-y-5">
            {/* Weekly progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{lang === "pt" ? "Progresso" : "Progress"}</h3>
                <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                </Link>
              </div>
              <WeekBarChart data={weekServices} lang={lang} />
            </motion.div>

            {/* Agenda grouped by time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{lang === "pt" ? "Agenda de hoje" : "Today's schedule"}</h3>
                <button onClick={() => setOpenDrawer("services")} className="text-xs text-[#22C55E] font-medium hover:text-[#16A34A] transition-colors">
                  {lang === "pt" ? "Ver todos" : "View all"} →
                </button>
              </div>

              <div className="space-y-4">
                {sortedTimes.map((time) => {
                  const group = servicesByTime[time];
                  return (
                    <div key={time}>
                      {/* Time header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{time}</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      {/* Services in this time slot */}
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        {group.map((s, idx) => {
                          const isDescoberto = s.status === "descoberto";
                          const isDone = s.status === "concluido";
                          const isActive = s.status === "em-servico";
                          const tipoConfig = s.tipoServico ? TIPO_SERVICO_CONFIG[s.tipoServico] : null;
                          const avatarColor = getAvatarColor(s.diarista !== "—" ? s.diarista : s.cliente);

                          return (
                            <div
                              key={s.id}
                              className={`flex items-center gap-3 py-3 px-3 ${idx > 0 ? "border-t border-gray-50" : ""} ${
                                idx % 2 === 1 ? "bg-gray-50" : "bg-white"
                              }`}
                            >
                              {/* Avatar or warning */}
                              {isDescoberto ? (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                </div>
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                  style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                                >
                                  {(s.diarista !== "—" ? s.diarista : s.cliente).split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </div>
                              )}

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isDescoberto ? "text-red-600" : isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                  {isDescoberto ? (s.diarista === "—" ? s.cliente : s.diarista) : s.diarista !== "—" ? s.diarista : s.cliente}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-sm text-gray-500">{isDescoberto ? (lang === "pt" ? "Sem cleaner" : "No cleaner") : s.cliente}</span>
                                  {tipoConfig && (
                                    <>
                                      <span className="text-gray-300">·</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${tipoConfig.bgClass} ${tipoConfig.textClass}`}>
                                        {lang === "pt" ? tipoConfig.label.pt : tipoConfig.label.en}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Status dot */}
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isDone ? "bg-[#22C55E]"
                                : isActive ? "bg-[#22C55E] animate-pulse"
                                : isDescoberto ? "bg-[#EF4444]"
                                : "bg-[#F59E0B]"
                              }`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ─── Column 3: Donut + Alerts + Reminders ─── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Day progress donut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{lang === "pt" ? "Progresso do dia" : "Day progress"}</h3>
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  {totalServicos > 0 ? `${Math.round((servicosConcluidos / totalServicos) * 100)}%` : "0%"}
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <CircularProgress value={servicosConcluidos} total={totalServicos} size={100} />
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{lang === "pt" ? "Concluídos" : "Done"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#F0FDF4] dark:bg-gray-700" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{lang === "pt" ? "Restantes" : "Remaining"}</span>
                </div>
              </div>
            </motion.div>

            {/* Alerts card with colored left border */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              onClick={() => setOpenDrawer("alerts")}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md border border-gray-200 dark:border-gray-800 ${
                liveAlerts.length > 0
                  ? liveAlerts.some((a) => a.severity === "critical")
                    ? "border-l-4 border-l-red-400"
                    : "border-l-4 border-l-yellow-400"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${liveAlerts.length > 0 ? "bg-amber-50" : "bg-[#F0FDF4]"}`}>
                    {liveAlerts.length > 0 ? <AlertTriangle className="w-5 h-5 text-[#F59E0B]" /> : <CheckCircle className="w-5 h-5 text-[#22C55E]" />}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{liveAlerts.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{lang === "pt" ? "alertas pendentes" : "pending alerts"}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
              {snoozedReminders.length > 0 && (
                <p className="text-[10px] text-amber-600 mt-2">{snoozedReminders.length} {lang === "pt" ? "adiado(s)" : "snoozed"}</p>
              )}
            </motion.div>

            {/* Reminders card (replaces dark card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <RemindersCard lang={lang} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Drawers ── */}
      <Drawer open={openDrawer === "cleaners"} onClose={() => setOpenDrawer(null)} title={lang === "pt" ? "Cleaners hoje" : "Cleaners today"}>
        <CleanersDrawerContent cleaners={cleaners} lang={lang} />
      </Drawer>
      <Drawer open={openDrawer === "services"} onClose={() => setOpenDrawer(null)} title={lang === "pt" ? "Serviços de hoje" : "Today's services"}>
        <ServicesDrawerContent services={liveServices} cleaners={cleaners} lang={lang} onAssign={handleAssignService} />
      </Drawer>
      <Drawer
        open={openDrawer === "alerts"}
        onClose={() => setOpenDrawer(null)}
        title={lang === "pt" ? `Alertas pendentes${snoozedReminders.length > 0 ? ` (${snoozedReminders.length} adiado${snoozedReminders.length > 1 ? "s" : ""})` : ""}` : `Pending alerts${snoozedReminders.length > 0 ? ` (${snoozedReminders.length} snoozed)` : ""}`}
      >
        <AlertsDrawerContent alerts={liveAlerts} lang={lang} onMarkDone={handleMarkAlertDone} onDelete={handleDeleteAlert} onRemind={handleRemindAlert} />
      </Drawer>
      <Drawer open={openDrawer === "cost"} onClose={() => setOpenDrawer(null)} title={lang === "pt" ? "Custo estimado da semana" : "Estimated weekly cost"}>
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-gray-900">{format(custoSemana)}</p>
            <p className="text-xs text-gray-400 mt-1">{lang === "pt" ? "Total estimado nesta semana" : "Estimated total this week"}</p>
          </div>
          <div className="space-y-2">
            {cleaners
              .filter((c) => c.hoursThisWeek > 0)
              .sort((a, b) => b.hoursThisWeek - a.hoursThisWeek)
              .slice(0, 8)
              .map((c) => {
                const pct = c.hoursThisWeek / cleaners.reduce((acc, cl) => acc + cl.hoursThisWeek, 0);
                const cost = custoSemana * pct;
                return (
                  <div key={c.id} className="flex items-center gap-3 py-2">
                    <img src={c.avatar} alt={c.name} className="h-7 w-7 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
                      <div className="h-1.5 bg-[#F0FDF4] rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 shrink-0">{format(cost)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </Drawer>
    </>
  );
}
