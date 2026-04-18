"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import { RotasDrawer } from "./rotas-drawer";

interface RotaAtiva {
  id: string;
  diarista: {
    nome: string;
    iniciais: string;
    corAvatar: string;
  };
  local: string;
  tipoServico: string;
  inicioISO: string;
  terminoPrevisoISO: string;
  status: 'iniciando' | 'em-servico' | 'quase-no-fim' | 'atrasada';
}

export function RotasFAB({ rotas }: { rotas: RotaAtiva[] }) {
  const [open, setOpen] = useState(false);
  const count = rotas.length;

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#22C55E] text-white shadow-lg hover:bg-[#16A34A] transition-colors group"
        title="Serviços ao vivo"
      >
        <Radio className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E24B4A] px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {/* Drawer */}
      <RotasDrawer open={open} onClose={() => setOpen(false)} rotas={rotas} />
    </>
  );
}
