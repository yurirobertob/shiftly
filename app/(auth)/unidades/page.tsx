"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MapPin,
  Users,
  Layers,
  UserCircle,
} from "lucide-react";
import { unidades } from "@/lib/mock-data";

export default function UnidadesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = searchTerm
    ? unidades.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : unidades;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unidades</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as filiais e unidades da sua operação
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Nova unidade
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar unidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Units grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma unidade encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Card key={u.id} className="hover:ring-2 hover:ring-[#2463EB]/20 transition-all cursor-pointer">
              <CardContent className="py-4">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-base font-semibold">{u.name}</h3>
                  <Badge variant="secondary">{u.collaboratorCount} colab.</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>{u.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>{u.collaboratorCount} colaboradores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>{u.sectors.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>Gestor: {u.manager}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
