"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Building2, MapPin, Phone, User, Pencil, Trash2, CalendarPlus, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { usePlan } from "@/hooks/use-plan";

interface Client {
  id: string;
  name: string;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
  status: string;
  _count?: { jobs: number };
}

export default function ClientesPage() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { canAddClient } = usePlan();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unassigned">("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", address: "", contactName: "", contactPhone: "", notes: "" });

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["clients-list"],
    queryFn: () => api.get("/clients"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast.success(language === "pt" ? "Cliente adicionado!" : "Client added!");
      setShowNewDialog(false);
      setNewClient({ name: "", address: "", contactName: "", contactPhone: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── Edit / Delete state ───
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", contactName: "", contactPhone: "", notes: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  const openActionMenu = useCallback((id: string) => {
    if (actionMenuId === id) {
      setActionMenuId(null);
      setMenuPos(null);
      return;
    }
    const btn = menuBtnRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 200 });
    }
    setActionMenuId(id);
  }, [actionMenuId]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = actionMenuId ? menuBtnRefs.current[actionMenuId] : null;
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        (!btn || !btn.contains(e.target as Node))
      ) {
        setActionMenuId(null);
        setMenuPos(null);
      }
    };
    if (actionMenuId) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [actionMenuId]);

  const openEditDialog = (c: Client) => {
    setEditingClient(c);
    setEditForm({
      name: c.name,
      address: c.address || "",
      contactName: c.contactName || "",
      contactPhone: c.contactPhone || "",
      notes: c.notes || "",
    });
    setActionMenuId(null);
    setMenuPos(null);
  };

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/clients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast.success(language === "pt" ? "Cliente atualizado!" : "Client updated!");
      setEditingClient(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast.success(language === "pt" ? "Cliente removido!" : "Client removed!");
      setDeleteConfirmId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Filter clients
  const filtered = clients.filter((c) => {
    if (filter === "unassigned") {
      const hasJobs = (c._count?.jobs ?? 0) > 0;
      if (hasJobs) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.contactName && c.contactName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const allCount = clients.length;
  const unassignedCount = clients.filter((c) => (c._count?.jobs ?? 0) === 0).length;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{language === "pt" ? "Clientes" : "Clients"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === "pt" ? "Gerencie seus clientes e propriedades" : "Manage your clients and properties"}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#22C55E] hover:bg-[#16A34A]"
          onClick={() => {
            if (!canAddClient) {
              toast.error(language === "pt" ? "Limite de clientes atingido. Faça upgrade." : "Client limit reached. Upgrade your plan.");
              return;
            }
            setShowNewDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          {language === "pt" ? "Novo cliente" : "New client"}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={language === "pt" ? "Buscar cliente..." : "Search client..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === "all" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {language === "pt" ? "Todos" : "All"} ({allCount})
          </button>
          <button
            onClick={() => setFilter("unassigned")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === "unassigned" ? "bg-amber-100 text-[#BA7517]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {language === "pt" ? "Sem atribuição" : "Unassigned"} ({unassignedCount})
          </button>
        </div>
      </div>

      {/* Table or Empty State */}
      {isLoading ? (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : clients.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]">
            <Building2 className="h-8 w-8 text-[#22C55E]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {language === "pt" ? "Nenhum cliente cadastrado" : "No clients registered"}
          </h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            {language === "pt"
              ? "Comece adicionando seu primeiro cliente ou propriedade."
              : "Start by adding your first client or property."}
          </p>
          <Button
            className="bg-[#22C55E] hover:bg-[#16A34A]"
            onClick={() => setShowNewDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === "pt" ? "Adicionar primeiro cliente" : "Add first client"}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  {language === "pt" ? "Cliente" : "Client"}
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  {language === "pt" ? "Endereço" : "Address"}
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  {language === "pt" ? "Contato" : "Contact"}
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  {language === "pt" ? "Telefone" : "Phone"}
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">
                  {language === "pt" ? "Serviços" : "Services"}
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">
                  {language === "pt" ? "Status" : "Status"}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">
                  {language === "pt" ? "Ações" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    {language === "pt" ? "Nenhum cliente encontrado" : "No clients found"}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const jobCount = c._count?.jobs ?? 0;
                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.notes && <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[250px] truncate">
                        {c.address || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.contactName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.contactPhone || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {jobCount > 0 ? (
                          <Badge className="bg-[#DCFCE7] text-[#15803D] border-0">{jobCount}</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-gray-400">0</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={jobCount > 0 ? "bg-[#DCFCE7] text-[#15803D] border-0" : "bg-amber-50 text-[#BA7517] border-0"}>
                          {jobCount > 0
                            ? (language === "pt" ? "Ativo" : "Active")
                            : (language === "pt" ? "Sem atribuição" : "Unassigned")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          ref={(el) => { menuBtnRefs.current[c.id] = el; }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openActionMenu(c.id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ ROW ACTION MENU (portal) ═══ */}
      {actionMenuId && menuPos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              onClick={() => {
                const c = clients.find((cl) => cl.id === actionMenuId);
                if (c) openEditDialog(c);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              {language === "pt" ? "Editar" : "Edit"}
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              onClick={() => {
                const c = clients.find((cl) => cl.id === actionMenuId);
                setActionMenuId(null);
                setMenuPos(null);
                if (c) {
                  router.push(`/dashboard?assignClientId=${c.id}&assignClientName=${encodeURIComponent(c.name)}`);
                }
              }}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              {language === "pt" ? "Atribuir serviço" : "Assign service"}
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400 flex items-center gap-2"
              onClick={() => {
                setDeleteConfirmId(actionMenuId);
                setActionMenuId(null);
                setMenuPos(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {language === "pt" ? "Excluir" : "Delete"}
            </button>
          </div>,
          document.body
        )
      }

      {/* ═══ EDIT CLIENT DIALOG ═══ */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingClient(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === "pt" ? "Editar cliente" : "Edit client"}
              </h2>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  {language === "pt" ? "Endereço" : "Address"}
                </label>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder={language === "pt" ? "Rua, número, bairro" : "Street, number, district"}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  {language === "pt" ? "Nome *" : "Name *"}
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder={language === "pt" ? "Ex: Apartamento Santos" : "Ex: Santos Apartment"}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    {language === "pt" ? "Contato" : "Contact"}
                  </label>
                  <Input
                    value={editForm.contactName}
                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                    placeholder={language === "pt" ? "Nome do responsável" : "Contact person"}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    {language === "pt" ? "Telefone" : "Phone"}
                  </label>
                  <Input
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    placeholder={language === "pt" ? "(00) 00000-0000" : "(00) 00000-0000"}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  {language === "pt" ? "Observações" : "Notes"}
                </label>
                <Input
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder={language === "pt" ? "Informações adicionais" : "Additional info"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setEditingClient(null)}>
                {language === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                className="bg-[#22C55E] hover:bg-[#16A34A]"
                onClick={() => {
                  if (!editForm.name.trim()) {
                    toast.error(language === "pt" ? "Nome é obrigatório" : "Name is required");
                    return;
                  }
                  editMutation.mutate({ id: editingClient.id, data: editForm });
                }}
                disabled={editMutation.isPending}
              >
                {editMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "pt" ? "Salvando..." : "Saving..."}
                  </>
                ) : (language === "pt" ? "Salvar" : "Save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM DELETE DIALOG ═══ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-[400px] rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 mx-4">
            <h2 className="text-lg font-semibold dark:text-white">
              {language === "pt" ? "Confirmar exclusão" : "Confirm deletion"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {language === "pt"
                ? "Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita."
                : "Are you sure you want to delete this client? This action cannot be undone."}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">
                {language === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "pt" ? "Excluindo..." : "Deleting..."}
                  </>
                ) : (language === "pt" ? "Excluir" : "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Client Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewDialog(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {language === "pt" ? "Novo cliente" : "New client"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  {language === "pt" ? "Endereço" : "Address"}
                </label>
                <Input
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder={language === "pt" ? "Rua, número, bairro" : "Street, number, district"}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  {language === "pt" ? "Nome *" : "Name *"}
                </label>
                <Input
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder={language === "pt" ? "Ex: Apartamento Santos" : "Ex: Santos Apartment"}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    {language === "pt" ? "Contato" : "Contact"}
                  </label>
                  <Input
                    value={newClient.contactName}
                    onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                    placeholder={language === "pt" ? "Nome do responsável" : "Contact person"}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    {language === "pt" ? "Telefone" : "Phone"}
                  </label>
                  <Input
                    value={newClient.contactPhone}
                    onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })}
                    placeholder={language === "pt" ? "(00) 00000-0000" : "(00) 00000-0000"}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  {language === "pt" ? "Observações" : "Notes"}
                </label>
                <Input
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder={language === "pt" ? "Informações adicionais" : "Additional info"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                {language === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                className="bg-[#22C55E] hover:bg-[#16A34A]"
                onClick={() => {
                  if (!newClient.name.trim()) {
                    toast.error(language === "pt" ? "Nome é obrigatório" : "Name is required");
                    return;
                  }
                  createMutation.mutate(newClient);
                }}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (language === "pt" ? "Salvando..." : "Saving...") : (language === "pt" ? "Salvar" : "Save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
