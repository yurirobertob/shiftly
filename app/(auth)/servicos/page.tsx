"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAvatarColor } from "@/lib/avatar-color";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { usePlan } from "@/hooks/use-plan";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import {
  Search,
  Plus,
  X,
  Loader2,
  Check,
  Clock,
  MapPin,
  User,
  Building2,
  CalendarPlus,
  ChevronDown,
} from "lucide-react";

type Tab = "sem-atribuicao" | "atribuidos" | "todos";

interface Job {
  id: string;
  scheduleId: string;
  cleanerId: string | null;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "ABSENT" | "CANCELLED" | "UNCOVERED";
  cost: number;
  cleaner: { id: string; name: string; avatarColor: string } | null;
  client: { id: string; name: string; address: string };
}

interface Cleaner {
  id: string;
  name: string;
  avatarColor?: string;
}

interface Client {
  id: string;
  name: string;
  address: string;
}

interface WeekSchedule {
  id: string;
  weekStart: string;
  status: string;
}

function getWeekStartFromDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff)
    .toISOString()
    .split("T")[0];
}

function getCurrentWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.getFullYear(), now.getMonth(), diff)
    .toISOString()
    .split("T")[0];
}

function computeDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const totalMinutes = eh * 60 + em - (sh * 60 + sm);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}m`;
}

function formatDate(dateStr: string, language: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const dayNames =
    language === "pt"
      ? ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
      : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = dayNames[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${dayOfWeek} (${day}/${month})`;
}

export default function ServicosPage() {
  const { language } = useLanguage();
  const { format: formatCurrency } = useCurrency();
  const { canAddClient, plan } = usePlan();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("sem-atribuicao");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Atribuir sheet state
  const [atribuirOpen, setAtribuirOpen] = useState(false);
  const [atribuirJob, setAtribuirJob] = useState<Job | null>(null);
  const [selectedDiarista, setSelectedDiarista] = useState("");

  // Novo servico dialog state
  const [novoOpen, setNovoOpen] = useState(false);
  const [novoForm, setNovoForm] = useState({
    clientId: "",
    cleanerId: "",
    date: "",
    startTime: "08:00",
    endTime: "11:00",
  });

  // Novo cliente dialog state
  const [clienteOpen, setClienteOpen] = useState(false);
  const [clienteForm, setClienteForm] = useState({
    name: "",
    address: "",
    contactName: "",
    phone: "",
    notes: "",
  });

  // Upgrade prompt
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Fetch active week schedule
  const { data: weeks } = useQuery<WeekSchedule[]>({
    queryKey: ["schedule-weeks"],
    queryFn: () => api.get("/schedule/weeks?limit=1&status=ACTIVE"),
  });

  const scheduleId = weeks?.[0]?.id ?? null;

  // Fetch jobs for the current schedule
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["schedule-jobs", scheduleId],
    queryFn: () => api.get(`/schedule/jobs?scheduleId=${scheduleId}`),
    enabled: !!scheduleId,
  });

  // Fetch active cleaners
  const { data: cleaners = [] } = useQuery<Cleaner[]>({
    queryKey: ["cleaners-active"],
    queryFn: () => api.get("/cleaners?status=ACTIVE"),
  });

  // Fetch active clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients-active"],
    queryFn: () => api.get("/clients?status=ACTIVE"),
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: ({ jobId, cleanerId }: { jobId: string; cleanerId: string }) =>
      api.put(`/schedule/jobs/${jobId}`, { cleanerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-jobs"] });
      setAtribuirOpen(false);
      setAtribuirJob(null);
      setSelectedDiarista("");
      toast.success(
        language === "pt"
          ? "Colaboradora atribuída com sucesso"
          : "Cleaner assigned successfully"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Create job mutation — auto-creates week if needed
  const createMutation = useMutation({
    mutationFn: async (data: {
      clientId: string;
      cleanerId?: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      const weekStart = getWeekStartFromDate(data.date);

      // Try to find existing week
      let weekSchedule: any = null;
      try {
        weekSchedule = await api.get(`/schedule/weeks/${weekStart}`);
      } catch {
        // Week doesn't exist — create an empty one
      }

      let sid = weekSchedule?.id || scheduleId;

      // If no week exists, create empty one
      if (!sid) {
        // Try to get a template to generate from
        let templates: any[] = [];
        try {
          templates = await api.get("/schedule/template");
        } catch { /* no templates */ }

        if (templates.length > 0) {
          // Generate from template
          const generated = await api.post("/schedule/weeks", {
            weekStart,
            templateId: templates[0].id,
          });
          sid = (generated as any)?.id;
        }
      }

      if (!sid) {
        throw new Error(
          language === "pt"
            ? "Crie um template de agenda primeiro em Dashboard para gerar semanas."
            : "Create a schedule template first in Dashboard to generate weeks."
        );
      }

      return api.post("/schedule/jobs", {
        scheduleId: sid,
        clientId: data.clientId,
        ...(data.cleanerId ? { cleanerId: data.cleanerId } : {}),
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-weeks"] });
      setNovoOpen(false);
      setNovoForm({
        clientId: "",
        cleanerId: "",
        date: "",
        startTime: "08:00",
        endTime: "11:00",
      });
      toast.success(
        language === "pt" ? "Serviço criado" : "Service created"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: (data: typeof clienteForm) =>
      api.post("/clients", {
        name: data.name,
        address: data.address,
        contactName: data.contactName || undefined,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-active"] });
      setClienteOpen(false);
      setClienteForm({ name: "", address: "", contactName: "", phone: "", notes: "" });
      toast.success(
        language === "pt" ? "Cliente adicionado!" : "Client added!"
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("403") || error.message.includes("limit") || error.message.includes("upgrade")) {
        toast.error(
          language === "pt"
            ? "Limite de clientes atingido. Faça upgrade."
            : "Client limit reached. Upgrade your plan."
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  // Derived data
  const unassigned = jobs.filter((j) => j.cleanerId === null);
  const assigned = jobs.filter((j) => j.cleanerId !== null);

  let displayed: Job[] = [];
  if (activeTab === "sem-atribuicao") displayed = unassigned;
  else if (activeTab === "atribuidos") displayed = assigned;
  else displayed = jobs;

  if (searchTerm) {
    displayed = displayed.filter(
      (j) =>
        j.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.cleaner?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const handleAtribuir = () => {
    if (!atribuirJob || !selectedDiarista) return;
    assignMutation.mutate({
      jobId: atribuirJob.id,
      cleanerId: selectedDiarista,
    });
  };

  const handleCriarServico = () => {
    if (!novoForm.clientId || !novoForm.date) return;
    createMutation.mutate({
      clientId: novoForm.clientId,
      ...(novoForm.cleanerId ? { cleanerId: novoForm.cleanerId } : {}),
      date: novoForm.date,
      startTime: novoForm.startTime,
      endTime: novoForm.endTime,
    });
  };

  const handleCriarCliente = () => {
    if (!clienteForm.name.trim()) return;
    if (!canAddClient) {
      setShowUpgrade(true);
      return;
    }
    createClientMutation.mutate(clienteForm);
  };

  const openAtribuir = (job: Job) => {
    setAtribuirJob(job);
    setSelectedDiarista("");
    setAtribuirOpen(true);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    {
      key: "sem-atribuicao",
      label: language === "pt" ? "Sem atribuição" : "Unassigned",
      count: unassigned.length,
    },
    {
      key: "atribuidos",
      label: language === "pt" ? "Atribuídos" : "Assigned",
      count: assigned.length,
    },
    {
      key: "todos",
      label: language === "pt" ? "Todos" : "All",
      count: jobs.length,
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {language === "pt" ? "Serviços" : "Services"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === "pt"
              ? "Gerencie os serviços da semana"
              : "Manage the week's services"}
          </p>
        </div>

        {/* Dropdown: New client / New job */}
        <div className="relative">
          <Button
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {language === "pt" ? "Novo" : "New"}
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </Button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-56 rounded-lg border bg-white shadow-lg z-50 py-1">
                <button
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setDropdownOpen(false);
                    setClienteOpen(true);
                  }}
                >
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {language === "pt" ? "Novo cliente / casa" : "New client / property"}
                </button>
                <button
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setDropdownOpen(false);
                    setNovoOpen(true);
                  }}
                >
                  <CalendarPlus className="h-4 w-4 text-gray-400" />
                  {language === "pt" ? "Novo serviço agendado" : "New scheduled job"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#22C55E] text-[#22C55E]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={
            language === "pt"
              ? "Buscar por cliente ou colaboradora..."
              : "Search by client or cleaner..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left p-3 font-medium text-gray-500">
                {language === "pt" ? "Cliente" : "Client"}
              </th>
              <th className="text-left p-3 font-medium text-gray-500">
                {language === "pt" ? "Tipo" : "Type"}
              </th>
              <th className="text-left p-3 font-medium text-gray-500">
                {language === "pt" ? "Dia" : "Day"}
              </th>
              <th className="text-center p-3 font-medium text-gray-500">
                {language === "pt" ? "Duração" : "Duration"}
              </th>
              <th className="text-right p-3 font-medium text-gray-500">
                {language === "pt" ? "Custo est." : "Est. cost"}
              </th>
              <th className="text-left p-3 font-medium text-gray-500">
                {language === "pt" ? "Colaboradora" : "Cleaner"}
              </th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {jobsLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-3"><div className="h-4 w-10 bg-gray-200 rounded animate-pulse mx-auto" /></td>
                    <td className="p-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                    <td className="p-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-3"><div className="h-7 w-16 bg-gray-200 rounded animate-pulse" /></td>
                  </tr>
                ))}
              </>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  {language === "pt"
                    ? "Nenhum serviço encontrado"
                    : "No services found"}
                </td>
              </tr>
            ) : (
              displayed.map((j) => (
                <tr key={j.id} className="border-t hover:bg-gray-50/50">
                  <td className="p-3 font-medium text-gray-900">{j.client.name}</td>
                  <td className="p-3">
                    <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">
                      Standard Clean
                    </Badge>
                  </td>
                  <td className="p-3 text-gray-600">{formatDate(j.date, language)}</td>
                  <td className="text-center p-3 text-gray-600">
                    {computeDuration(j.startTime, j.endTime)}
                  </td>
                  <td className="text-right p-3 text-gray-600">{formatCurrency(j.cost)}</td>
                  <td className="p-3">
                    {j.cleaner ? (
                      <span className="text-gray-700 font-medium">{j.cleaner.name}</span>
                    ) : (
                      <StatusBadge status="descoberto" size="xs" />
                    )}
                  </td>
                  <td className="p-3">
                    {!j.cleanerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => openAtribuir(j)}
                      >
                        {language === "pt" ? "Atribuir" : "Assign"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ATRIBUIR SHEET */}
      {atribuirOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAtribuirOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-[400px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold">
                  {language === "pt" ? "Atribuir colaboradora" : "Assign cleaner"}
                </h2>
                {atribuirJob && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {atribuirJob.client.name} &middot;{" "}
                    {formatDate(atribuirJob.date, language)} &middot;{" "}
                    {computeDuration(atribuirJob.startTime, atribuirJob.endTime)}
                  </p>
                )}
              </div>
              <button onClick={() => setAtribuirOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-gray-700">
                {language === "pt" ? "Escolher colaboradora disponível" : "Choose available cleaner"}
              </p>
              <div className="space-y-2">
                {cleaners.map((d) => {
                  const colors = getAvatarColor(d.name);
                  const initials = d.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDiarista(d.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border-2 px-3 py-3 text-left transition-all ${
                        selectedDiarista === d.id
                          ? "border-[#22C55E] bg-[#F0FDF4]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                      </div>
                      {selectedDiarista === d.id && (
                        <Check className="h-5 w-5 text-[#22C55E] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                  onClick={handleAtribuir}
                  disabled={!selectedDiarista || assignMutation.isPending}
                >
                  {assignMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === "pt" ? "Atribuindo..." : "Assigning..."}
                    </>
                  ) : language === "pt" ? (
                    "Confirmar atribuição"
                  ) : (
                    "Confirm assignment"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setAtribuirOpen(false)}>
                  {language === "pt" ? "Cancelar" : "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOVO SERVICO DIALOG */}
      {novoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNovoOpen(false)} />
          <div className="relative w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {language === "pt" ? "Novo serviço agendado" : "New scheduled job"}
                </h2>
                <p className="text-sm text-gray-500">
                  {language === "pt"
                    ? "Adicione um serviço à agenda"
                    : "Add a service to the schedule"}
                </p>
              </div>
              <button onClick={() => setNovoOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {language === "pt" ? "Cliente" : "Client"}
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                  value={novoForm.clientId}
                  onChange={(e) => setNovoForm({ ...novoForm, clientId: e.target.value })}
                >
                  <option value="">
                    {language === "pt" ? "Selecione um cliente" : "Select a client"}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {language === "pt"
                      ? "Nenhum cliente cadastrado. Adicione um cliente primeiro."
                      : "No clients registered. Add a client first."}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {language === "pt" ? "Data" : "Date"}
                </label>
                <Input
                  type="date"
                  value={novoForm.date}
                  onChange={(e) => setNovoForm({ ...novoForm, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    {language === "pt" ? "Hora início" : "Start time"}
                  </label>
                  <Input
                    type="time"
                    value={novoForm.startTime}
                    onChange={(e) => setNovoForm({ ...novoForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    {language === "pt" ? "Hora fim" : "End time"}
                  </label>
                  <Input
                    type="time"
                    value={novoForm.endTime}
                    onChange={(e) => setNovoForm({ ...novoForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {language === "pt" ? "Atribuir colaboradora (opcional)" : "Assign cleaner (optional)"}
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                  value={novoForm.cleanerId}
                  onChange={(e) => setNovoForm({ ...novoForm, cleanerId: e.target.value })}
                >
                  <option value="">
                    {language === "pt" ? "Deixar sem atribuição" : "Leave unassigned"}
                  </option>
                  {cleaners.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setNovoOpen(false)} className="flex-1">
                {language === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                onClick={handleCriarServico}
                disabled={!novoForm.clientId || !novoForm.date || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "pt" ? "Salvando..." : "Saving..."}
                  </>
                ) : language === "pt" ? (
                  "Criar serviço"
                ) : (
                  "Create service"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO CLIENTE DIALOG */}
      {clienteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setClienteOpen(false)} />
          <div className="relative w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {language === "pt" ? "Novo cliente / casa" : "New client / property"}
                </h2>
                <p className="text-sm text-gray-500">
                  {language === "pt"
                    ? "Adicione um local de trabalho"
                    : "Add a work location"}
                </p>
              </div>
              <button onClick={() => setClienteOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {language === "pt" ? "Nome *" : "Name *"}
                </label>
                <Input
                  placeholder={language === "pt" ? "Ex: Casa Ramos" : "E.g.: Ramos House"}
                  value={clienteForm.name}
                  onChange={(e) => setClienteForm({ ...clienteForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {language === "pt" ? "Endereço" : "Address"}
                </label>
                <Input
                  placeholder={language === "pt" ? "Ex: 12 Oak Lane, SW1A 1AA" : "E.g.: 12 Oak Lane, SW1A 1AA"}
                  value={clienteForm.address}
                  onChange={(e) => setClienteForm({ ...clienteForm, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    {language === "pt" ? "Contato" : "Contact name"}
                  </label>
                  <Input
                    placeholder={language === "pt" ? "Nome do morador" : "Resident name"}
                    value={clienteForm.contactName}
                    onChange={(e) => setClienteForm({ ...clienteForm, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    {language === "pt" ? "Telefone" : "Phone"}
                  </label>
                  <Input
                    placeholder="+44 7911 123456"
                    value={clienteForm.phone}
                    onChange={(e) => setClienteForm({ ...clienteForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {language === "pt" ? "Notas" : "Notes"}
                </label>
                <Input
                  placeholder={language === "pt" ? "Observações opcionais..." : "Optional notes..."}
                  value={clienteForm.notes}
                  onChange={(e) => setClienteForm({ ...clienteForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setClienteOpen(false)} className="flex-1">
                {language === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                onClick={handleCriarCliente}
                disabled={!clienteForm.name.trim() || createClientMutation.isPending}
              >
                {createClientMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "pt" ? "Salvando..." : "Saving..."}
                  </>
                ) : language === "pt" ? (
                  "Adicionar cliente"
                ) : (
                  "Add client"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <UpgradePrompt
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentPlan={plan}
        targetPlan={plan === "pro" ? "plus" : "pro"}
        trigger="client_limit"
      />
    </div>
  );
}
