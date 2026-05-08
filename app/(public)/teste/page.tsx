"use client";

import { useState, useCallback, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  experienceYears: string;
  currentTools: string[];
  currentToolsOther: string;
  completedWeek: string;
  weekBlocker: string;
  weekEasiest: string;
  weekHardest: string;
  quitMoment: string;
  exploredSections: string[];
  brokenFeature: string;
  missingFeature: string;
  dailyPainPoint: string;
  oneWordDescription: string;
  visualHelped: string;
  npsScore: number | null;
  npsReason: string;
  oneChange: string;
}

type StepId =
  | "welcome"
  | "name"
  | "experienceYears"
  | "currentTools"
  | "productAccess"
  | "completedWeek"
  | "weekBlocker"
  | "weekEasiest"
  | "weekHardest"
  | "quitMoment"
  | "exploredSections"
  | "brokenFeature"
  | "missingFeature"
  | "dailyPainPoint"
  | "oneWordDescription"
  | "visualHelped"
  | "npsScore"
  | "npsReason"
  | "oneChange";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_STEPS: StepId[] = [
  "welcome",
  "name",
  "experienceYears",
  "currentTools",
  "productAccess",
  "completedWeek",
  "weekBlocker",
  "weekEasiest",
  "weekHardest",
  "quitMoment",
  "exploredSections",
  "brokenFeature",
  "missingFeature",
  "dailyPainPoint",
  "oneWordDescription",
  "visualHelped",
  "npsScore",
  "npsReason",
  "oneChange",
];

const STEP_SECTION: Record<StepId, number> = {
  welcome: 1,
  name: 2,
  experienceYears: 2,
  currentTools: 2,
  productAccess: 3,
  completedWeek: 4,
  weekBlocker: 4,
  weekEasiest: 4,
  weekHardest: 4,
  quitMoment: 4,
  exploredSections: 5,
  brokenFeature: 5,
  missingFeature: 5,
  dailyPainPoint: 5,
  oneWordDescription: 6,
  visualHelped: 6,
  npsScore: 6,
  npsReason: 6,
  oneChange: 6,
};

const SECTION_NAMES: Record<number, string> = {
  1: "Boas-vindas",
  2: "Seu perfil",
  3: "Acesso ao Shiftly",
  4: "Montando a semana",
  5: "Explorando o sistema",
  6: "Impressão final",
};

const EXPERIENCE_OPTIONS = [
  { value: "less_than_1", label: "Menos de 1 ano" },
  { value: "1_to_3", label: "1 a 3 anos" },
  { value: "3_to_5", label: "3 a 5 anos" },
  { value: "more_than_5", label: "Mais de 5 anos" },
];

const TOOL_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "planilha", label: "Planilha (Excel / Google Sheets)" },
  { value: "papel", label: "Papel e caneta" },
  { value: "outro", label: "Outro app (qual?)" },
  { value: "nenhuma", label: "Não uso nenhuma ferramenta específica" },
];

const WEEK_OPTIONS = [
  { value: "yes", label: "✅ Sim, consegui completar" },
  { value: "partial", label: "⚠️ Consegui parcialmente" },
  { value: "no", label: "❌ Não consegui" },
];

const EXPLORED_OPTIONS = [
  { value: "perfil-colaboradoras", label: "Perfil das colaboradoras" },
  { value: "cadastro-clientes", label: "Cadastro de clientes" },
  { value: "relatorio-pagamentos", label: "Relatório de pagamentos" },
  { value: "configuracoes", label: "Configurações" },
  { value: "nada", label: "Nada além da agenda" },
];

const VISUAL_OPTIONS = [
  { value: "yes_a_lot", label: "Sim, muito" },
  { value: "somewhat", label: "Mais ou menos" },
  { value: "not_much", label: "Não muito" },
  { value: "not_at_all", label: "Não consegui entender nada pelo visual" },
];

const INITIAL: FormData = {
  name: "",
  experienceYears: "",
  currentTools: [],
  currentToolsOther: "",
  completedWeek: "",
  weekBlocker: "",
  weekEasiest: "",
  weekHardest: "",
  quitMoment: "",
  exploredSections: [],
  brokenFeature: "",
  missingFeature: "",
  dailyPainPoint: "",
  oneWordDescription: "",
  visualHelped: "",
  npsScore: null,
  npsReason: "",
  oneChange: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function npsColor(score: number): string {
  if (score <= 2) return "#EF4444";
  if (score <= 4) return "#F97316";
  if (score <= 6) return "#EAB308";
  if (score <= 8) return "#84CC16";
  return "#22C55E";
}

const serif: CSSProperties = {
  fontFamily: "var(--font-dm-serif, 'DM Serif Display', serif)",
};
const sans: CSSProperties = {
  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestePage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("welcome");
  const [data, setData] = useState<FormData>(INITIAL);
  const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const section = STEP_SECTION[step];

  // ── Navigation ────────────────────────────────────────────────────────────

  const nextStep = useCallback((currentStep: StepId, formData: FormData): StepId | null => {
    const idx = ALL_STEPS.indexOf(currentStep);
    if (idx === -1) return null;

    let nextIdx = idx + 1;
    if (nextIdx >= ALL_STEPS.length) return null;

    // Skip weekBlocker when week was fully completed
    if (ALL_STEPS[nextIdx] === "weekBlocker" && formData.completedWeek === "yes") {
      nextIdx++;
    }

    return ALL_STEPS[nextIdx] ?? null;
  }, []);

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case "name":
        return data.name.trim().length > 0;
      case "experienceYears":
        return data.experienceYears.length > 0;
      case "currentTools":
        return data.currentTools.length > 0;
      case "completedWeek":
        return data.completedWeek.length > 0;
      case "exploredSections":
        return data.exploredSections.length > 0;
      case "visualHelped":
        return data.visualHelped.length > 0;
      case "npsScore":
        return data.npsScore !== null;
      default:
        return true;
    }
  }, [step, data]);

  const goToStep = (nextId: StepId) => {
    setVisible(false);
    setTimeout(() => {
      setStep(nextId);
      setVisible(true);
    }, 260);
  };

  const handleNext = async () => {
    if (!canAdvance() || submitting) return;

    const next = nextStep(step, data);

    if (next === null) {
      // Last step — submit
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await fetch("/api/usability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, npsScore: data.npsScore ?? 0 }),
        });
        if (res.ok) {
          router.push("/teste/obrigada");
        } else {
          setSubmitError("Algo deu errado. Tente novamente.");
        }
      } catch {
        setSubmitError("Erro de conexão. Verifique sua internet e tente novamente.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    goToStep(next);
  };

  const update = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }));

  // ── Sub-components ────────────────────────────────────────────────────────

  const RadioCards = ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200"
            style={{
              ...sans,
              borderColor: selected ? "#A8C5B5" : "#E8E4DF",
              backgroundColor: selected ? "rgba(168,197,181,0.12)" : "#FFFFFF",
            }}
          >
            <span className="text-[15px] text-[#2D2D2D]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  const CheckboxCards = ({
    value,
    onChange,
    options,
  }: {
    value: string[];
    onChange: (v: string[]) => void;
    options: { value: string; label: string }[];
  }) => {
    const toggle = (v: string) =>
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

    return (
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3"
              style={{
                ...sans,
                borderColor: selected ? "#A8C5B5" : "#E8E4DF",
                backgroundColor: selected ? "rgba(168,197,181,0.12)" : "#FFFFFF",
              }}
            >
              <span className="text-[15px] text-[#2D2D2D]">{opt.label}</span>
              {selected && (
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#A8C5B5] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const Textarea = ({
    field,
    placeholder,
  }: {
    field: keyof FormData;
    placeholder: string;
  }) => (
    <textarea
      value={data[field] as string}
      onChange={(e) => update(field, e.target.value as FormData[typeof field])}
      placeholder={placeholder}
      rows={4}
      className="w-full px-4 py-3 rounded-2xl border-2 border-[#E8E4DF] bg-white focus:outline-none focus:border-[#A8C5B5] transition-colors duration-200 resize-none text-[15px] text-[#2D2D2D] placeholder:text-[#7A7A7A]"
      style={sans}
    />
  );

  // ── Step content ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <div className="py-8 text-center">
            <div className="text-5xl mb-6">💚</div>
            <h1 className="text-4xl text-[#2D2D2D] mb-7 leading-tight" style={serif}>
              Obrigada por participar
            </h1>
            <div className="text-[16px] text-[#7A7A7A] leading-relaxed space-y-4 text-left" style={sans}>
              <p>
                Você vai testar o Shiftly — uma plataforma criada pra facilitar
                a vida de gestoras de limpeza como você.
              </p>
              <p>
                Não existe resposta certa ou errada. O que vale é a sua
                experiência real.
              </p>
              <p>
                Vai levar em torno de 20 a 30 minutos. Se quiser continuar além
                disso, pode ficar à vontade.
              </p>
              <p>
                Ao final, você recebe{" "}
                <strong className="text-[#2D2D2D]">
                  3 meses grátis do plano PRO
                </strong>{" "}
                como agradecimento.
              </p>
            </div>
          </div>
        );

      case "name":
        return (
          <div>
            <p className="text-[12px] uppercase tracking-widest text-[#7A7A7A] mb-3" style={sans}>
              Sobre você
            </p>
            <h2 className="text-2xl text-[#2D2D2D] mb-6 leading-snug" style={serif}>
              Qual é o seu nome?
            </h2>
            <input
              type="text"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Como posso te chamar?"
              className="w-full px-4 py-4 rounded-2xl border-2 border-[#E8E4DF] bg-white focus:outline-none focus:border-[#A8C5B5] transition-colors duration-200 text-[16px] text-[#2D2D2D] placeholder:text-[#7A7A7A]"
              style={sans}
              autoFocus
            />
          </div>
        );

      case "experienceYears":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-6 leading-snug" style={serif}>
              Há quanto tempo você trabalha como gestora de equipe de limpeza?
            </h2>
            <RadioCards
              value={data.experienceYears}
              onChange={(v) => update("experienceYears", v)}
              options={EXPERIENCE_OPTIONS}
            />
          </div>
        );

      case "currentTools":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-3 leading-snug" style={serif}>
              Como você organiza sua equipe hoje?
            </h2>
            <p className="text-[13px] text-[#7A7A7A] mb-5" style={sans}>
              Pode selecionar mais de uma opção.
            </p>
            <CheckboxCards
              value={data.currentTools}
              onChange={(v) => update("currentTools", v)}
              options={TOOL_OPTIONS}
            />
            {data.currentTools.includes("outro") && (
              <input
                type="text"
                value={data.currentToolsOther}
                onChange={(e) => update("currentToolsOther", e.target.value)}
                placeholder="Qual app você usa?"
                className="mt-3 w-full px-4 py-3 rounded-2xl border-2 border-[#E8E4DF] bg-white focus:outline-none focus:border-[#A8C5B5] transition-colors duration-200 text-[15px] text-[#2D2D2D] placeholder:text-[#7A7A7A]"
                style={sans}
              />
            )}
          </div>
        );

      case "productAccess": {
        const shiftlyUrl = process.env.NEXT_PUBLIC_SHIFTLY_URL || "#";
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-4 leading-snug" style={serif}>
              Hora de explorar o Shiftly ✨
            </h2>
            <p className="text-[15px] text-[#7A7A7A] leading-relaxed mb-5" style={sans}>
              Agora você vai acessar o sistema. Já deixamos tudo pronto pra você
              começar — tem colaboradoras e clientes cadastrados esperando por você.
            </p>
            <p className="text-[15px] text-[#7A7A7A] leading-relaxed mb-6" style={sans}>
              Acesse pelo link abaixo, crie sua conta e explore como quiser.
            </p>
            <a
              href={shiftlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-4 rounded-2xl text-white font-semibold text-[16px] mb-6 transition-all duration-200 hover:opacity-90"
              style={{ ...sans, backgroundColor: "#A8C5B5" }}
            >
              Acessar o Shiftly →
            </a>
            <div
              className="rounded-2xl px-5 py-4"
              style={{ backgroundColor: "rgba(201,184,168,0.2)" }}
            >
              <p className="text-[14px] font-semibold text-[#2D2D2D] mb-1" style={sans}>
                Sua missão principal:
              </p>
              <p className="text-[14px] text-[#7A7A7A] leading-relaxed" style={sans}>
                Tente montar a agenda da semana para sua equipe. Quando terminar
                — ou quando quiser parar — volte aqui e continue.
              </p>
            </div>
          </div>
        );
      }

      case "completedWeek":
        return (
          <div>
            <p className="text-[12px] uppercase tracking-widest text-[#7A7A7A] mb-3" style={sans}>
              Sobre montar a semana
            </p>
            <h2 className="text-2xl text-[#2D2D2D] mb-6 leading-snug" style={serif}>
              Você conseguiu montar a agenda da semana?
            </h2>
            <RadioCards
              value={data.completedWeek}
              onChange={(v) => update("completedWeek", v)}
              options={WEEK_OPTIONS}
            />
          </div>
        );

      case "weekBlocker":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              O que travou você? O que não ficou claro?
            </h2>
            <Textarea
              field="weekBlocker"
              placeholder="Conta com suas palavras o que aconteceu..."
            />
          </div>
        );

      case "weekEasiest":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              O que foi mais fácil de entender nesse processo?
            </h2>
            <Textarea
              field="weekEasiest"
              placeholder="Ex: adicionar colaboradora, escolher o cliente..."
            />
          </div>
        );

      case "weekHardest":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              O que foi mais difícil ou confuso?
            </h2>
            <Textarea
              field="weekHardest"
              placeholder="Pode ser um botão que não achou, algo que não ficou claro..."
            />
          </div>
        );

      case "quitMoment":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              Teve algum momento em que você quis desistir? O que foi?
            </h2>
            <Textarea
              field="quitMoment"
              placeholder="Se sim, descreva o momento. Se não, pode deixar em branco."
            />
          </div>
        );

      case "exploredSections":
        return (
          <div>
            <p className="text-[12px] uppercase tracking-widest text-[#7A7A7A] mb-3" style={sans}>
              Sobre o Shiftly no geral
            </p>
            <h2 className="text-2xl text-[#2D2D2D] mb-3 leading-snug" style={serif}>
              Além da agenda da semana, o que mais você explorou?
            </h2>
            <p className="text-[13px] text-[#7A7A7A] mb-5" style={sans}>
              Pode selecionar mais de uma opção.
            </p>
            <CheckboxCards
              value={data.exploredSections}
              onChange={(v) => update("exploredSections", v)}
              options={EXPLORED_OPTIONS}
            />
          </div>
        );

      case "brokenFeature":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              Teve alguma funcionalidade que você tentou usar e não funcionou como
              esperava?
            </h2>
            <Textarea
              field="brokenFeature"
              placeholder="Descreva o que aconteceu..."
            />
          </div>
        );

      case "missingFeature":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              Teve alguma coisa que você esperava encontrar no sistema mas não
              encontrou?
            </h2>
            <Textarea
              field="missingFeature"
              placeholder="Algo que faria diferença no seu dia a dia..."
            />
          </div>
        );

      case "dailyPainPoint":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              No seu dia a dia como gestora, qual é a parte mais chata ou difícil
              de controlar?
            </h2>
            <Textarea
              field="dailyPainPoint"
              placeholder="Ex: saber quem foi trabalhar, calcular o pagamento, avisar cliente..."
            />
          </div>
        );

      case "oneWordDescription":
        return (
          <div>
            <p className="text-[12px] uppercase tracking-widest text-[#7A7A7A] mb-3" style={sans}>
              Sua impressão geral
            </p>
            <h2 className="text-2xl text-[#2D2D2D] mb-6 leading-snug" style={serif}>
              Em uma palavra ou frase, como você descreveria o Shiftly?
            </h2>
            <input
              type="text"
              value={data.oneWordDescription}
              onChange={(e) => update("oneWordDescription", e.target.value)}
              placeholder="Ex: organizado, confuso, promissor..."
              className="w-full px-4 py-4 rounded-2xl border-2 border-[#E8E4DF] bg-white focus:outline-none focus:border-[#A8C5B5] transition-colors duration-200 text-[16px] text-[#2D2D2D] placeholder:text-[#7A7A7A]"
              style={sans}
            />
          </div>
        );

      case "visualHelped":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-6 leading-snug" style={serif}>
              O visual e o design do sistema te ajudaram a entender o que fazer?
            </h2>
            <RadioCards
              value={data.visualHelped}
              onChange={(v) => update("visualHelped", v)}
              options={VISUAL_OPTIONS}
            />
          </div>
        );

      case "npsScore":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-3 leading-snug" style={serif}>
              De 0 a 10, o quanto você indicaria o Shiftly para outra gestora de
              limpeza?
            </h2>
            <p className="text-[13px] text-[#7A7A7A] mb-6" style={sans}>
              0 = jamais indicaria &nbsp;|&nbsp; 10 = indicaria com certeza
            </p>
            <div className="grid grid-cols-11 gap-1.5">
              {Array.from({ length: 11 }, (_, i) => {
                const selected = data.npsScore === i;
                const color = npsColor(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => update("npsScore", i)}
                    className="aspect-square rounded-xl text-[13px] font-bold border-2 transition-all duration-200"
                    style={{
                      ...sans,
                      backgroundColor: selected ? color : "#FFFFFF",
                      borderColor: selected ? color : "#E8E4DF",
                      color: selected ? "#FFFFFF" : "#2D2D2D",
                      transform: selected ? "scale(1.12)" : "scale(1)",
                    }}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[11px] text-[#7A7A7A]" style={sans}>😞 0</span>
              <span className="text-[11px] text-[#7A7A7A]" style={sans}>😍 10</span>
            </div>
          </div>
        );

      case "npsReason":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              Por que essa nota?
            </h2>
            <Textarea
              field="npsReason"
              placeholder="O que pesou mais pra você dar essa nota?"
            />
          </div>
        );

      case "oneChange":
        return (
          <div>
            <h2 className="text-2xl text-[#2D2D2D] mb-5 leading-snug" style={serif}>
              Se você pudesse mudar uma coisa no Shiftly agora, o que seria?
            </h2>
            <Textarea
              field="oneChange"
              placeholder="Pode ser algo pequeno ou grande."
            />
          </div>
        );

      default:
        return null;
    }
  };

  // ── Button label ──────────────────────────────────────────────────────────

  const buttonLabel = () => {
    if (step === "welcome") return "Vamos começar →";
    if (step === "productAccess") return "Já explorei o Shiftly, continuar →";
    if (nextStep(step, data) === null)
      return submitting ? "Enviando..." : "Enviar respostas →";
    return "Continuar →";
  };

  const ready = canAdvance();
  const progressPct = (section / 6) * 100;

  const fadeStyle: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(14px)",
    transition: "opacity 0.26s ease, transform 0.26s ease",
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F6" }}>
      {/* Progress bar — fixed top */}
      <div
        className="fixed top-0 left-0 right-0 z-20 border-b border-[#E8E4DF]"
        style={{ backgroundColor: "rgba(250,249,246,0.92)", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-[11px] text-[#7A7A7A] whitespace-nowrap tabular-nums" style={sans}>
            Etapa {section} de 6
          </span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E8E4DF" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: "#A8C5B5" }}
            />
          </div>
          <span className="text-[11px] text-[#7A7A7A] whitespace-nowrap hidden sm:block" style={sans}>
            {SECTION_NAMES[section]}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16 pb-32 px-4 flex flex-col items-center">
        <div className="w-full max-w-lg pt-8">
          <div style={fadeStyle}>{renderStep()}</div>

          {submitError && (
            <p className="mt-4 text-[14px] text-red-500 text-center" style={sans}>
              {submitError}
            </p>
          )}
        </div>
      </div>

      {/* Bottom continue button */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#E8E4DF] px-4 py-4"
        style={{ backgroundColor: "rgba(250,249,246,0.95)", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            onClick={handleNext}
            disabled={!ready || submitting}
            className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all duration-200"
            style={{
              ...sans,
              backgroundColor: ready && !submitting ? "#A8C5B5" : "#E8E4DF",
              color: ready && !submitting ? "#FFFFFF" : "#7A7A7A",
              cursor: ready && !submitting ? "pointer" : "not-allowed",
            }}
          >
            {buttonLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}
