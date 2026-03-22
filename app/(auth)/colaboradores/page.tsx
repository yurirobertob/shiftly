"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaywallGate } from "@/components/paywall-gate";
import { TrialBanner } from "@/components/trial-banner";

// TODO: Replace with actual empresaId from user context
const EMPRESA_ID = "";

interface Colaborador {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  cargo: { name: string } | null;
  unidade: { name: string } | null;
  setor: { name: string } | null;
}

export default function ColaboradoresPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data: colaboradores = [], isLoading } = useQuery<Colaborador[]>({
    queryKey: ["colaboradores", EMPRESA_ID],
    queryFn: async () => {
      if (!EMPRESA_ID) return [];
      const res = await fetch(`/api/colaboradores?empresaId=${EMPRESA_ID}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!EMPRESA_ID,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string; empresaId: string }) => {
      const res = await fetch("/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
      setShowForm(false);
      setName("");
      setEmail("");
      setPhone("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
    },
  });

  return (
    <PaywallGate>
      <div className="p-8">
        <TrialBanner />

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os colaboradores da sua operação
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-[#2463EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4fc7] transition-colors"
          >
            {showForm ? "Cancelar" : "Novo colaborador"}
          </button>
        </div>

        {showForm && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate({ name, email, phone, empresaId: EMPRESA_ID });
                }}
                className="flex flex-wrap gap-3"
              >
                <input
                  type="text"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !EMPRESA_ID ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Crie uma empresa primeiro para gerenciar colaboradores.
                </p>
              </CardContent>
            </Card>
          ) : colaboradores.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum colaborador cadastrado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Nome</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Cargo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Unidade</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{c.cargo?.name || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{c.unidade?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.active ? "default" : "secondary"}>
                          {c.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm("Excluir colaborador?")) {
                              deleteMutation.mutate(c.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PaywallGate>
  );
}
