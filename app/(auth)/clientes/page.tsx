"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PaywallGate } from "@/components/paywall-gate";
import { TrialBanner } from "@/components/trial-banner";

const EMPRESA_ID = "";

interface Cliente {
  id: string;
  name: string;
  address: string | null;
  serviceType: string | null;
  _count: { tarefas: number };
}

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState("");

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({
    queryKey: ["clientes", EMPRESA_ID],
    queryFn: async () => {
      if (!EMPRESA_ID) return [];
      const res = await fetch(`/api/clientes?empresaId=${EMPRESA_ID}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!EMPRESA_ID,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; empresaId: string; address?: string; serviceType?: string }) => {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setShowForm(false);
      setName("");
      setAddress("");
      setServiceType("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });

  return (
    <PaywallGate>
      <div className="p-8">
        <TrialBanner />

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os locais e clientes atendidos
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-[#2463EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4fc7] transition-colors"
          >
            {showForm ? "Cancelar" : "Novo cliente"}
          </button>
        </div>

        {showForm && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate({
                    name,
                    empresaId: EMPRESA_ID,
                    address: address || undefined,
                    serviceType: serviceType || undefined,
                  });
                }}
                className="flex flex-wrap gap-3"
              >
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Endereço"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Tipo de serviço"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="flex-1 min-w-[150px] rounded-lg border px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-[#2463EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4fc7] disabled:opacity-50"
                >
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Endereço</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo de Serviço</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tarefas</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : !EMPRESA_ID ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Crie uma empresa primeiro para gerenciar clientes.
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.address || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{c.serviceType || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{c._count.tarefas}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm("Excluir cliente?")) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PaywallGate>
  );
}
