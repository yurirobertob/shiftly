"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
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
  MoreHorizontal,
  X,
  Loader2,
  Users,
} from "lucide-react";

type CleanerStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

interface Cleaner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  hourlyRate: number;
  status: CleanerStatus;
  avatarColor: string | null;
  notes: string | null;
  rates: unknown[];
}

function mapStatusToBadge(status: CleanerStatus): "ativo" | "inativo" | "ausente" {
  switch (status) {
    case "ACTIVE":
      return "ativo";
    case "INACTIVE":
      return "inativo";
    case "ON_LEAVE":
      return "ausente";
    default:
      return "inativo";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ColaboradoresPage() {
  const { language } = useLanguage();
  const { format: formatCurrency } = useCurrency();
  const { canAddCleaner, plan } = usePlan();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Debounce search (300ms)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm]);

  // Build query params
  const apiFilter = statusFilter === "active" ? "ACTIVE" : statusFilter === "inactive" ? "INACTIVE" : "";
  const queryParams = new URLSearchParams();
  if (apiFilter) queryParams.set("status", apiFilter);
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  const queryString = queryParams.toString();
  const endpoint = `/cleaners${queryString ? `?${queryString}` : ""}`;

  const {
    data: cleaners = [],
    isLoading,
    isError,
  } = useQuery<Cleaner[]>({
    queryKey: ["cleaners", statusFilter, debouncedSearch],
    queryFn: () => api.get<Cleaner[]>(endpoint),
  });

  const activeCount = cleaners.filter((c) => c.status === "ACTIVE").length;
  const inactiveCount = cleaners.filter((c) => c.status === "INACTIVE").length;

  // ─── New Cleaner Dialog ───
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    phone: "",
    email: "",
    hourlyRate: 15,
    notes: "",
  });

  const resetNewForm = () => {
    setNewForm({ name: "", phone: "", email: "", hourlyRate: 15, notes: "" });
  };

  const createMutation = useMutation({
    mutationFn: (data: typeof newForm) => api.post<Cleaner>("/cleaners", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaners"] });
      toast.success(language === "pt" ? "Colaboradora criada com sucesso" : "Cleaner created successfully");
      setNewOpen(false);
      resetNewForm();
    },
    onError: (err: Error) => {
      if (err.message.includes("403") || err.message.includes("limit") || err.message.includes("Limit") || err.message.includes("upgrade")) {
        toast.error(
          language === "pt"
            ? "Limite do plano atingido. Faça upgrade para adicionar mais colaboradoras."
            : "Plan limit reached. Upgrade to add more cleaners."
        );
      } else {
        toast.error(err.message || (language === "pt" ? "Erro ao criar colaboradora" : "Error creating cleaner"));
      }
    },
  });

  const handleCreate = () => {
    if (!newForm.name.trim()) return;
    createMutation.mutate(newForm);
  };

  // ─── Edit Sheet ───
  const [editOpen, setEditOpen] = useState(false);
  const [editCleaner, setEditCleaner] = useState<Cleaner | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    hourlyRate: 15,
    notes: "",
  });

  const openEdit = (c: Cleaner) => {
    setEditCleaner(c);
    setEditForm({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      hourlyRate: c.hourlyRate,
      notes: c.notes || "",
    });
    setEditOpen(true);
    setMenuOpenId(null);
  };

  const editMutation = useMutation({
    mutationFn: (data: { id: string; body: typeof editForm }) =>
      api.put<Cleaner>(`/cleaners/${data.id}`, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaners"] });
      toast.success(language === "pt" ? "Colaboradora atualizada" : "Cleaner updated");
      setEditOpen(false);
      setEditCleaner(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || (language === "pt" ? "Erro ao atualizar" : "Error updating"));
    },
  });

  const handleEdit = () => {
    if (!editCleaner || !editForm.name.trim()) return;
    editMutation.mutate({ id: editCleaner.id, body: editForm });
  };

  // ─── Delete / Deactivate ───
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cleaners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaners"] });
      toast.success(language === "pt" ? "Colaboradora desativada" : "Cleaner deactivated");
      setConfirmDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || (language === "pt" ? "Erro ao desativar" : "Error deactivating"));
      setConfirmDeleteId(null);
    },
  });

  // ─── Row menu ───
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const openMenu = useCallback((id: string) => {
    if (menuOpenId === id) {
      setMenuOpenId(null);
      setMenuPos(null);
      return;
    }
    const btn = menuBtnRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 200 });
    }
    setMenuOpenId(id);
  }, [menuOpenId]);

  // Close menu on outside click
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = menuOpenId ? menuBtnRefs.current[menuOpenId] : null;
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        (!btn || !btn.contains(e.target as Node))
      ) {
        setMenuOpenId(null);
        setMenuPos(null);
      }
    };
    if (menuOpenId) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpenId]);

  // ─── Skeleton rows ───
  const SkeletonRows = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </td>
          <td className="px-4 py-3 text-right">
            <div className="h-4 w-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">
            {language === "pt" ? "Colaboradoras" : "Cleaners"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === "pt"
              ? "Gerencie sua equipe de colaboradoras"
              : "Manage your operation's team members"}
          </p>
        </div>
        <Button size="sm" onClick={() => {
          if (!canAddCleaner) {
            setShowUpgrade(true);
            return;
          }
          setNewOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-1" />
          {language === "pt" ? "Nova colaboradora" : "New cleaner"}
        </Button>
      </div>

      {/* Search and filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={language === "pt" ? "Buscar colaboradora..." : "Search cleaner..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === "active"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {language === "pt" ? "Ativos" : "Active"} {activeCount}
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "inactive" ? "all" : "inactive")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === "inactive"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {language === "pt" ? "Inativos" : "Inactive"} {inactiveCount}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                {language === "pt" ? "Nome" : "Name"}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                {language === "pt" ? "Telefone" : "Phone"}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                {language === "pt" ? "Ações" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : cleaners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {language === "pt" ? "Nenhuma colaboradora encontrada" : "No cleaners found"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {language === "pt"
                          ? "Adicione sua primeira colaboradora para começar"
                          : "Add your first cleaner to get started"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                      onClick={() => {
                        if (!canAddCleaner) { setShowUpgrade(true); return; }
                        setNewOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {language === "pt" ? "Nova colaboradora" : "New cleaner"}
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              cleaners.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: getAvatarColor(c.name).bg,
                          color: getAvatarColor(c.name).text,
                        }}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium dark:text-white block truncate">{c.name}</span>
                        {c.email && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 block truncate">
                            {c.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {c.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={mapStatusToBadge(c.status)} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      ref={(el) => { menuBtnRefs.current[c.id] = el; }}
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openMenu(c.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ═══ ROW ACTION MENU (portal) ═══ */}
      {menuOpenId && menuPos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              onClick={() => {
                const c = cleaners.find((cl) => cl.id === menuOpenId);
                if (c) openEdit(c);
              }}
            >
              {language === "pt" ? "Editar" : "Edit"}
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
              onClick={() => {
                setConfirmDeleteId(menuOpenId);
                setMenuOpenId(null);
                setMenuPos(null);
              }}
            >
              {language === "pt" ? "Marcar como inativa" : "Mark as inactive"}
            </button>
          </div>,
          document.body
        )
      }

      {/* ═══ NEW CLEANER DIALOG ═══ */}
      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNewOpen(false)} />
          <div className="relative w-full max-w-[480px] rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">
                  {language === "pt" ? "Nova colaboradora" : "New cleaner"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === "pt"
                    ? "Adicione um novo membro à equipe"
                    : "Add a new team member"}
                </p>
              </div>
              <button
                onClick={() => setNewOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {language === "pt" ? "Nome *" : "Name *"}
                </label>
                <Input
                  placeholder={language === "pt" ? "Nome completo" : "Full name"}
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {language === "pt" ? "Telefone" : "Phone"}
                  </label>
                  <Input
                    placeholder={language === "pt" ? "Telefone" : "Phone number"}
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {language === "pt" ? "Observações" : "Notes"}
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                  rows={3}
                  placeholder={language === "pt" ? "Observações opcionais..." : "Optional notes..."}
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setNewOpen(false)} className="flex-1">
                {language === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                onClick={handleCreate}
                disabled={!newForm.name.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "pt" ? "Salvando..." : "Saving..."}
                  </>
                ) : language === "pt" ? (
                  "Criar colaboradora"
                ) : (
                  "Create cleaner"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT SHEET ═══ */}
      {editOpen && editCleaner && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-[400px] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">
                  {language === "pt" ? "Editar colaboradora" : "Edit cleaner"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {editCleaner.name}
                </p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {language === "pt" ? "Nome *" : "Name *"}
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {language === "pt" ? "Telefone" : "Phone"}
                </label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {language === "pt" ? "Observações" : "Notes"}
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                  onClick={handleEdit}
                  disabled={!editForm.name.trim() || editMutation.isPending}
                >
                  {editMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === "pt" ? "Salvando..." : "Saving..."}
                    </>
                  ) : language === "pt" ? (
                    "Salvar alterações"
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  {language === "pt" ? "Cancelar" : "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM DELETE DIALOG ═══ */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative w-full max-w-[400px] rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 mx-4">
            <h2 className="text-lg font-semibold dark:text-white">
              {language === "pt" ? "Confirmar desativação" : "Confirm deactivation"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {language === "pt"
                ? "Tem certeza que deseja marcar esta colaboradora como inativa? Essa ação pode ser revertida."
                : "Are you sure you want to mark this cleaner as inactive? This can be undone."}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="flex-1">
                {language === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "pt" ? "Desativando..." : "Deactivating..."}
                  </>
                ) : language === "pt" ? (
                  "Desativar"
                ) : (
                  "Deactivate"
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
        trigger="cleaner_limit"
      />
    </div>
  );
}
