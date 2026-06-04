"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronRight,
  Globe,
  Coins,
  Users,
  UserPlus,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency, type Currency } from "@/hooks/use-currency";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Step = "welcome" | "preferences" | "cleaner" | "client" | "done";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "BRL", label: "Real Brasileiro", symbol: "R$" },
];

const STEPS: Step[] = ["welcome", "preferences", "cleaner", "client", "done"];

function StepIndicator({ current, total, pt }: { current: number; total: number; pt: boolean }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={pt ? `Passo ${current} de ${total}` : `Step ${current} of ${total}`}
      className="flex items-center gap-1.5"
    >
      <span className="sr-only">
        {pt ? `Passo ${current} de ${total}` : `Step ${current} of ${total}`}
      </span>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? "w-6 bg-[#1B6545]" : i === current ? "w-8 bg-[#1B6545]" : "w-3 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const [step, setStep] = useState<Step>("welcome");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cleanerName, setCleanerName] = useState("");
  const [cleanerPhone, setCleanerPhone] = useState("");
  const [cleanerRate, setCleanerRate] = useState("15");

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const queryClient = useQueryClient();

  const pt = language === "pt";
  const stepIndex = STEPS.indexOf(step);
  const userName = session?.user?.name?.split(" ")[0] || (pt ? "gestor" : "manager");

  async function finishOnboarding() {
    setIsSubmitting(true);
    try {
      await api.post("/user/onboarding", {});
      // Update cache before navigating so OnboardingGate doesn't redirect back
      queryClient.setQueryData(["onboarding-status"], { completed: true });
      router.replace("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : pt ? "Erro ao finalizar. Tente novamente." : "Failed to complete setup. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddCleaner() {
    if (!cleanerName.trim()) {
      setStep("client");
      return;
    }
    try {
      await api.post("/cleaners", {
        name: cleanerName.trim(),
        phone: cleanerPhone.trim() || undefined,
        hourlyRate: parseFloat(cleanerRate) || 15,
      });
    } catch {
      toast.warning(
        pt
          ? "Colaboradora não foi salva agora — adicione depois em Colaboradores."
          : "Cleaner wasn't saved — you can add them later in Cleaners."
      );
    }
    setStep("client");
  }

  async function handleAddClient() {
    if (!clientName.trim()) {
      setStep("done");
      return;
    }
    try {
      await api.post("/clients", {
        name: clientName.trim(),
        address: clientAddress.trim() || undefined,
      });
    } catch {
      toast.warning(
        pt
          ? "Cliente não foi salvo agora — adicione depois em Clientes."
          : "Client wasn't saved — you can add them later in Clients."
      );
    }
    setStep("done");
  }

  const slideVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        {step !== "welcome" && step !== "done" && (
          <div className="mb-6 flex items-center justify-between">
            <StepIndicator current={stepIndex} total={STEPS.length - 1} pt={pt} />
            <span className="text-xs text-gray-400">
              {stepIndex} / {STEPS.length - 2}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP: Welcome */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#1B6545] flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {pt
                    ? `Bem-vindo, ${userName}!`
                    : `Welcome, ${userName}!`}
                </h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  {pt
                    ? "Vamos configurar sua conta em 3 passos rápidos para você começar a gerenciar sua equipe de limpeza."
                    : "Let's set up your account in 3 quick steps so you can start managing your cleaning team."}
                </p>
              </div>

              <div className="text-left space-y-3">
                {[
                  { icon: Globe, label: pt ? "Idioma e moeda" : "Language & currency" },
                  { icon: UserPlus, label: pt ? "Adicionar primeiro colaborador" : "Add first cleaner" },
                  { icon: Building2, label: pt ? "Adicionar primeiro cliente" : "Add first client" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#1B6545]" />
                    </div>
                    <span className="text-sm text-gray-700">{label}</span>
                    <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-[#1B6545] hover:bg-[#145236] text-white"
                onClick={() => setStep("preferences")}
              >
                {pt ? "Começar" : "Get started"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP: Preferences */}
          {step === "preferences" && (
            <motion.div
              key="preferences"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {pt ? "Idioma e moeda" : "Language & currency"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {pt
                    ? "Você pode mudar isso depois nas configurações."
                    : "You can change this later in Settings."}
                </p>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  {pt ? "Idioma" : "Language"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["pt", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        language === lang
                          ? "border-[#1B6545] bg-[#E6F4ED] text-[#1B6545]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {lang === "pt" ? "🇧🇷 Português" : "🇬🇧 English"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Coins className="h-4 w-4 text-gray-400" />
                  {pt ? "Moeda" : "Currency"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCurrency(c.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                        currency === c.value
                          ? "border-[#1B6545] bg-[#E6F4ED] text-[#1B6545]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-bold mr-1">{c.symbol}</span>
                      {c.value}
                      <p className="text-[10px] font-normal opacity-70 mt-0.5">{c.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-[#1B6545] hover:bg-[#145236] text-white"
                onClick={() => setStep("cleaner")}
              >
                {pt ? "Continuar" : "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP: Add cleaner */}
          {step === "cleaner" && (
            <motion.div
              key="cleaner"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {pt ? "Adicionar colaborador" : "Add a cleaner"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {pt
                    ? "Adicione sua primeira diarista. Você pode pular e adicionar depois."
                    : "Add your first cleaner. You can skip and add later."}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="onb-cleaner-name" className="text-sm font-medium text-gray-700 block mb-1">
                    {pt ? "Nome *" : "Name *"}
                  </label>
                  <Input
                    id="onb-cleaner-name"
                    placeholder={pt ? "Ex: Ana Santos" : "e.g. Ana Santos"}
                    value={cleanerName}
                    onChange={(e) => setCleanerName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="onb-cleaner-phone" className="text-sm font-medium text-gray-700 block mb-1">
                    {pt ? "Telefone" : "Phone"}
                  </label>
                  <Input
                    id="onb-cleaner-phone"
                    placeholder={pt ? "Ex: +44 7700 100001" : "e.g. +44 7700 100001"}
                    value={cleanerPhone}
                    onChange={(e) => setCleanerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="onb-cleaner-rate" className="text-sm font-medium text-gray-700 block mb-1">
                    {pt ? `Valor por hora (${currency})` : `Hourly rate (${currency})`}
                  </label>
                  <Input
                    id="onb-cleaner-rate"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="15"
                    value={cleanerRate}
                    onChange={(e) => setCleanerRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("client")}
                >
                  {pt ? "Pular" : "Skip"}
                </Button>
                <Button
                  className="flex-1 bg-[#1B6545] hover:bg-[#145236] text-white"
                  onClick={handleAddCleaner}
                >
                  {pt ? "Adicionar" : "Add"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP: Add client */}
          {step === "client" && (
            <motion.div
              key="client"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {pt ? "Adicionar cliente" : "Add a client"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {pt
                    ? "Adicione seu primeiro cliente. Você pode pular e adicionar depois."
                    : "Add your first client. You can skip and add later."}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="onb-client-name" className="text-sm font-medium text-gray-700 block mb-1">
                    {pt ? "Nome *" : "Name *"}
                  </label>
                  <Input
                    id="onb-client-name"
                    placeholder={pt ? "Ex: Casa Ramos" : "e.g. Casa Ramos"}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="onb-client-address" className="text-sm font-medium text-gray-700 block mb-1">
                    {pt ? "Endereço" : "Address"}
                  </label>
                  <Input
                    id="onb-client-address"
                    placeholder={pt ? "Ex: 12 Oak Lane, SW1A 1AA" : "e.g. 12 Oak Lane, SW1A 1AA"}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("done")}
                >
                  {pt ? "Pular" : "Skip"}
                </Button>
                <Button
                  className="flex-1 bg-[#1B6545] hover:bg-[#145236] text-white"
                  onClick={handleAddClient}
                >
                  {pt ? "Adicionar" : "Add"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP: Done */}
          {step === "done" && (
            <motion.div
              key="done"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-[#E6F4ED] flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="h-9 w-9 text-[#1B6545]" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {pt ? "Tudo pronto!" : "All set!"}
                </h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  {pt
                    ? "Sua conta está configurada. Você pode adicionar mais colaboradores, clientes e configurar preços nas configurações."
                    : "Your account is set up. You can add more cleaners, clients and configure prices in Settings."}
                </p>
              </div>

              <div className="text-left space-y-2">
                {[
                  { label: pt ? "Configure preços dos serviços" : "Configure service prices", href: "/settings" },
                  { label: pt ? "Criar agenda da semana" : "Create the week's schedule", href: "/servicos" },
                  { label: pt ? "Ver o dashboard" : "View the dashboard", href: "/dashboard" },
                ].map(({ label, href }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <ChevronRight className="h-4 w-4 text-[#1B6545] shrink-0" />
                    {label}
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-[#1B6545] hover:bg-[#145236] text-white"
                onClick={finishOnboarding}
                disabled={isSubmitting}
              >
                {pt ? "Ir para o dashboard" : "Go to dashboard"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
