"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Building2,
  Pencil,
  Sun,
  Moon,
  Monitor,
  LogOut,
  CreditCard,
  Sparkles,
  Phone,
  MapPin,
  Shield,
  Plus,
  Check,
  X,
  Loader2,
  Coins,
  Globe,
  ClipboardList,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency, type Currency } from "@/hooks/use-currency";
import { usePlan } from "@/hooks/use-plan";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Theme = "light" | "dark" | "auto";

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem("shiftsly-theme", theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("shiftsly-dark-mode", "true");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("shiftsly-dark-mode", "false");
  } else {
    // Auto
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("shiftsly-dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("shiftsly-dark-mode", "false");
    }
  }
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  role: string | null;
}

export default function SettingsPage() {
  const { language, t } = useLanguage();
  const { data: session, update: updateSession } = useSession();
  const { plan, planLabel, status, isTrialing, trialDaysLeft } = usePlan();
  const queryClient = useQueryClient();
  const { currency, setCurrency } = useCurrency();

  // Service prices
  interface ServicePriceRow { id: string; serviceType: string; priceBRL: number; priceUSD: number; priceGBP: number; priceEUR: number }
  const { data: servicePrices, isLoading: pricesLoading } = useQuery<ServicePriceRow[]>({
    queryKey: ["service-prices"],
    queryFn: () => api.get("/service-prices"),
  });

  const [editPrices, setEditPrices] = useState<Record<string, { BRL: string; USD: string; GBP: string; EUR: string }>>({});
  const [isPricesEditing, setIsPricesEditing] = useState(false);

  // Sync prices when data loads
  useEffect(() => {
    if (servicePrices && !isPricesEditing) {
      const map: Record<string, { BRL: string; USD: string; GBP: string; EUR: string }> = {};
      for (const sp of servicePrices) {
        map[sp.serviceType] = {
          BRL: String(sp.priceBRL),
          USD: String(sp.priceUSD),
          GBP: String(sp.priceGBP),
          EUR: String(sp.priceEUR),
        };
      }
      setEditPrices(map);
    }
  }, [servicePrices]);

  const savePricesMut = useMutation({
    mutationFn: (prices: Array<{ serviceType: string; priceBRL: number; priceUSD: number; priceGBP: number; priceEUR: number }>) =>
      api.put("/service-prices", { prices }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-prices"] });
      toast.success(language === "pt" ? "Preços atualizados!" : "Prices updated!");
      setIsPricesEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const serviceTypeLabels: Record<string, { pt: string; en: string }> = {
    standard: { pt: "Limpeza padrão", en: "Standard cleaning" },
    deep: { pt: "Limpeza pesada", en: "Deep cleaning" },
    "post-construction": { pt: "Pós-obra", en: "Post-construction" },
    airbnb: { pt: "Airbnb", en: "Airbnb" },
    other: { pt: "Outro", en: "Other" },
  };

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("shiftsly-theme") as Theme) || "light";
    }
    return "light";
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    name: "",
    phone: "",
    address: "",
    company: "",
    role: "manager",
  });

  // Fetch profile
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => api.get("/user/profile"),
  });

  // Sync edit fields when profile loads
  useEffect(() => {
    if (profile) {
      setEditFields({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        company: profile.company || "",
        role: profile.role || "manager",
      });
    }
  }, [profile]);

  // Listen for auto theme media changes
  useEffect(() => {
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const saveMutation = useMutation({
    mutationFn: (data: typeof editFields) => api.put("/user/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      updateSession();
      toast.success(language === "pt" ? "Perfil atualizado!" : "Profile updated!");
      setIsEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const user = session?.user;
  const displayName = profile?.name || user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = (r: string | null) => {
    if (r === "cleaner") return language === "pt" ? "Colaboradora" : "Cleaner";
    return language === "pt" ? "Gestora" : "Manager";
  };

  const themeOptions: { key: Theme; label: string; icon: typeof Sun; }[] = [
    { key: "light", label: language === "pt" ? "Claro" : "Light", icon: Sun },
    { key: "dark", label: language === "pt" ? "Escuro" : "Dark", icon: Moon },
    { key: "auto", label: language === "pt" ? "Automático" : "Auto", icon: Monitor },
  ];

  // Field row helper
  const ProfileField = ({ icon: Icon, label, value, fieldKey, placeholder }: {
    icon: typeof Mail;
    label: string;
    value: string | null;
    fieldKey?: keyof typeof editFields;
    placeholder?: string;
  }) => {
    if (isEditing && fieldKey) {
      return (
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5">
          <Icon className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            value={editFields[fieldKey]}
            onChange={(e) => setEditFields({ ...editFields, [fieldKey]: e.target.value })}
            placeholder={placeholder || label}
            className="h-7 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between rounded-xl border px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">{label}</span>
        </div>
        {value ? (
          <span className="text-sm font-medium">{value}</span>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#22C55E] hover:bg-[#F0FDF4] transition-colors"
          >
            <Plus className="h-3 w-3" />
            {language === "pt" ? "Adicionar" : "Add"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-2xl p-5 md:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{language === "pt" ? "Configurações" : "Settings"}</h1>

      {/* Profile */}
      <Card className="mb-4 rounded-2xl">
        <CardHeader className="border-b px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            {language === "pt" ? "Perfil" : "Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1B6545] text-lg font-bold text-white">
                {initials}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    value={editFields.name}
                    onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                    className="h-7 text-sm font-medium border-dashed"
                    placeholder={language === "pt" ? "Seu nome" : "Your name"}
                  />
                ) : (
                  <p className="font-medium">{displayName}</p>
                )}
                <p className="text-sm text-muted-foreground">{roleLabel(profile?.role ?? null)}</p>
              </div>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setEditFields({
                        name: profile.name || "",
                        phone: profile.phone || "",
                        address: profile.address || "",
                        company: profile.company || "",
                        role: profile.role || "manager",
                      });
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  {language === "pt" ? "Cancelar" : "Cancel"}
                </Button>
                <Button
                  size="sm"
                  className="bg-[#22C55E] hover:bg-[#16A34A] rounded-xl"
                  onClick={() => saveMutation.mutate(editFields)}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  )}
                  {language === "pt" ? "Salvar" : "Save"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {language === "pt" ? "Editar" : "Edit"}
              </Button>
            )}
          </div>

          <div className="grid gap-3">
            <ProfileField icon={Mail} label="Email" value={user?.email || null} />

            {isEditing ? (
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5">
                <Shield className="h-4 w-4 text-gray-400 shrink-0" />
                <select
                  value={editFields.role}
                  onChange={(e) => setEditFields({ ...editFields, role: e.target.value })}
                  className="flex-1 bg-transparent text-sm outline-none"
                >
                  <option value="manager">{language === "pt" ? "Gestora" : "Manager"}</option>
                  <option value="cleaner">{language === "pt" ? "Colaboradora" : "Cleaner"}</option>
                </select>
              </div>
            ) : (
              <ProfileField icon={Shield} label={language === "pt" ? "Cargo" : "Role"} value={roleLabel(profile?.role ?? null)} />
            )}

            <ProfileField
              icon={Building2}
              label={language === "pt" ? "Empresa" : "Company"}
              value={profile?.company ?? null}
              fieldKey="company"
              placeholder={language === "pt" ? "Nome da empresa" : "Company name"}
            />
            <ProfileField
              icon={Phone}
              label={language === "pt" ? "Telefone" : "Phone"}
              value={profile?.phone ?? null}
              fieldKey="phone"
              placeholder={language === "pt" ? "Seu telefone" : "Your phone"}
            />
            <ProfileField
              icon={MapPin}
              label={language === "pt" ? "Endereço" : "Address"}
              value={profile?.address ?? null}
              fieldKey="address"
              placeholder={language === "pt" ? "Seu endereço" : "Your address"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="mb-4 rounded-2xl">
        <CardHeader className="border-b px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-4 w-4" />
            {language === "pt" ? "Aparência" : "Appearance"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleThemeChange(opt.key)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    isActive
                      ? "border-[#1B6545] bg-[#E6F4ED]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`flex h-14 w-full items-center justify-center rounded-xl ${
                      opt.key === "dark"
                        ? "bg-gray-900"
                        : opt.key === "auto"
                          ? "bg-gradient-to-r from-white to-gray-900"
                          : "bg-white"
                    } border`}
                  >
                    <Icon className={`h-5 w-5 ${opt.key === "dark" ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? "text-[#1B6545]" : "text-gray-600"}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Currency + Language */}
      <Card className="mb-4 rounded-2xl">
        <CardHeader className="border-b px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            {language === "pt" ? "Idioma e Moeda" : "Language & Currency"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">{language === "pt" ? "Moeda" : "Currency"}</p>
            <div className="grid grid-cols-4 gap-2">
              {(["BRL", "USD", "GBP", "EUR"] as Currency[]).map((c) => {
                const labels: Record<Currency, { symbol: string; name: string }> = {
                  BRL: { symbol: "R$", name: "Real" },
                  USD: { symbol: "$", name: "Dollar" },
                  GBP: { symbol: "£", name: "Pound" },
                  EUR: { symbol: "€", name: "Euro" },
                };
                const isActive = currency === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                      isActive ? "border-[#1B6545] bg-[#E6F4ED]" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className={`text-lg font-bold ${isActive ? "text-[#1B6545]" : "text-gray-500"}`}>{labels[c].symbol}</span>
                    <span className={`text-[10px] font-medium ${isActive ? "text-[#1B6545]" : "text-gray-400"}`}>{labels[c].name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Prices */}
      <Card className="mb-4 rounded-2xl">
        <CardHeader className="border-b px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" />
              {language === "pt" ? "Serviços" : "Services"}
            </CardTitle>
            {isPricesEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setIsPricesEditing(false);
                    // Reset from server data
                    if (servicePrices) {
                      const map: Record<string, { BRL: string; USD: string; GBP: string; EUR: string }> = {};
                      for (const sp of servicePrices) {
                        map[sp.serviceType] = { BRL: String(sp.priceBRL), USD: String(sp.priceUSD), GBP: String(sp.priceGBP), EUR: String(sp.priceEUR) };
                      }
                      setEditPrices(map);
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  {language === "pt" ? "Cancelar" : "Cancel"}
                </Button>
                <Button
                  size="sm"
                  className="bg-[#22C55E] hover:bg-[#16A34A] rounded-xl"
                  disabled={savePricesMut.isPending}
                  onClick={() => {
                    const prices = Object.entries(editPrices).map(([serviceType, vals]) => ({
                      serviceType,
                      priceBRL: parseFloat(vals.BRL) || 0,
                      priceUSD: parseFloat(vals.USD) || 0,
                      priceGBP: parseFloat(vals.GBP) || 0,
                      priceEUR: parseFloat(vals.EUR) || 0,
                    }));
                    savePricesMut.mutate(prices);
                  }}
                >
                  {savePricesMut.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                  {language === "pt" ? "Salvar" : "Save"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsPricesEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {language === "pt" ? "Editar" : "Edit"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <p className="text-xs text-gray-500 mb-4">
            {language === "pt"
              ? "Defina o preço fixo de cada tipo de serviço. O valor será aplicado automaticamente ao criar novos serviços."
              : "Set the fixed price for each service type. The value will be automatically applied when creating new services."}
          </p>

          {pricesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2.5">
              {(() => {
                const currencySymbols: Record<Currency, string> = { BRL: "R$", USD: "$", GBP: "£", EUR: "€" };
                const sym = currencySymbols[currency];
                return ["standard", "deep", "post-construction", "airbnb", "other"].map((type) => {
                  const label = serviceTypeLabels[type]?.[language] || type;
                  const vals = editPrices[type] || { BRL: "0", USD: "0", GBP: "0", EUR: "0" };
                  const curVal = vals[currency];
                  return (
                    <div key={type} className="flex items-center justify-between rounded-xl border dark:border-gray-700 px-4 py-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                      {isPricesEditing ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">{sym}</span>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={curVal}
                            onChange={(e) => {
                              setEditPrices((prev) => ({
                                ...prev,
                                [type]: { ...prev[type], [currency]: e.target.value },
                              }));
                            }}
                            className="w-20 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-right text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-[#15803D] dark:text-[#22C55E]">
                          {sym} {parseFloat(curVal || "0").toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="mb-4 rounded-2xl">
        <CardHeader className="border-b px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            {language === "pt" ? "Conta" : "Account"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between rounded-xl border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">{language === "pt" ? "Plano atual" : "Current plan"}</p>
              <p className="text-xs text-muted-foreground">
                {planLabel || "Basic"}{" "}
                {isTrialing && trialDaysLeft !== null && (
                  <span className="text-blue-600">
                    ({language === "pt" ? `${trialDaysLeft} dias de trial` : `${trialDaysLeft} days trial`})
                  </span>
                )}
                {status === "PAST_DUE" && (
                  <span className="text-red-600">
                    ({language === "pt" ? "Pagamento pendente" : "Payment pending"})
                  </span>
                )}
              </p>
            </div>
            {plan === "basic" ? (
              <Link href="/settings/upgrade">
                <Button size="sm" className="bg-gradient-to-r from-[#1B6545] to-[#4DAE89] rounded-xl">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  {language === "pt" ? "Fazer upgrade" : "Upgrade"}
                </Button>
              </Link>
            ) : (
              <Link href="/settings/billing">
                <Button variant="outline" size="sm" className="rounded-xl">
                  {language === "pt" ? "Gerenciar" : "Manage"}
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            {language === "pt" ? "Sair da conta" : "Sign out"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
