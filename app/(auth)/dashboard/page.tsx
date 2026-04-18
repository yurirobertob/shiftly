"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  AlertTriangle,
  X,
  User,
  MessageCircle,
  ArrowLeftRight,
  UserMinus,
  Copy,
  Phone,
  Mail,
  MapPin,
  Lock,
  Check,
  Loader2,
  Plus,
  Users,
  Calendar,
  Sparkles,
  Download,
  Building2,
  Clock,
  ChevronDown,
  UserPlus,
} from "lucide-react";

import { KPICards } from "@/components/dashboard/kpi-cards";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CustoDiaristasChart } from "@/components/dashboard/custo-diaristas-chart";
import { AlertaDia } from "@/components/dashboard/alerta-dia";
import { ServicosHoje } from "@/components/dashboard/servicos-hoje";
import { DiaristasHoje } from "@/components/dashboard/diaristas-hoje";
import { ServicosSemanaChart } from "@/components/dashboard/servicos-semana-chart";
import { RotasFAB } from "@/components/rotas-ativas/rotas-fab";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { getAvatarColor } from "@/lib/avatar-color";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  useWeekNavigation,
  formatWeekRange,
  getWeekDates,
  getCurrentWeekStart,
} from "@/hooks/use-week";

const dayKeys = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"] as const;

const weekDaysI18n: Record<string, { pt: string; en: string }> = {
  seg: { pt: "Seg", en: "Mon" },
  ter: { pt: "Ter", en: "Tue" },
  qua: { pt: "Qua", en: "Wed" },
  qui: { pt: "Qui", en: "Thu" },
  sex: { pt: "Sex", en: "Fri" },
  sab: { pt: "Sáb", en: "Sat" },
  dom: { pt: "Dom", en: "Sun" },
};

// --- Types ---
interface ApiJob {
  id: string;
  scheduleId: string;
  cleanerId: string | null;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  cost: number;
  hoursWorked: number;
  hourlyRate: number;
  notes: string | null;
  cleaner: { id: string; name: string; avatarColor: string | null; hourlyRate?: number } | null;
  client: { id: string; name: string; address?: string };
}

interface ApiWeek {
  id: string;
  weekStart: string;
  status: string;
  totalCost: number;
  totalJobs: number;
  totalAbsences: number;
  jobs?: ApiJob[];
}

interface ApiCleaner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  hourlyRate: number;
  status: string;
  avatarColor: string | null;
}

interface ApiAbsence {
  id: string;
  cleanerId: string;
  date: string;
  reason: string | null;
  jobsAffected: number;
  covered: boolean;
  cleaner: { id: string; name: string; avatarColor: string | null };
  coveredBy: { id: string; name: string; avatarColor: string | null } | null;
}

// Build a grid structure: cleanerRows × 7 days
function buildGrid(jobs: ApiJob[]) {
  const cleanerMap = new Map<string, { cleaner: ApiJob["cleaner"]; days: Record<number, ApiJob[]> }>();
  const uncoveredDays: Record<number, ApiJob[]> = {};

  jobs.forEach((job) => {
    const dateStr = typeof job.date === "string" ? job.date.split("T")[0] : job.date;
    const d = new Date(dateStr + "T00:00:00");
    const dow = d.getDay();
    const adjustedDay = dow === 0 ? 6 : dow - 1; // 0=Mon, 6=Sun

    if (!job.cleanerId || !job.cleaner) {
      if (!uncoveredDays[adjustedDay]) uncoveredDays[adjustedDay] = [];
      uncoveredDays[adjustedDay].push(job);
      return;
    }

    const key = job.cleanerId;
    if (!cleanerMap.has(key)) {
      cleanerMap.set(key, { cleaner: job.cleaner, days: {} });
    }
    const entry = cleanerMap.get(key)!;
    if (!entry.days[adjustedDay]) entry.days[adjustedDay] = [];
    entry.days[adjustedDay].push(job);
  });

  return { cleanerMap, uncoveredDays };
}

/* ─── Drawer for cleaner details ─── */
function CleanerDrawer({
  cleanerId,
  jobs,
  onClose,
  lang,
}: {
  cleanerId: string;
  jobs: ApiJob[];
  onClose: () => void;
  lang: "pt" | "en";
}) {
  const { format } = useCurrency();
  const cleanerJobs = jobs.filter((j) => j.cleanerId === cleanerId);
  const cleaner = cleanerJobs[0]?.cleaner;
  if (!cleaner) return null;

  const totalServices = cleanerJobs.filter((j) => j.status === "SCHEDULED" || j.status === "COMPLETED").length;
  const totalHours = cleanerJobs.reduce((s, j) => s + Number(j.hoursWorked || 0), 0);
  const absences = cleanerJobs.filter((j) => j.status === "ABSENT").length;
  const totalCost = cleanerJobs.reduce((s, j) => s + Number(j.cost || 0), 0);
  const avatarColor = cleaner.avatarColor ? { bg: cleaner.avatarColor, text: "#fff" } : getAvatarColor(cleaner.name);
  const initials = cleaner.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">{lang === "pt" ? "Detalhes da Colaboradora" : "Cleaner details"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{cleaner.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F0FDF4] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#15803D]">{totalHours.toFixed(0)}h</p>
              <p className="text-xs text-[#15803D]/70">{lang === "pt" ? "Horas" : "Hours"}</p>
            </div>
            <div className="bg-[#F0FDF4] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#15803D]">{totalServices}</p>
              <p className="text-xs text-[#15803D]/70">{lang === "pt" ? "Serviços" : "Services"}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#BA7517]">{absences}</p>
              <p className="text-xs text-[#BA7517]/70">{lang === "pt" ? "Ausências" : "Absences"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">{lang === "pt" ? "Serviços da Semana" : "Week Services"}</h4>
            <div className="space-y-2">
              {cleanerJobs.filter(j => j.status !== "CANCELLED").map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{j.client.name}</p>
                    <p className="text-[11px] text-gray-500">{j.startTime}–{j.endTime}</p>
                  </div>
                  <StatusBadge
                    status={j.status === "COMPLETED" ? "concluido" : j.status === "ABSENT" ? "ausente" : j.status === "SCHEDULED" ? "a-caminho" : "pendente"}
                    size="xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">{lang === "pt" ? "Total da semana" : "Week total"}: {format(totalCost)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Options Menu ─── */
function OptionsMenu({ onClose, onAction, lang }: { onClose: () => void; onAction: (action: string) => void; lang: "pt" | "en" }) {
  const actions = [
    { icon: User, label: lang === "pt" ? "Ver perfil completo" : "View full profile", action: "profile" },
    { icon: MessageCircle, label: lang === "pt" ? "Enviar escala por WhatsApp" : "Send schedule via WhatsApp", action: "whatsapp" },
    { icon: UserMinus, label: lang === "pt" ? "Registrar ausência" : "Register absence", action: "absence" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 py-1.5 shadow-xl animate-in fade-in zoom-in-95">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.action}
              onClick={() => { onAction(a.action); onClose(); }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Icon className="h-4 w-4 text-gray-400" />
              {a.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ─── Job Cell Popover ─── */
function JobPopoverContent({
  jobs,
  onComplete,
  onAbsence,
  onDelete,
  onAssignCleaner,
  lang,
}: {
  jobs: ApiJob[];
  onComplete: (jobId: string) => void;
  onAbsence: (cleanerId: string, date: string) => void;
  onDelete: (jobId: string) => void;
  onAssignCleaner?: (jobId: string) => void;
  lang: "pt" | "en";
}) {
  const { format } = useCurrency();
  return (
    <>
      {jobs.map((j) => (
        <div key={j.id} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{j.client.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{j.startTime} – {j.endTime} · {format(Number(j.cost || 0))}</p>
            </div>
            <button
              onClick={() => onDelete(j.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
              title={lang === "pt" ? "Excluir serviço" : "Delete service"}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {j.status === "SCHEDULED" && (
              <>
                <button
                  onClick={() => onComplete(j.id)}
                  className="flex items-center gap-1 rounded-lg bg-[#F0FDF4] dark:bg-emerald-900/30 px-2.5 py-1.5 text-xs font-medium text-[#15803D] dark:text-emerald-300 hover:bg-[#DCFCE7] dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Check className="h-3 w-3" /> {lang === "pt" ? "Concluído" : "Complete"}
                </button>
                {j.cleanerId && (
                  <button
                    onClick={() => onAbsence(j.cleanerId!, j.date)}
                    className="flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 text-xs font-medium text-[#BA7517] dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <AlertTriangle className="h-3 w-3" /> {lang === "pt" ? "Ausência" : "Absence"}
                  </button>
                )}
              </>
            )}
            {/* Assign cleaner button for uncovered jobs */}
            {!j.cleanerId && onAssignCleaner && (
              <button
                onClick={() => onAssignCleaner(j.id)}
                className="flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <UserPlus className="h-3 w-3" /> {lang === "pt" ? "Atribuir colaboradora" : "Assign cleaner"}
              </button>
            )}
            <StatusBadge
              status={j.status === "COMPLETED" ? "concluido" : j.status === "ABSENT" ? "ausente" : j.status === "SCHEDULED" ? "ativo" : j.status === "UNCOVERED" ? "pendente" : "pendente"}
              size="xs"
            />
          </div>
        </div>
      ))}
    </>
  );
}

function JobPopover({
  jobs,
  onClose,
  onComplete,
  onAbsence,
  onDelete,
  onAssignCleaner,
  lang,
  anchorRef,
}: {
  jobs: ApiJob[];
  onClose: () => void;
  onComplete: (jobId: string) => void;
  onAbsence: (cleanerId: string, date: string) => void;
  onDelete: (jobId: string) => void;
  onAssignCleaner?: (jobId: string) => void;
  lang: "pt" | "en";
  anchorRef?: React.RefObject<HTMLTableCellElement | null>;
}) {
  const rect = anchorRef?.current?.getBoundingClientRect();

  if (rect) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-[100]" onClick={onClose} />
        <div
          className="fixed z-[101] w-80 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 p-4 shadow-xl animate-in fade-in zoom-in-95"
          style={{
            top: rect.bottom + 6,
            left: Math.max(8, rect.left + rect.width / 2 - 160),
          }}
        >
          <JobPopoverContent jobs={jobs} onComplete={onComplete} onAbsence={onAbsence} onDelete={onDelete} onAssignCleaner={onAssignCleaner} lang={lang} />
        </div>
      </>,
      document.body
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute z-50 w-80 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 p-4 shadow-xl animate-in fade-in zoom-in-95 -translate-x-1/2 left-1/2 top-full mt-1">
        <JobPopoverContent jobs={jobs} onComplete={onComplete} onAbsence={onAbsence} onDelete={onDelete} onAssignCleaner={onAssignCleaner} lang={lang} />
      </div>
    </>
  );
}

/* ─── Day Cell ─── */
function DayCell({ jobs, isWeekend, onClick, isAbsent, lang, onDelete }: {
  jobs: ApiJob[];
  isWeekend: boolean;
  onClick: () => void;
  isAbsent: boolean;
  lang: "pt" | "en";
  onDelete?: (jobId: string) => void;
}) {
  if (jobs.length === 0) {
    return (
      <div
        className="h-full min-h-[44px] flex items-center justify-center rounded-lg border-2 border-dashed border-transparent hover:border-[#22C55E]/40 transition-all group/cell cursor-pointer hover:bg-[#F0FDF4]/50 dark:hover:bg-emerald-900/20"
        onClick={onClick}
      >
        <span className="text-lg text-gray-300 dark:text-gray-600 group-hover/cell:text-[#22C55E] transition-all">+</span>
      </div>
    );
  }

  if (isAbsent) {
    return (
      <div
        className="relative group/cell flex items-center justify-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-2 py-1.5 cursor-pointer"
        onClick={onClick}
      >
        <AlertTriangle className="h-3.5 w-3.5 text-[#BA7517] dark:text-amber-400" />
        <span className="text-xs font-medium text-[#BA7517] dark:text-amber-300">{lang === "pt" ? "Ausente" : "Absent"}</span>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(jobs[0].id); }}
            className="absolute top-0 right-0 opacity-0 group-hover/cell:opacity-100 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all z-10"
            title={lang === "pt" ? "Excluir" : "Delete"}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  const totalServices = jobs.length;
  const totalHours = jobs.reduce((s, j) => s + Number(j.hoursWorked || 0), 0);

  return (
    <div
      className={`relative group/cell rounded-lg px-2 py-1.5 cursor-pointer transition-all hover:shadow-md ${isWeekend ? "bg-[#F0FDF4] dark:bg-emerald-900/40" : "bg-[#F0FDF4]/50 dark:bg-emerald-900/20"}`}
      onClick={onClick}
    >
      <div className="text-xs text-center">
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {totalServices} {lang === "pt" ? (totalServices !== 1 ? "serviços" : "serviço") : (totalServices !== 1 ? "services" : "service")}
        </span>
        <span className="block text-gray-400 dark:text-gray-500 text-[11px]">{totalHours.toFixed(0)}h</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (totalServices === 1) {
              onDelete(jobs[0].id);
            } else {
              // For multiple services, open the popover (handled by onClick)
              onClick();
            }
          }}
          className="absolute top-0 right-0 opacity-0 group-hover/cell:opacity-100 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all z-10"
          title={lang === "pt" ? "Excluir" : "Delete"}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/* ─── Cleaner Picker Dropdown (portal-based to avoid overflow clip) ─── */
function CleanerPicker({
  cleaners,
  onSelect,
  onClose,
  anchorRef,
  lang,
}: {
  cleaners: ApiCleaner[];
  onSelect: (cleaner: ApiCleaner) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  lang: "pt" | "en";
}) {
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, [anchorRef]);

  const filtered = cleaners.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <div
        className="fixed z-[101] w-64 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 py-2 shadow-xl animate-in fade-in zoom-in-95"
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "pt" ? "Buscar colaboradora..." : "Search cleaner..."}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1.5 pl-7 pr-3 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30"
            />
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 && cleaners.length > 0 && (
            <p className="px-3 py-3 text-center text-xs text-gray-400">
              {lang === "pt" ? "Nenhuma colaboradora encontrada" : "No cleaners found"}
            </p>
          )}
          {filtered.map((c) => {
            const avatarColor = c.avatarColor ? { bg: c.avatarColor, text: "#fff" } : getAvatarColor(c.name);
            const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <button
                key={c.id}
                onClick={() => { onSelect(c); onClose(); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F0FDF4] dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.hourlyRate ? `R$${c.hourlyRate}/h` : ""}</p>
                </div>
              </button>
            );
          })}
        </div>
        {cleaners.length === 0 && (
          <div className="px-3 py-3 text-center">
            <p className="text-xs text-gray-400 mb-2">
              {lang === "pt" ? "Nenhuma colaboradora cadastrada" : "No cleaners registered"}
            </p>
            <a
              href="/colaboradores"
              className="text-xs font-medium text-[#22C55E] hover:underline"
            >
              {lang === "pt" ? "Cadastrar colaboradora →" : "Register cleaner →"}
            </a>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

/* ─── Service Configuration Drawer ─── */
const serviceTypes = [
  { value: "standard", label: { pt: "Limpeza padrão", en: "Standard cleaning" } },
  { value: "deep", label: { pt: "Limpeza pesada", en: "Deep cleaning" } },
  { value: "post-construction", label: { pt: "Pós-obra", en: "Post-construction" } },
  { value: "airbnb", label: { pt: "Airbnb", en: "Airbnb" } },
  { value: "other", label: { pt: "Outro", en: "Other" } },
];

// Duration in 30-min steps: 1h (2 steps) to 8h (16 steps)
function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = (hours - h) * 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function ServiceConfigDrawer({
  client,
  date,
  cleaners,
  preSelectedCleaner,
  lang,
  onConfirm,
  onClose,
  isSubmitting = false,
  editableDate = false,
}: {
  client: any;
  date: string;
  cleaners: ApiCleaner[];
  preSelectedCleaner: ApiCleaner | null;
  lang: "pt" | "en";
  onConfirm: (config: { clientId: string; cleanerId: string | null; startTime: string; endTime: string; serviceType: string; notes: string; date?: string }) => void;
  onClose: () => void;
  isSubmitting?: boolean;
  editableDate?: boolean;
}) {
  const { format, currency } = useCurrency();
  const [serviceType, setServiceType] = useState("standard");
  const [startTime, setStartTime] = useState("08:00");
  const [durationSteps, setDurationSteps] = useState(8); // 8 steps = 4h (each step = 30min)
  const [selectedCleaner, setSelectedCleaner] = useState<ApiCleaner | null>(preSelectedCleaner);
  const [showCleanerDropdown, setShowCleanerDropdown] = useState(false);

  // Fetch service prices
  const { data: servicePrices } = useQuery<any[]>({
    queryKey: ["service-prices"],
    queryFn: () => api.get("/service-prices"),
    staleTime: 60000,
  });

  const getServicePrice = (type: string): number => {
    const sp = servicePrices?.find((p: any) => p.serviceType === type);
    if (!sp) return 0;
    const key = `price${currency}` as string;
    return Number(sp[key]) || Number(sp.priceBRL) || 0;
  };
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(date);
  const cleanerBtnRef = useRef<HTMLButtonElement>(null);

  const durationHours = durationSteps * 0.5;
  const endTime = useMemo(() => {
    const [h, m] = startTime.split(":").map(Number);
    const totalMin = (h * 60 + m) + durationSteps * 30;
    const endH = Math.min(Math.floor(totalMin / 60), 23);
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  }, [startTime, durationSteps]);

  const dateLabel = new Date((editableDate ? selectedDate : date) + "T00:00:00").toLocaleDateString(
    lang === "pt" ? "pt-BR" : "en-GB",
    { weekday: "long", day: "2-digit", month: "long" }
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {lang === "pt" ? "Configurar serviço" : "Configure service"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Client info */}
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.name}</p>
              <p className="text-xs text-gray-500">{client.address || dateLabel}</p>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {lang === "pt" ? "Data" : "Date"}
            </label>
            {editableDate ? (
              <div className="mt-1.5 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30"
                />
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border dark:border-gray-700 px-3 py-2.5 bg-gray-50 dark:bg-gray-800">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-800 dark:text-gray-200 capitalize">{dateLabel}</span>
              </div>
            )}
          </div>

          {/* Service type */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {lang === "pt" ? "Tipo de serviço" : "Service type"}
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {serviceTypes.map((st) => (
                <button
                  key={st.value}
                  onClick={() => setServiceType(st.value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all text-left ${
                    serviceType === st.value
                      ? "border-[#22C55E] bg-[#F0FDF4] text-[#15803D] dark:bg-[#22C55E]/10 dark:text-[#22C55E]"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <span className="block">{st.label[lang]}</span>
                  {(() => {
                    const p = getServicePrice(st.value);
                    if (!p) return null;
                    const currencySymbols: Record<string, string> = { BRL: "R$", USD: "$", GBP: "£", EUR: "€" };
                    return <span className="block text-[10px] opacity-70 mt-0.5">{currencySymbols[currency] || "R$"} {p.toFixed(2)}</span>;
                  })()}
                </button>
              ))}
            </div>
          </div>

          {/* Start time */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {lang === "pt" ? "Horário de início" : "Start time"}
            </label>
            <div className="mt-1.5 relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30"
              />
            </div>
          </div>

          {/* Duration — slider */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {lang === "pt" ? "Duração" : "Duration"}
              </label>
              <span className="text-sm font-semibold text-[#22C55E]">{formatDuration(durationHours)}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => setDurationSteps(Math.max(2, durationSteps - 1))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg font-medium"
              >
                −
              </button>
              <input
                type="range"
                min={2}
                max={16}
                step={1}
                value={durationSteps}
                onChange={(e) => setDurationSteps(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-[#22C55E] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#22C55E] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-grab"
              />
              <button
                onClick={() => setDurationSteps(Math.min(16, durationSteps + 1))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg font-medium"
              >
                +
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {startTime} → {endTime}
            </p>
          </div>

          {/* Cleaner (optional) */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {lang === "pt" ? "Colaboradora (opcional)" : "Cleaner (optional)"}
            </label>
            <div className="mt-1.5 relative">
              <button
                ref={cleanerBtnRef}
                onClick={() => setShowCleanerDropdown(!showCleanerDropdown)}
                className="w-full flex items-center gap-2.5 rounded-xl border dark:border-gray-700 px-3 py-2.5 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left"
              >
                {selectedCleaner ? (
                  <>
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: selectedCleaner.avatarColor || "#22C55E",
                        color: "#fff",
                      }}
                    >
                      {selectedCleaner.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{selectedCleaner.name}</p>
                      <p className="text-[10px] text-gray-400">{format(Number(selectedCleaner.hourlyRate))}/h</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <UserPlus className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">
                      {lang === "pt" ? "Selecionar colaboradora" : "Select cleaner"}
                    </span>
                  </>
                )}
                <ChevronDown className="h-4 w-4 text-gray-400 ml-auto shrink-0" />
              </button>

              {showCleanerDropdown && createPortal(
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setShowCleanerDropdown(false)} />
                  <div
                    className="fixed z-[101] w-72 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-xl max-h-56 overflow-y-auto animate-in fade-in zoom-in-95"
                    style={{
                      top: (cleanerBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                      left: cleanerBtnRef.current?.getBoundingClientRect().left ?? 0,
                    }}
                  >
                    {/* Option to unassign */}
                    {selectedCleaner && (
                      <button
                        onClick={() => { setSelectedCleaner(null); setShowCleanerDropdown(false); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-left border-b dark:border-gray-800"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
                          <X className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-500">
                          {lang === "pt" ? "Sem colaboradora (descoberto)" : "No cleaner (uncovered)"}
                        </span>
                      </button>
                    )}
                    {cleaners.map((c) => {
                      const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      const color = c.avatarColor || "#22C55E";
                      return (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCleaner(c); setShowCleanerDropdown(false); }}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors ${
                            selectedCleaner?.id === c.id ? "bg-[#F0FDF4] dark:bg-[#22C55E]/10" : ""
                          }`}
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: color, color: "#fff" }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
                            <p className="text-[10px] text-gray-400">{format(Number(c.hourlyRate))}/h</p>
                          </div>
                          {selectedCleaner?.id === c.id && <Check className="h-4 w-4 text-[#22C55E] ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                    {cleaners.length === 0 && (
                      <div className="px-3 py-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">{lang === "pt" ? "Nenhuma colaboradora" : "No cleaners"}</p>
                        <a href="/colaboradores" className="text-xs font-medium text-[#22C55E] hover:underline">
                          {lang === "pt" ? "Cadastrar →" : "Register →"}
                        </a>
                      </div>
                    )}
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {lang === "pt" ? "Observações" : "Notes"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={lang === "pt" ? "Instruções especiais..." : "Special instructions..."}
              className="mt-1.5 w-full rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30 resize-none"
            />
          </div>

          {/* Cost preview — based on service price */}
          {(() => {
            const price = getServicePrice(serviceType);
            if (!price) return null;
            const currencySymbols: Record<string, string> = { BRL: "R$", USD: "$", GBP: "£", EUR: "€" };
            const sym = currencySymbols[currency] || "R$";
            return (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">{lang === "pt" ? "Valor do serviço" : "Service price"}</span>
                <span className="text-sm font-semibold text-[#22C55E]">
                  {sym} {price.toFixed(2)}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {lang === "pt" ? "Cancelar" : "Cancel"}
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => onConfirm({
              clientId: client.id,
              cleanerId: selectedCleaner?.id ?? null,
              startTime,
              endTime,
              serviceType,
              notes,
              ...(editableDate ? { date: selectedDate } : {}),
            })}
            className="flex-1 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {lang === "pt" ? "Confirmar" : "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Client Picker Dropdown (portal-based, for adding services) ─── */
function ClientPicker({
  clients,
  onSelect,
  onClose,
  anchorRef,
  lang,
}: {
  clients: any[];
  onSelect: (client: any) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  lang: "pt" | "en";
}) {
  const rect = anchorRef.current?.getBoundingClientRect();
  if (!rect) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <div
        className="fixed z-[101] w-64 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-xl max-h-64 overflow-y-auto animate-in fade-in zoom-in-95"
        style={{ top: rect.bottom + 4, left: rect.left }}
      >
        <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {lang === "pt" ? "Selecionar cliente" : "Select client"}
        </p>
        <div className="py-1">
          {clients.map((c: any) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <Building2 className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{c.name}</p>
                {c.address && <p className="truncate text-[10px] text-gray-400">{c.address}</p>}
              </div>
            </button>
          ))}
        </div>
        {clients.length === 0 && (
          <div className="px-3 py-3 text-center">
            <p className="text-xs text-gray-400 mb-2">
              {lang === "pt" ? "Nenhum cliente cadastrado" : "No clients registered"}
            </p>
            <a href="/clientes" className="text-xs font-medium text-[#22C55E] hover:underline">
              {lang === "pt" ? "Adicionar cliente →" : "Add client →"}
            </a>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

/* ─── Empty Board Placeholder ─── */
function EmptyWeekBoard({
  weekStart,
  weekDates,
  lang,
  templates,
  cleaners,
  clients,
  scheduleId,
  onGenerate,
  isGenerating,
  onCleanerSelected,
  onJobCreated,
}: {
  weekStart: string;
  weekDates: { date: string }[];
  lang: "pt" | "en";
  templates: any[] | undefined;
  cleaners: ApiCleaner[];
  clients: any[];
  scheduleId: string | null;
  onGenerate: (templateId: string) => void;
  isGenerating: boolean;
  onCleanerSelected: (cleaner: ApiCleaner, rowIdx: number) => void;
  onJobCreated: () => void;
}) {
  const { format } = useCurrency();
  const [openPickerRow, setOpenPickerRow] = useState<number | null>(null);
  const [openClientPicker, setOpenClientPicker] = useState<{ rowIdx: number; dayIdx: number } | null>(null);
  const [selectedCleaners, setSelectedCleaners] = useState<Record<number, ApiCleaner>>({});
  const [showTip, setShowTip] = useState(true);
  const [rowCount, setRowCount] = useState(3);

  // Dynamic refs for row anchors
  const rowRefsMap = useRef<Record<number, HTMLDivElement | null>>({});

  // Refs for day cells (for client picker positioning)
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const availableCleaners = (rowIdx: number) => {
    const pickedIds = Object.entries(selectedCleaners)
      .filter(([idx]) => Number(idx) !== rowIdx)
      .map(([, c]) => c.id);
    return cleaners.filter((c) => !pickedIds.includes(c.id));
  };

  const handleSelect = (cleaner: ApiCleaner, rowIdx: number) => {
    setSelectedCleaners((prev) => ({ ...prev, [rowIdx]: cleaner }));
    setShowTip(false);
    onCleanerSelected(cleaner, rowIdx);
  };

  // Drawer state: after selecting a client, open drawer to configure
  const [drawerConfig, setDrawerConfig] = useState<{ client: any; dayIdx: number; rowIdx: number } | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const handleClientSelect = (client: any) => {
    if (!openClientPicker) return;
    const { rowIdx, dayIdx } = openClientPicker;
    setOpenClientPicker(null);
    setDrawerConfig({ client, dayIdx, rowIdx });
  };

  const handleServiceConfirm = async (config: {
    clientId: string;
    cleanerId: string | null;
    startTime: string;
    endTime: string;
    serviceType: string;
    notes: string;
  }) => {
    if (!drawerConfig) return;
    setIsCreatingJob(true);

    try {
      // Ensure a weekly schedule exists (create empty one if not)
      let sid = scheduleId;
      if (!sid) {
        const week = await api.post<any>("/schedule/weeks", { weekStart });
        sid = week.id;
      }

      const dateStr = weekDates[drawerConfig.dayIdx]?.date;
      if (!dateStr || !sid) return;

      await api.post("/schedule/jobs", {
        scheduleId: sid,
        cleanerId: config.cleanerId,
        clientId: config.clientId,
        date: dateStr,
        startTime: config.startTime,
        endTime: config.endTime,
        status: config.cleanerId ? "SCHEDULED" : "UNCOVERED",
        notes: config.notes || null,
        serviceType: config.serviceType || "standard",
      });

      // If a cleaner was selected, auto-place them in the row
      if (config.cleanerId) {
        const cleaner = cleaners.find((c) => c.id === config.cleanerId);
        if (cleaner) {
          setSelectedCleaners((prev) => ({ ...prev, [drawerConfig.rowIdx]: cleaner }));
        }
      }

      toast.success(
        lang === "pt"
          ? `Serviço configurado: ${drawerConfig.client.name}`
          : `Service configured: ${drawerConfig.client.name}`
      );
      onJobCreated();
    } catch (e: any) {
      const msg = e.message || "";
      // Parse bilingual error "PT message | EN message"
      if (msg.includes(" | ")) {
        const parts = msg.split(" | ");
        toast.error(lang === "pt" ? parts[0] : parts[1]);
      } else {
        toast.error(msg || (lang === "pt" ? "Erro ao adicionar" : "Error adding service"));
      }
      setIsCreatingJob(false);
      return; // Keep drawer open so user can fix
    }
    setIsCreatingJob(false);
    setDrawerConfig(null);
  };

  return (
    <div className="relative">
      {/* Empty board table */}
      <div className="overflow-x-auto rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900">

      {/* Floating overlay tooltip — on top of the board */}
      {showTip && (
        <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-4 px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#22C55E]/25 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg px-5 py-3 max-w-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCFCE7] shrink-0">
              <Sparkles className="h-4 w-4 text-[#22C55E]" />
            </div>
            <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
              {lang === "pt"
                ? "Vamos organizar a semana? Clique nos dias para adicionar serviços ou selecione colaboradoras."
                : "Let's organize the week? Click on days to add services or select cleaners."}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {templates && templates.length > 0 && (
                <Button
                  size="sm"
                  className="bg-[#22C55E] hover:bg-[#16A34A] h-7 text-xs rounded-xl"
                  onClick={() => onGenerate(templates[0].id)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Calendar className="h-3 w-3 mr-1" />
                  )}
                  {lang === "pt" ? "Gerar do template" : "From template"}
                </Button>
              )}
              <button
                onClick={() => setShowTip(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <th className="sticky left-0 z-10 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 min-w-[220px]">
                {lang === "pt" ? "Colaboradora" : "Cleaner"}
              </th>
              {dayKeys.map((key, i) => {
                const isWeekend = key === "sab" || key === "dom";
                const wd = weekDates[i];
                return (
                  <th
                    key={key}
                    className={`px-3 py-3 text-center font-medium text-gray-500 dark:text-gray-400 min-w-[100px] ${isWeekend ? "bg-[#F0FDF4]/40 dark:bg-emerald-900/20" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="flex items-center gap-1">
                        {weekDaysI18n[key]?.[lang]}
                        {isWeekend && (
                          <span className="inline-flex items-center rounded bg-[#F0FDF4] dark:bg-emerald-900/40 px-1 py-0.5 text-[10px] font-bold text-[#15803D] dark:text-emerald-300">1.5×</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {wd ? new Date(wd.date + "T00:00:00").toLocaleDateString(lang === "pt" ? "pt-BR" : "en-GB", { day: "2-digit", month: "2-digit" }) : ""}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="px-2 py-3 text-center font-medium text-gray-500 dark:text-gray-400 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIdx) => {
              const picked = selectedCleaners[rowIdx];
              const avatarColor = picked
                ? picked.avatarColor ? { bg: picked.avatarColor, text: "#fff" } : getAvatarColor(picked.name)
                : null;
              const initials = picked
                ? picked.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : "";

              return (
                <tr key={rowIdx} className="border-b dark:border-gray-800 last:border-0 group/row">
                  {/* Avatar slot — picker */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 py-3">
                    <div ref={(el) => { rowRefsMap.current[rowIdx] = el; }} className="flex items-center gap-2.5">
                      {picked ? (
                        <>
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold cursor-pointer"
                            style={{ backgroundColor: avatarColor!.bg, color: avatarColor!.text }}
                            onClick={() => setOpenPickerRow(openPickerRow === rowIdx ? null : rowIdx)}
                            title={lang === "pt" ? "Trocar colaboradora" : "Change cleaner"}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{picked.name}</p>
                            <p className="text-xs text-gray-400">{format(Number(picked.hourlyRate))}/h</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#93C5FD] cursor-pointer hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-all group/avatar"
                            onClick={() => setOpenPickerRow(openPickerRow === rowIdx ? null : rowIdx)}
                            title={lang === "pt" ? "Selecionar colaboradora" : "Select cleaner"}
                          >
                            <Plus className="h-3.5 w-3.5 text-[#93C5FD] group-hover/avatar:text-[#3B82F6] transition-colors" />
                          </div>
                          <div
                            className="min-w-0 cursor-pointer"
                            onClick={() => setOpenPickerRow(openPickerRow === rowIdx ? null : rowIdx)}
                          >
                            <p className="text-sm text-gray-300 font-medium hover:text-[#22C55E] transition-colors">
                              {lang === "pt" ? "Selecionar colaboradora" : "Select cleaner"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {openPickerRow === rowIdx && (
                      <CleanerPicker
                        cleaners={availableCleaners(rowIdx)}
                        onSelect={(c) => handleSelect(c, rowIdx)}
                        onClose={() => setOpenPickerRow(null)}
                        anchorRef={{ current: rowRefsMap.current[rowIdx] }}
                        lang={lang}
                      />
                    )}
                  </td>
                  {/* Empty day cells */}
                  {dayKeys.map((key, dayIdx) => {
                    const isWeekend = key === "sab" || key === "dom";
                    const cellKey = `${rowIdx}-${dayIdx}`;
                    return (
                      <td key={key} className={`px-2 py-2 text-center ${isWeekend ? "bg-[#F0FDF4]/20 dark:bg-emerald-900/10" : ""}`}>
                        <div
                          ref={(el) => { cellRefs.current[cellKey] = el; }}
                          className="h-full min-h-[44px] flex items-center justify-center rounded-lg border-2 border-dashed border-[#BFDBFE] dark:border-blue-800 hover:border-[#3B82F6]/50 transition-all group/cell cursor-pointer hover:bg-[#EFF6FF]/50 dark:hover:bg-blue-900/20"
                          onClick={() => {
                            setOpenClientPicker(
                              openClientPicker?.rowIdx === rowIdx && openClientPicker?.dayIdx === dayIdx
                                ? null
                                : { rowIdx, dayIdx }
                            );
                            setOpenPickerRow(null);
                          }}
                          title={lang === "pt" ? "Adicionar serviço" : "Add service"}
                        >
                          <Plus className="h-4 w-4 text-[#93C5FD] group-hover/cell:text-[#3B82F6] transition-all" />
                        </div>
                        {openClientPicker?.rowIdx === rowIdx && openClientPicker?.dayIdx === dayIdx && (
                          <ClientPicker
                            clients={clients}
                            onSelect={handleClientSelect}
                            onClose={() => setOpenClientPicker(null)}
                            anchorRef={{ current: cellRefs.current[cellKey] }}
                            lang={lang}
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-3"></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add new row button */}
        <div className="px-4 py-2 border-t">
          <button
            onClick={() => setRowCount((c) => c + 1)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#93C5FD] hover:text-[#3B82F6] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === "pt" ? "Adicionar linha" : "Add row"}
          </button>
        </div>
      </div>

      {/* Service Configuration Drawer */}
      {drawerConfig && (
        <ServiceConfigDrawer
          client={drawerConfig.client}
          date={weekDates[drawerConfig.dayIdx]?.date ?? weekStart}
          cleaners={cleaners}
          preSelectedCleaner={selectedCleaners[drawerConfig.rowIdx] ?? null}
          lang={lang}
          onConfirm={handleServiceConfirm}
          onClose={() => setDrawerConfig(null)}
          isSubmitting={isCreatingJob}
        />
      )}
    </div>
  );
}

/* ─── Skeleton Loaders ─── */
function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr] gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-white p-4 h-24 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse shrink-0" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { language } = useLanguage();
  const { format } = useCurrency();
  const queryClient = useQueryClient();
  const { weekStart, goBack, goForward } = useWeekNavigation();
  const searchParams = useSearchParams();

  // Handle checkout return
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      toast.success(language === "pt" ? "Assinatura ativada! Bem-vinda ao Shiftsly Pro." : "Subscription activated! Welcome to Shiftsly Pro.");
      window.history.replaceState({}, "", "/dashboard");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    } else if (checkoutStatus === "cancelled") {
      toast.info(language === "pt" ? "Checkout cancelado. Você pode tentar novamente quando quiser." : "Checkout cancelled. You can try again anytime.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [popoverCell, setPopoverCell] = useState<{ cleanerId: string; dayIdx: number } | null>(null);
  const dayCellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const [assignJobId, setAssignJobId] = useState<string | null>(null);
  const [extraRows, setExtraRows] = useState(2); // placeholder rows in filled schedule

  // Standalone drawer state — opened from external pages (e.g., /clientes → "Atribuir serviço")
  const [standaloneDrawer, setStandaloneDrawer] = useState<{ client: any; date: string } | null>(null);
  const [isStandaloneSubmitting, setIsStandaloneSubmitting] = useState(false);

  // Handle ?assignClientId= URL param from clients page
  useEffect(() => {
    const clientId = searchParams.get("assignClientId");
    const clientName = searchParams.get("assignClientName");
    if (clientId && clientName) {
      const today = new Date().toISOString().split("T")[0];
      setStandaloneDrawer({
        client: { id: clientId, name: decodeURIComponent(clientName) },
        date: today,
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  // Close popover on scroll to prevent floating bug
  useEffect(() => {
    if (!popoverCell) return;
    const handler = () => setPopoverCell(null);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [popoverCell]);

  // --- Data Fetching ---
  const { data: weekData, isLoading: weekLoading, error: weekError } = useQuery<ApiWeek>({
    queryKey: ["week", weekStart],
    queryFn: () => api.get(`/schedule/weeks/${weekStart}`),
    retry: false,
  });

  const { data: cleanersData } = useQuery<ApiCleaner[]>({
    queryKey: ["cleaners-active"],
    queryFn: () => api.get("/cleaners?status=ACTIVE"),
  });

  const { data: absencesData } = useQuery<ApiAbsence[]>({
    queryKey: ["absences", weekStart],
    queryFn: () => {
      const end = new Date(weekStart + "T00:00:00");
      end.setDate(end.getDate() + 6);
      return api.get(`/absences?from=${weekStart}&to=${end.toISOString().split("T")[0]}&covered=false`);
    },
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const { data: todayJobs } = useQuery<ApiJob[]>({
    queryKey: ["jobs-today", todayStr],
    queryFn: () => api.get(`/schedule/jobs?date=${todayStr}`),
    retry: false,
  });

  const { data: clientsData } = useQuery<any[]>({
    queryKey: ["clients-all"],
    queryFn: () => api.get<any[]>("/clients"),
    staleTime: 60000,
  });

  // --- Mutations ---
  const generateWeekMut = useMutation({
    mutationFn: (templateId: string) =>
      api.post("/schedule/weeks", { weekStart, templateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week", weekStart] });
      toast.success(language === "pt" ? "Semana gerada!" : "Week generated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: templates } = useQuery<any[]>({
    queryKey: ["templates"],
    queryFn: () => api.get("/schedule/template"),
  });

  const completeJobMut = useMutation({
    mutationFn: (jobId: string) =>
      api.put(`/schedule/jobs/${jobId}`, { status: "COMPLETED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week", weekStart] });
      queryClient.invalidateQueries({ queryKey: ["jobs-today"] });
      toast.success(language === "pt" ? "Serviço concluído!" : "Service completed!");
      setPopoverCell(null);
    },
  });

  const registerAbsenceMut = useMutation({
    mutationFn: ({ cleanerId, date }: { cleanerId: string; date: string }) =>
      api.post("/absences", { cleanerId, date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week", weekStart] });
      queryClient.invalidateQueries({ queryKey: ["absences", weekStart] });
      toast.success(language === "pt" ? "Ausência registrada!" : "Absence registered!");
      setPopoverCell(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const closeWeekMut = useMutation({
    mutationFn: () => api.put(`/schedule/weeks/${weekStart}`, { status: "CLOSED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week", weekStart] });
      toast.success(language === "pt" ? "Semana fechada!" : "Week closed!");
    },
  });

  const deleteJobMut = useMutation({
    mutationFn: (jobId: string) => api.delete(`/schedule/jobs/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week", weekStart] });
      queryClient.invalidateQueries({ queryKey: ["jobs-today"] });
      toast.success(language === "pt" ? "Serviço excluído!" : "Service deleted!");
      setPopoverCell(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignCleanerMut = useMutation({
    mutationFn: ({ jobId, cleanerId }: { jobId: string; cleanerId: string }) =>
      api.put(`/schedule/jobs/${jobId}`, { cleanerId, status: "SCHEDULED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week", weekStart] });
      queryClient.invalidateQueries({ queryKey: ["jobs-today"] });
      toast.success(language === "pt" ? "Colaboradora atribuída!" : "Cleaner assigned!");
      setAssignJobId(null);
      setPopoverCell(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // --- Computed values ---
  const jobs = weekData?.jobs ?? [];
  const weekDates = getWeekDates(weekStart);
  const { cleanerMap, uncoveredDays } = useMemo(() => buildGrid(jobs), [jobs]);
  const weekNotFound = !weekLoading && weekError;
  const weekEmpty = !weekLoading && weekData && jobs.length === 0;

  const activeCleanerCount = cleanersData?.length ?? 0;
  const uncoveredCount = Object.values(uncoveredDays).flat().length;
  const alertCount = (absencesData?.length ?? 0);

  const kpiData = {
    custoDaSemana: Number(weekData?.totalCost ?? 0),
    custoVariacao: 0,
    horasRegistradas: jobs.reduce((s, j) => s + Number(j.hoursWorked || 0), 0).toFixed(0) + "h",
    servicosDescobertos: uncoveredCount,
    pendencias: alertCount,
  };

  // Filter cleaners in grid
  let cleanerEntries = Array.from(cleanerMap.entries());
  if (searchTerm) {
    cleanerEntries = cleanerEntries.filter(([, v]) =>
      v.cleaner?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (activeFilter === "ausencia") {
    cleanerEntries = cleanerEntries.filter(([, v]) =>
      Object.values(v.days).some((dayJobs) => dayJobs.some((j) => j.status === "ABSENT"))
    );
  }
  if (activeFilter === "semServicos") {
    cleanerEntries = cleanerEntries.filter(([, v]) =>
      Object.values(v.days).flat().length === 0
    );
  }

  // Build chart data
  const custoPorDiarista = cleanerEntries.map(([, v]) => ({
    nome: v.cleaner?.name ?? "",
    iniciais: (v.cleaner?.name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    cor: "#22C55E",
    custo: Object.values(v.days).flat().reduce((s, j) => s + Number(j.cost || 0), 0),
    horasExtras: 0,
  }));

  const servicosSemana = dayKeys.map((key, i) => ({
    dia: weekDaysI18n[key]?.[language] ?? key,
    total: jobs.filter((j) => {
      const ds = typeof j.date === "string" ? j.date.split("T")[0] : j.date;
      const d = new Date(ds + "T00:00:00");
      const dow = d.getDay();
      return (dow === 0 ? 6 : dow - 1) === i;
    }).length,
    hoje: weekDates[i]?.date === todayStr,
  }));

  const servicosHojeData = (todayJobs ?? []).slice(0, 5).map((j) => ({
    id: j.id,
    cliente: j.client.name,
    diarista: j.cleaner?.name ?? (language === "pt" ? "Sem atribuição" : "Unassigned"),
    horarioInicio: j.startTime,
    horarioFim: j.endTime,
    status: (j.status === "COMPLETED" ? "concluido" : j.status === "ABSENT" ? "descoberto" : "em-servico") as any,
    tipoServico: "" as any,
  }));

  const diaristaStatusData = (cleanersData ?? [])
    .filter((c) => (todayJobs ?? []).some((j) => j.cleanerId === c.id))
    .slice(0, 6)
    .map((c) => {
      const cJobs = (todayJobs ?? []).filter((j) => j.cleanerId === c.id);
      const hasAbsence = cJobs.some((j) => j.status === "ABSENT");
      const hasBusy = cJobs.some((j) => j.status === "SCHEDULED" || j.status === "COMPLETED");
      return {
        nome: c.name,
        iniciais: c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        cor: c.avatarColor || "#22C55E",
        tarefa: `${cJobs.length} ${language === "pt" ? "serviço(s)" : "service(s)"}`,
        status: (hasAbsence ? "ausente" : hasBusy ? "ocupada" : "livre") as any,
      };
    });

  // Build active routes from today's SCHEDULED jobs (services currently happening)
  const activeRoutes = useMemo(() => {
    const now = new Date();
    return (todayJobs ?? [])
      .filter((j) => j.status === "SCHEDULED" && j.cleaner)
      .map((j) => {
        const [startH, startM] = (j.startTime || "08:00").split(":").map(Number);
        const [endH, endM] = (j.endTime || "12:00").split(":").map(Number);
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
        const progress = (now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime());

        let status: "iniciando" | "em-servico" | "quase-no-fim" | "atrasada" = "em-servico";
        if (progress < 0.1) status = "iniciando";
        else if (progress > 1) status = "atrasada";
        else if (progress > 0.85) status = "quase-no-fim";

        const avatarColor = j.cleaner?.avatarColor
          ? { bg: j.cleaner.avatarColor }
          : getAvatarColor(j.cleaner?.name || "");
        const initials = (j.cleaner?.name || "")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return {
          id: j.id,
          diarista: {
            nome: j.cleaner?.name || "",
            iniciais: initials,
            corAvatar: avatarColor.bg,
          },
          local: j.client.name,
          tipoServico: language === "pt" ? "Limpeza" : "Cleaning",
          inicioISO: startDate.toISOString(),
          terminoPrevisoISO: endDate.toISOString(),
          status,
        };
      });
  }, [todayJobs, language]);

  // Export week as PDF-style data
  const handleExport = () => {
    if (!weekData || jobs.length === 0) {
      toast.error(language === "pt" ? "Nenhum dado para exportar" : "No data to export");
      return;
    }

    const todayFull = new Date().toLocaleDateString(language === "pt" ? "pt-BR" : "en-GB", { dateStyle: "full" });
    const completedJobs = jobs.filter((j) => j.status === "COMPLETED").length;
    const totalJobs = jobs.length;
    const progress = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    let csvContent = `Shiftsly — ${language === "pt" ? "Relatório da Semana" : "Week Report"}\n`;
    csvContent += `${language === "pt" ? "Período" : "Period"}: ${formatWeekRange(weekStart, language)}\n`;
    csvContent += `${language === "pt" ? "Gerado em" : "Generated on"}: ${todayFull}\n`;
    csvContent += `${language === "pt" ? "Progresso" : "Progress"}: ${completedJobs}/${totalJobs} (${progress}%)\n`;
    csvContent += `${language === "pt" ? "Custo total" : "Total cost"}: ${format(Number(weekData.totalCost))}\n\n`;
    csvContent += `${language === "pt" ? "Colaboradora" : "Cleaner"},${language === "pt" ? "Data" : "Date"},${language === "pt" ? "Cliente" : "Client"},${language === "pt" ? "Horário" : "Time"},Status,${language === "pt" ? "Custo" : "Cost"}\n`;

    jobs.forEach((j) => {
      csvContent += `${j.cleaner?.name || "—"},${j.date},${j.client.name},${j.startTime}-${j.endTime},${j.status},${format(Number(j.cost))}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shiftsly-week-${weekStart}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === "pt" ? "Relatório exportado!" : "Report exported!");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Cleaner Drawer */}
      {selectedCleanerId && (
        <CleanerDrawer
          cleanerId={selectedCleanerId}
          jobs={jobs}
          onClose={() => setSelectedCleanerId(null)}
          lang={language}
        />
      )}

      {/* ─── Floating Active Routes FAB ─── */}
      {activeRoutes.length > 0 && <RotasFAB rotas={activeRoutes} />}

      {/* ─── TOP HEADER BAR ─── */}
      <DashboardHeader />

      {/* ─── TITLE ROW + DATE PICKER ─── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* Compact date picker */}
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <button onClick={goBack} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {formatWeekRange(weekStart, language)}
            </span>
            <button onClick={goForward} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {weekData && (
            <Badge className="bg-[#F0FDF4] text-[#15803D] border-0">
              {weekData.status === "ACTIVE" ? (language === "pt" ? "Semana" : "Weekly") :
                weekData.status === "CLOSED" ? (language === "pt" ? "Fechada" : "Closed") :
                "Draft"}
            </Badge>
          )}
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {language === "pt" ? "Exportar" : "Export"}
          </Button>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div className="mb-6">
        {weekLoading ? <KPISkeleton /> : <KPICards data={kpiData} />}
      </div>

      {/* ─── MIDDLE SECTION (grid like reference) ─── */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-3">
        <CustoDiaristasChart data={custoPorDiarista} />
        <AlertaDia absences={absencesData} />
        <ServicosHoje data={servicosHojeData} />
      </div>

      {/* ─── WEEKLY SCHEDULE ─── */}
      <div className="mb-6">
        {/* Schedule header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === "pt" ? "Escala da Semana" : "Weekly Schedule"}
          </h2>
          {weekData && weekData.status === "ACTIVE" && (
            <Button
              size="sm"
              className="bg-[#22C55E] hover:bg-[#16A34A] rounded-xl"
              onClick={() => closeWeekMut.mutate()}
              disabled={closeWeekMut.isPending}
            >
              {closeWeekMut.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-1.5" />
              )}
              {language === "pt" ? "Fechar semana" : "Close week"}
            </Button>
          )}
        </div>

        {/* Week not found or empty — Show empty board */}
        {(weekNotFound || weekEmpty) && (
          <EmptyWeekBoard
            weekStart={weekStart}
            weekDates={weekDates}
            lang={language}
            templates={templates}
            cleaners={cleanersData ?? []}
            clients={clientsData ?? []}
            scheduleId={weekData?.id ?? null}
            onGenerate={(templateId) => generateWeekMut.mutate(templateId)}
            isGenerating={generateWeekMut.isPending}
            onCleanerSelected={(cleaner, rowIdx) => {
              toast.success(
                language === "pt"
                  ? `${cleaner.name} selecionada! Agora adicione serviços nos dias.`
                  : `${cleaner.name} selected! Now add services on the days.`
              );
            }}
            onJobCreated={() => {
              queryClient.invalidateQueries({ queryKey: ["week", weekStart] });
              queryClient.invalidateQueries({ queryKey: ["jobs-today"] });
            }}
          />
        )}

        {/* Loading */}
        {weekLoading && <ScheduleSkeleton />}

        {/* Schedule table — with data */}
        {weekData && !weekLoading && jobs.length > 0 && (
          <>
            {/* Search */}
            <div className="mb-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={language === "pt" ? "Buscar colaboradora..." : "Search cleaner..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="sticky left-0 z-10 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 min-w-[220px]">
                      {language === "pt" ? "Colaboradora" : "Cleaner"}
                    </th>
                    {dayKeys.map((key, i) => {
                      const isWeekend = key === "sab" || key === "dom";
                      const wd = weekDates[i];
                      return (
                        <th
                          key={key}
                          className={`px-3 py-3 text-center font-medium text-gray-500 dark:text-gray-400 min-w-[100px] ${isWeekend ? "bg-[#F0FDF4]/40 dark:bg-emerald-900/20" : ""}`}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="flex items-center gap-1">
                              {weekDaysI18n[key]?.[language]}
                              {isWeekend && (
                                <span className="inline-flex items-center rounded bg-[#F0FDF4] dark:bg-emerald-900/40 px-1 py-0.5 text-[10px] font-bold text-[#15803D] dark:text-emerald-300">1.5×</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {wd ? new Date(wd.date + "T00:00:00").toLocaleDateString(language === "pt" ? "pt-BR" : "en-GB", { day: "2-digit", month: "2-digit" }) : ""}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-3 text-center font-medium text-gray-500 dark:text-gray-400 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {cleanerEntries.length === 0 && Object.keys(uncoveredDays).length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                        <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        {language === "pt" ? "Nenhuma colaboradora encontrada nesta semana" : "No cleaners found this week"}
                      </td>
                    </tr>
                  )}

                  {/* Uncovered services row */}
                  {Object.keys(uncoveredDays).length > 0 && (
                    <tr className="border-b last:border-0 hover:bg-gray-50/50 group/row bg-blue-50/30 dark:bg-blue-900/10">
                      <td className="sticky left-0 z-10 bg-blue-50/50 dark:bg-blue-900/20 px-4 py-3">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer"
                          onClick={() => {
                            // Assign first uncovered job
                            const firstJob = Object.values(uncoveredDays).flat()[0];
                            if (firstJob) setAssignJobId(firstJob.id);
                          }}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#93C5FD] bg-blue-50 dark:bg-blue-900/30 hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-all">
                            <UserPlus className="h-3.5 w-3.5 text-[#3B82F6]" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-blue-700 dark:text-blue-300">
                              {language === "pt" ? "Atribuir colaboradora" : "Assign cleaner"}
                            </p>
                            <p className="text-xs text-blue-500 dark:text-blue-400">
                              {Object.values(uncoveredDays).flat().length} {language === "pt" ? "serviço(s) sem atribuição" : "unassigned service(s)"}
                            </p>
                          </div>
                        </div>
                      </td>
                      {dayKeys.map((key, dayIdx) => {
                        const isWeekend = key === "sab" || key === "dom";
                        const dayJobs = uncoveredDays[dayIdx] ?? [];
                        const isPopoverOpen = popoverCell?.cleanerId === "__uncovered" && popoverCell?.dayIdx === dayIdx;
                        const cellRefKey = `__uncovered-${dayIdx}`;
                        return (
                          <td
                            key={key}
                            ref={(el) => { dayCellRefs.current[cellRefKey] = el; }}
                            className={`px-2 py-2 text-center relative overflow-visible ${isWeekend ? "bg-[#F0FDF4]/20 dark:bg-emerald-900/10" : ""}`}
                          >
                            <DayCell
                              jobs={dayJobs}
                              isWeekend={isWeekend}
                              isAbsent={false}
                              lang={language}
                              onDelete={(id) => deleteJobMut.mutate(id)}
                              onClick={() => {
                                if (dayJobs.length > 0) {
                                  setPopoverCell(isPopoverOpen ? null : { cleanerId: "__uncovered", dayIdx });
                                }
                              }}
                            />
                            {isPopoverOpen && dayJobs.length > 0 && (
                              <JobPopover
                                jobs={dayJobs}
                                onClose={() => setPopoverCell(null)}
                                onComplete={(id) => completeJobMut.mutate(id)}
                                onAbsence={(cId, date) => registerAbsenceMut.mutate({ cleanerId: cId, date })}
                                onDelete={(id) => deleteJobMut.mutate(id)}
                                onAssignCleaner={(jobId) => { setAssignJobId(jobId); setPopoverCell(null); }}
                                anchorRef={{ current: dayCellRefs.current[cellRefKey] }}
                                lang={language}
                              />
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 py-3"></td>
                    </tr>
                  )}
                  {cleanerEntries.map(([cleanerId, data]) => {
                    const cleaner = data.cleaner;
                    if (!cleaner) return null;
                    const avatarColor = cleaner.avatarColor ? { bg: cleaner.avatarColor, text: "#fff" } : getAvatarColor(cleaner.name);
                    const initials = cleaner.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const totalHours = Object.values(data.days).flat().reduce((s, j) => s + Number(j.hoursWorked || 0), 0);

                    return (
                      <tr key={cleanerId} className="border-b dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 group/row">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 cursor-pointer" onClick={() => setSelectedCleanerId(cleanerId)}>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900 dark:text-gray-100 hover:text-[#15803D] transition-colors">
                                {cleaner.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {totalHours.toFixed(0)}h
                              </p>
                            </div>
                          </div>
                        </td>
                        {dayKeys.map((key, dayIdx) => {
                          const isWeekend = key === "sab" || key === "dom";
                          const dayJobs = data.days[dayIdx] ?? [];
                          const isAbsent = dayJobs.some((j) => j.status === "ABSENT");
                          const isPopoverOpen = popoverCell?.cleanerId === cleanerId && popoverCell?.dayIdx === dayIdx;

                          const cellRefKey = `${cleanerId}-${dayIdx}`;
                          return (
                            <td
                              key={key}
                              ref={(el) => { dayCellRefs.current[cellRefKey] = el; }}
                              className={`px-2 py-2 text-center relative overflow-visible ${isWeekend ? "bg-[#F0FDF4]/20 dark:bg-emerald-900/10" : ""}`}
                            >
                              <DayCell
                                jobs={dayJobs}
                                isWeekend={isWeekend}
                                isAbsent={isAbsent}
                                lang={language}
                                onDelete={(id) => deleteJobMut.mutate(id)}
                                onClick={() => {
                                  if (dayJobs.length > 0) {
                                    setPopoverCell(isPopoverOpen ? null : { cleanerId, dayIdx });
                                  }
                                }}
                              />
                              {isPopoverOpen && dayJobs.length > 0 && (
                                <JobPopover
                                  jobs={dayJobs}
                                  onClose={() => setPopoverCell(null)}
                                  onComplete={(id) => completeJobMut.mutate(id)}
                                  onAbsence={(cId, date) => registerAbsenceMut.mutate({ cleanerId: cId, date })}
                                  onDelete={(id) => deleteJobMut.mutate(id)}
                                  anchorRef={{ current: dayCellRefs.current[cellRefKey] }}
                                  lang={language}
                                />
                              )}
                            </td>
                          );
                        })}
                        <td className="px-2 py-3 text-center relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === cleanerId ? null : cleanerId);
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover/row:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                          {openMenu === cleanerId && (
                            <OptionsMenu
                              onClose={() => setOpenMenu(null)}
                              onAction={(action) => {
                                if (action === "profile") setSelectedCleanerId(cleanerId);
                                if (action === "absence") {
                                  const today = new Date().toISOString().split("T")[0];
                                  registerAbsenceMut.mutate({ cleanerId, date: today });
                                }
                              }}
                              lang={language}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Placeholder rows for adding more cleaners */}
                  {Array.from({ length: Math.max(0, 3 - cleanerEntries.length - (Object.keys(uncoveredDays).length > 0 ? 1 : 0)) + extraRows }, (_, i) => {
                    const placeholderKey = `__placeholder-${i}`;
                    const minRows = 3 - cleanerEntries.length - (Object.keys(uncoveredDays).length > 0 ? 1 : 0);
                    const isExtra = i >= Math.max(0, minRows);
                    return (
                      <tr key={placeholderKey} className="border-b last:border-0 group/row">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 py-3">
                          <div className="flex items-center gap-2.5 opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600">
                              <Plus className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-400">
                              {language === "pt" ? "Adicionar colaboradora" : "Add cleaner"}
                            </p>
                          </div>
                        </td>
                        {dayKeys.map((key) => {
                          const isWeekend = key === "sab" || key === "dom";
                          return (
                            <td key={key} className={`px-2 py-2 text-center ${isWeekend ? "bg-[#F0FDF4]/20 dark:bg-emerald-900/10" : ""}`}>
                              <div className="h-full min-h-[44px] rounded-lg" />
                            </td>
                          );
                        })}
                        <td className="px-2 py-3 text-center">
                          {isExtra && (
                            <button
                              onClick={() => setExtraRows((c) => Math.max(0, c - 1))}
                              className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover/row:opacity-100"
                              title={language === "pt" ? "Remover linha" : "Remove row"}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Add row button */}
              <div className="px-4 py-2 border-t dark:border-gray-800">
                <button
                  onClick={() => setExtraRows((c) => c + 1)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#22C55E] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {language === "pt" ? "Adicionar linha" : "Add row"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── ASSIGN CLEANER MODAL ─── */}
      {assignJobId && createPortal(
        <>
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setAssignJobId(null)} />
          <div className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {language === "pt" ? "Atribuir colaboradora" : "Assign cleaner"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {language === "pt" ? "Selecione quem vai realizar este serviço" : "Select who will perform this service"}
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto py-2">
              {(cleanersData ?? []).map((c) => {
                const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                const color = c.avatarColor || "#22C55E";
                return (
                  <button
                    key={c.id}
                    onClick={() => assignCleanerMut.mutate({ jobId: assignJobId, cleanerId: c.id })}
                    disabled={assignCleanerMut.isPending}
                    className="flex w-full items-center gap-2.5 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: color, color: "#fff" }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{format(Number(c.hourlyRate))}/h</p>
                    </div>
                  </button>
                );
              })}
              {(!cleanersData || cleanersData.length === 0) && (
                <div className="px-5 py-4 text-center">
                  <p className="text-xs text-gray-400">{language === "pt" ? "Nenhuma colaboradora cadastrada" : "No cleaners registered"}</p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t dark:border-gray-700">
              <button
                onClick={() => setAssignJobId(null)}
                className="w-full rounded-xl border dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {language === "pt" ? "Cancelar" : "Cancel"}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── BOTTOM SECTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DiaristasHoje data={diaristaStatusData} />
        <ServicosSemanaChart data={servicosSemana} />
      </div>

      {/* ─── STANDALONE SERVICE DRAWER (from /clientes → "Atribuir serviço") ─── */}
      {standaloneDrawer && (
        <ServiceConfigDrawer
          client={standaloneDrawer.client}
          date={standaloneDrawer.date}
          cleaners={cleanersData ?? []}
          preSelectedCleaner={null}
          lang={language}
          isSubmitting={isStandaloneSubmitting}
          editableDate
          onClose={() => setStandaloneDrawer(null)}
          onConfirm={async (config) => {
            setIsStandaloneSubmitting(true);
            try {
              const jobDate = config.date || standaloneDrawer.date;
              // Determine weekStart for the selected date
              const d = new Date(jobDate + "T00:00:00");
              const dayOfWeek = d.getDay(); // 0=Sun
              const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
              const monday = new Date(d);
              monday.setDate(d.getDate() + mondayOffset);
              const ws = monday.toISOString().split("T")[0];

              // Ensure weekly schedule exists
              const week = await api.post<any>("/schedule/weeks", { weekStart: ws });

              await api.post("/schedule/jobs", {
                scheduleId: week.id,
                cleanerId: config.cleanerId,
                clientId: config.clientId,
                date: jobDate,
                startTime: config.startTime,
                endTime: config.endTime,
                status: config.cleanerId ? "SCHEDULED" : "UNCOVERED",
                notes: config.notes || null,
                serviceType: config.serviceType || "standard",
              });

              toast.success(
                language === "pt"
                  ? `Serviço criado: ${standaloneDrawer.client.name}`
                  : `Service created: ${standaloneDrawer.client.name}`
              );
              queryClient.invalidateQueries({ queryKey: ["week"] });
              queryClient.invalidateQueries({ queryKey: ["jobs-today"] });
              setStandaloneDrawer(null);
            } catch (e: any) {
              const msg = e.message || "";
              if (msg.includes(" | ")) {
                const parts = msg.split(" | ");
                toast.error(language === "pt" ? parts[0] : parts[1]);
              } else {
                toast.error(msg || (language === "pt" ? "Erro ao criar serviço" : "Error creating service"));
              }
            }
            setIsStandaloneSubmitting(false);
          }}
        />
      )}
    </div>
  );
}
