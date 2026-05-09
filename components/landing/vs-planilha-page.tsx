"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Users,
  BarChart2,
  Smartphone,
  Bell,
  DollarSign,
  UserPlus,
  History,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { LanguageProvider } from "@/hooks/use-language";
import { AbsenceMockup } from "@/components/landing/feature-mockups/absence-mockup";
import { PaymentMockup } from "@/components/landing/feature-mockups/payment-mockup";
import { ScheduleMockup } from "@/components/landing/feature-mockups/schedule-mockup";
import { HistoryMockup } from "@/components/landing/feature-mockups/history-mockup";

// ── Inline mini mockups (lightweight, used in table rows) ────────────────────

function MiniMobileMockup() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm w-full max-w-[220px] space-y-1.5">
      <div className="text-[11px] text-gray-500 font-medium">Quinta, 09 mai</div>
      {[
        { name: "Ana Costa", checked: true },
        { name: "Maria Silva", checked: true },
        { name: "Juliana Pires", checked: false },
      ].map(({ name, checked }) => (
        <div key={name} className="flex items-center gap-2">
          <div
            className={`h-4 w-4 rounded flex items-center justify-center shrink-0 ${
              checked ? "bg-[#006D3D]" : "bg-gray-200"
            }`}
          >
            {checked && <Check className="h-2.5 w-2.5 text-white" />}
          </div>
          <span className="text-xs text-gray-800">{name}</span>
        </div>
      ))}
      <div className="rounded-lg bg-[#F0FDF4] px-2 py-1 text-center">
        <span className="text-[11px] text-[#006D3D] font-medium">2 de 3 escaladas</span>
      </div>
    </div>
  );
}

function MiniUncoveredMockup() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm w-full max-w-[220px] space-y-2">
      <div className="text-[11px] font-medium text-gray-500">Semana 20–24 mai</div>
      {[
        { day: "Seg", ok: true, label: "5 serviços" },
        { day: "Ter", ok: false, label: "2 descobertos" },
        { day: "Qua", ok: true, label: "4 serviços" },
        { day: "Qui", ok: false, label: "1 descoberto" },
        { day: "Sex", ok: true, label: "6 serviços" },
      ].map(({ day, ok, label }) => (
        <div key={day} className="flex items-center gap-2">
          <span className="w-6 text-[11px] text-gray-500 shrink-0">{day}</span>
          <div
            className={`h-1.5 flex-1 rounded-full ${
              ok ? "bg-[#006D3D]/60" : "bg-red-400"
            }`}
          />
          <span
            className={`text-[11px] shrink-0 ${
              !ok ? "text-red-600 font-semibold" : "text-gray-500"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniWeekNavMockup() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm w-full max-w-[220px] space-y-2.5">
      <div className="flex items-center justify-between">
        <button className="p-1 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
        </button>
        <span className="text-xs font-semibold text-gray-900">29 abr – 05 mai</span>
        <button className="p-1 rounded-lg hover:bg-gray-100">
          <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-lg bg-[#F0FDF4] p-2 text-center">
          <div className="text-sm font-bold text-[#006D3D]">28</div>
          <div className="text-[10px] text-gray-500">serviços</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-sm font-bold text-gray-800">R$2.1k</div>
          <div className="text-[10px] text-gray-500">custo</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center col-span-2">
          <div className="text-sm font-bold text-gray-800">112h</div>
          <div className="text-[10px] text-gray-500">horas escaladas</div>
        </div>
      </div>
    </div>
  );
}

function MiniKpiMockup() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm w-full max-w-[220px] space-y-2">
      <div className="text-[11px] font-medium text-gray-500">Esta semana · atualizado agora</div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Custo total</span>
          <span className="text-sm font-bold text-[#006D3D]">R$ 2.340</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Horas escaladas</span>
          <span className="text-xs font-semibold text-gray-900">112h</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Serviços</span>
          <span className="text-xs font-semibold text-gray-900">34</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Ausências</span>
          <span className="text-xs font-semibold text-red-500">2</span>
        </div>
      </div>
      <div className="rounded-lg bg-[#F0FDF4] px-2 py-1 text-[10px] text-[#006D3D] text-center">
        ✓ Atualizado a cada mudança
      </div>
    </div>
  );
}

function MiniMultiUserMockup() {
  const people = [
    { init: "YR", color: "#006D3D" },
    { init: "AC", color: "#1B6545" },
    { init: "MF", color: "#2D8959" },
  ];
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm w-full max-w-[220px] space-y-2">
      <div className="text-[11px] text-gray-500 font-medium">Editando agora</div>
      <div className="flex items-center gap-1">
        {people.map(({ init, color }, i) => (
          <div
            key={init}
            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
            style={{ backgroundColor: color, marginLeft: i > 0 ? "-8px" : "0" }}
          >
            {init}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-600">3 gestores</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-[#F0FDF4] px-2 py-1">
        <Check className="h-3 w-3 text-[#006D3D]" />
        <span className="text-[11px] text-[#006D3D]">Salvo em tempo real</span>
      </div>
    </div>
  );
}

function MiniNewCleanerMockup() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm w-full max-w-[220px] space-y-2">
      <div className="text-[11px] font-medium text-gray-500">Nova colaboradora cadastrada</div>
      <div className="flex items-center gap-2 rounded-lg bg-[#F6FBF3] border border-[#C1C9C0] px-3 py-2">
        <div className="h-7 w-7 rounded-full bg-[#006D3D] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white">LC</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900">Lara Carvalho</p>
          <p className="text-[10px] text-gray-500">R$ 25/h · Ativa</p>
        </div>
        <Check className="h-3.5 w-3.5 text-[#006D3D] ml-auto" />
      </div>
      <div className="text-[10px] text-[#006D3D] text-center">
        Aparece automaticamente em todas as semanas
      </div>
    </div>
  );
}

// ── Criteria ─────────────────────────────────────────────────────────────────

const criteria = [
  {
    id: 1,
    Icon: AlertTriangle,
    iconColor: "#EF4444",
    label: "Ausência de última hora",
    spreadsheet: {
      title: "Você descobre pelo WhatsApp",
      description:
        "Apaga a linha da escala, manda mensagem no grupo e espera alguém responder. O cliente pode ficar sem atendimento.",
    },
    shiftsly: {
      title: "Alerta imediato, substituição em 2 cliques",
      description:
        "A ausência fica em destaque. O sistema mostra quais clientes ficaram descobertos e sugere substituta disponível.",
      Mockup: AbsenceMockup,
    },
  },
  {
    id: 2,
    Icon: DollarSign,
    iconColor: "#F59E0B",
    label: "Cálculo de pagamento",
    spreadsheet: {
      title: "Fórmula que quebra na primeira edição",
      description:
        "=HORA×VALOR na célula B12. Alguém altera sem perceber e o cálculo sai errado no fechamento do mês.",
    },
    shiftsly: {
      title: "Calculado automaticamente por hora e serviço",
      description:
        "Cada colaboradora tem sua taxa cadastrada. O sistema gera o resumo de pagamento sem nenhuma fórmula manual.",
      Mockup: PaymentMockup,
    },
  },
  {
    id: 3,
    Icon: Smartphone,
    iconColor: "#8B5CF6",
    label: "Gestão pelo celular",
    spreadsheet: {
      title: "Excel mobile: possível. Editar sem errar: impossível.",
      description:
        "Células minúsculas, zoom constante, rolagem horizontal. Qualquer toque acidental afeta a semana toda.",
    },
    shiftsly: {
      title: "Interface feita para o celular desde o início",
      description:
        "Atribui, remove e verifica a escala com um toque. Funciona em qualquer navegador mobile sem instalar nada.",
      Mockup: MiniMobileMockup,
    },
  },
  {
    id: 4,
    Icon: Bell,
    iconColor: "#EF4444",
    label: "Serviços descobertos",
    spreadsheet: {
      title: "Você descobre quando o cliente liga reclamando",
      description:
        "Célula vazia se parece com célula sem formatação. Não há alerta. O problema aparece só na hora do serviço.",
    },
    shiftsly: {
      title: "Destaque visual imediato para cada gap",
      description:
        "Serviços sem colaboradora ficam marcados em vermelho na escala da semana. Nenhum cliente fica descoberto por descuido.",
      Mockup: MiniUncoveredMockup,
    },
  },
  {
    id: 5,
    Icon: History,
    iconColor: "#3B82F6",
    label: "Ver semanas anteriores",
    spreadsheet: {
      title: "Escala_Semana23_v3_FINAL.xlsx",
      description:
        "Um arquivo por semana, nomes diferentes, nenhum padrão. Comparar duas semanas leva mais tempo do que vale.",
    },
    shiftsly: {
      title: "Navegue entre semanas com uma seta",
      description:
        "Todas as semanas ficam no mesmo lugar. Custo, serviços e histórico de ausências acessíveis em um clique.",
      Mockup: MiniWeekNavMockup,
    },
  },
  {
    id: 6,
    Icon: BarChart2,
    iconColor: "#10B981",
    label: "Custo semanal em tempo real",
    spreadsheet: {
      title: "Soma de 47 células distribuídas em 3 abas",
      description:
        "Toda vez que a escala muda você precisa recalcular. É manual, é lento e qualquer erro passa despercebido.",
    },
    shiftsly: {
      title: "KPI atualizado a cada mudança, sem fórmula",
      description:
        "Custo total, horas escaladas, número de serviços e ausências — todos calculados automaticamente.",
      Mockup: MiniKpiMockup,
    },
  },
  {
    id: 7,
    Icon: Users,
    iconColor: "#6366F1",
    label: "Dois gestores editando ao mesmo tempo",
    spreadsheet: {
      title: "Conflito de mesclagem. Alguém perdeu as alterações.",
      description:
        "Google Sheets avisa quando há conflito. Excel desktop não avisa. Quem salvar por último substitui o trabalho do outro.",
    },
    shiftsly: {
      title: "Acesso simultâneo sem conflito",
      description:
        "Múltiplos gestores veem e editam a mesma escala em tempo real. Cada mudança é salva automaticamente.",
      Mockup: MiniMultiUserMockup,
    },
  },
  {
    id: 8,
    Icon: UserPlus,
    iconColor: "#059669",
    label: "Onboarding de nova colaboradora",
    spreadsheet: {
      title: "Copiar e colar o nome em cada dia da semana",
      description:
        "Toda semana você adiciona a colaboradora nova em cada célula correspondente. Esqueceu um dia? Cliente descoberto.",
    },
    shiftsly: {
      title: "Cadastra uma vez, aparece em todas as semanas",
      description:
        "Nome, taxa por hora e status. Pronto. Ela aparece automaticamente em toda nova semana criada.",
      Mockup: MiniNewCleanerMockup,
    },
  },
];

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.05 },
  }),
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function VsPlanilhaPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-[#F6FBF3] border-b border-[#C1C9C0]/40 pt-16 pb-20 px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <nav className="mb-5 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  Shiftsly
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Shiftsly vs Planilha</span>
              </nav>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C1C9C0] bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
                Comparativo honesto · sem marketing
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.15]">
                Sua escala de limpeza ainda vive{" "}
                <span className="text-[#006D3D]">numa planilha?</span>
              </h1>

              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Quem busca "escala de limpeza planilha" já conhece a dor —{" "}
                ausência de última hora, fórmula que quebra, celular que não funciona.
                Veja 8 critérios comparados sem filtro.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1B6545] px-6 py-3 text-sm font-semibold text-white hover:bg-[#155236] transition-colors shadow-sm"
                >
                  Testar grátis — 14 dias
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#comparativo"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Ver comparativo
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Score strip ───────────────────────────────────────────────── */}
        <div className="border-b border-gray-100 bg-white py-8 px-6">
          <div className="mx-auto max-w-3xl grid grid-cols-3 gap-6 text-center divide-x divide-gray-100">
            <div>
              <p className="text-3xl font-bold text-gray-900">8</p>
              <p className="mt-1 text-sm text-gray-500">critérios avaliados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#006D3D]">8 × 0</p>
              <p className="mt-1 text-sm text-gray-500">Shiftsly vs Planilha</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">14 dias</p>
              <p className="mt-1 text-sm text-gray-500">de trial gratuito</p>
            </div>
          </div>
        </div>

        {/* ── Comparison table ──────────────────────────────────────────── */}
        <section
          id="comparativo"
          aria-label="Comparativo Shiftsly vs Planilha"
          className="py-16 px-4 sm:px-6 bg-[#F9FAFB]"
        >
          <div className="mx-auto max-w-5xl">
            {/* Column headers — desktop */}
            <div className="hidden lg:grid grid-cols-[2fr_3fr_3fr] gap-4 mb-6 px-1">
              <div />
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-lg">📊</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Planilha</p>
                  <p className="text-[11px] text-gray-400">Excel / Google Sheets</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#A7F3D0] bg-[#F0FDF4] px-4 py-3 shadow-sm">
                <div className="h-7 w-7 rounded-lg bg-[#006D3D] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">S</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#006D3D]">Shiftsly</p>
                  <p className="text-[11px] text-[#006D3D]/60">shiftsly.com</p>
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {criteria.map((item, idx) => {
                const { Icon } = item;
                const { Mockup } = item.shiftsly;
                return (
                  <motion.article
                    key={item.id}
                    custom={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={fadeUp}
                    className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                  >
                    {/* Criterion header */}
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-3">
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.iconColor + "18" }}
                      >
                        <Icon className="h-4 w-4" style={{ color: item.iconColor }} />
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900">{item.label}</h2>
                      <span className="ml-auto text-xs font-medium text-gray-300">
                        {String(item.id).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Two-column body */}
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* Planilha — loss */}
                      <div className="flex gap-3 border-b border-gray-100 bg-white px-5 py-4 lg:border-b-0 lg:border-r">
                        <div className="mt-0.5 shrink-0">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                            <X className="h-3 w-3 text-red-500" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.spreadsheet.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-gray-500">
                            {item.spreadsheet.description}
                          </p>
                        </div>
                      </div>

                      {/* Shiftsly — win */}
                      <div className="flex gap-3 bg-[#F9FEFB] px-5 py-4">
                        <div className="mt-0.5 shrink-0">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7]">
                            <Check className="h-3 w-3 text-[#006D3D]" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.shiftsly.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-gray-600">
                            {item.shiftsly.description}
                          </p>
                          <div className="mt-3">
                            <Mockup />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Objection handler ─────────────────────────────────────────── */}
        <section className="bg-white border-y border-gray-100 py-14 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold text-center text-gray-900 mb-8">
              Perguntas de quem ainda está na planilha
            </h2>
            <div className="space-y-5">
              {[
                {
                  q: "Mas eu já sei usar planilha, por que mudar?",
                  a: "Porque o problema não é saber usar — é que planilha não foi feita para gestão de equipes. Falta alerta de ausência, cálculo automático de pagamento e acesso mobile funcional. Você compensa isso com esforço manual toda semana.",
                },
                {
                  q: "Consigo importar minha planilha atual?",
                  a: "Sim. O cadastro de colaboradoras e clientes é rápido. A maioria dos gestores migra tudo em menos de 20 minutos na primeira semana.",
                },
                {
                  q: "Funciona para equipe pequena (menos de 5 pessoas)?",
                  a: "Especialmente para equipes pequenas, onde cada ausência impacta desproporcionalmente. O plano inicial cobre até 10 colaboradoras.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-[#1B6545]">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Chega de escala de limpeza por planilha.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/70 max-w-xl mx-auto">
                Teste o Shiftsly por 14 dias. Sem cartão de crédito, sem burocracia.
                Se não resolver sua operação, você volta para o Excel sem custo.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-[#1B6545] shadow-sm transition-colors hover:bg-gray-50"
              >
                Começar grátis — 14 dias
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Configuração em 5 minutos
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Suporte na migração
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </LanguageProvider>
  );
}
