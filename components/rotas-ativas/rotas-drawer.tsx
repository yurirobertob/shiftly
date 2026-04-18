"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { RotaCard } from "./rota-card";

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

interface RotasDrawerProps {
  open: boolean;
  onClose: () => void;
  rotas: RotaAtiva[];
}

export function RotasDrawer({ open, onClose, rotas }: RotasDrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: 340 }}
            animate={{ x: 0 }}
            exit={{ x: 340 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-[340px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Rotas em andamento</h2>
                  <p className="text-[11px] text-gray-500">{rotas.length} diaristas em campo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4.5 w-4.5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {rotas.map((rota) => (
                <RotaCard key={rota.id} rota={rota} />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Atualizado agora</span>
              <button className="text-xs font-semibold text-[#1B6545] hover:underline">
                Ver todas as rotas →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
