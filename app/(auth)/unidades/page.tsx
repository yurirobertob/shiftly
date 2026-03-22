"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PaywallGate } from "@/components/paywall-gate";
import { TrialBanner } from "@/components/trial-banner";

const EMPRESA_ID = "";

interface Unidade {
  id: string;
  name: string;
  gestor: { name: string } | null;
  _count: { colaboradores: number };
}

export default function UnidadesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const { data: unidades = [], isLoading } = useQuery<Unidade[]>({
    queryKey: ["unidades", EMPRESA_ID],
    queryFn: async () => {
      if (!EMPRESA_ID) return [];
      const res = await fetch(`/api/unidades?empresaId=${EMPRESA_ID}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!EMPRESA_ID,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; empresaId: string }) => {
      const res = await fetch("/api/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      setShowForm(false);
      setName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/unidades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
    },
  });

  return (
    <PaywallGate>
      <div className="p-8">
        <TrialBanner />

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Unidades</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as filiais e unidades da sua operação
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-[#2463EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4fc7] transition-colors"
          >
            {showForm ? "Cancelar" : "Nova unidade"}
          </button>
        </div>

        {showForm && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate({ name, empresaId: EMPRESA_ID });
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  placeholder="Nome da unidade"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !EMPRESA_ID ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Crie uma empresa primeiro para gerenciar unidades.
                </p>
              </CardContent>
            </Card>
          ) : unidades.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhuma unidade cadastrada.
                </p>
              </CardContent>
            </Card>
          ) : (
            unidades.map((u) => (
              <Card key={u.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{u.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {u._count.colaboradores} colaboradores
                      </p>
                      {u.gestor && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Gestor: {u.gestor.name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Excluir unidade?")) {
                          deleteMutation.mutate(u.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Excluir
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PaywallGate>
  );
}
