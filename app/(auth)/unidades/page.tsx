"use client";

import { Building2, Plus, Layers } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export default function UnidadesPage() {
  const { language } = useLanguage();
  const pt = language === "pt";

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {pt ? "Unidades" : "Units"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pt
              ? "Gerencie as filiais e unidades da sua operação"
              : "Manage your operation's branches and units"}
          </p>
        </div>
        <Button size="sm" disabled>
          <Plus className="h-4 w-4 mr-1" />
          {pt ? "Nova unidade" : "New unit"}
        </Button>
      </div>

      {/* Coming soon state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Building2 className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-base font-semibold text-gray-700">
          {pt ? "Em breve" : "Coming soon"}
        </p>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          {pt
            ? "O gerenciamento de múltiplas unidades estará disponível em breve."
            : "Multi-unit management will be available soon."}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <Layers className="h-3.5 w-3.5" />
          <span>
            {pt
              ? "Por enquanto, gerencie sua operação em uma única unidade"
              : "For now, manage your operation as a single unit"}
          </span>
        </div>
      </div>
    </div>
  );
}
