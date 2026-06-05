"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Users,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
  Phone,
  Briefcase,
  Target,
  Zap,
  Heart,
  Trophy,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { usePlan } from "@/hooks/use-plan";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  role: string | null;
  createdAt: string;
}

interface UserAchievement {
  id: string;
  unlockedAt: string;
  achievement: {
    slug: string;
    title: string;
    description: string;
    category: string;
    xpReward: number;
    icon: string;
  };
}

const ACHIEVEMENT_ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  users: Users,
  target: Target,
  shield: Shield,
  heart: Heart,
  "trending-up": TrendingUp,
  star: Star,
  sparkles: Sparkles,
  briefcase: Briefcase,
  trophy: Trophy,
};

function AchievementIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ACHIEVEMENT_ICONS[icon] ?? Star;
  return <Icon className={className} />;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { format } = useCurrency();
  const { planLabel, currentCleaners, currentClients, isTrialing, trialDaysLeft } = usePlan();
  const pt = language === "pt";

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => api.get("/user/profile"),
  });

  const { data: achievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["user-achievements"],
    queryFn: () => api.get("/user/achievements"),
  });

  const userName = profile?.name || session?.user?.name || (pt ? "Gestor" : "Manager");
  const userEmail = profile?.email || session?.user?.email || "";
  const userImage = profile?.image || session?.user?.image;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(pt ? "pt-BR" : "en-GB", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const roleLabel = profile?.role === "manager"
    ? pt ? "Gestora" : "Manager"
    : profile?.role ?? (pt ? "Gestora" : "Manager");

  const infoGrid = [
    { label: pt ? "Função" : "Role", value: roleLabel },
    { label: pt ? "Cleaners" : "Cleaners", value: String(currentCleaners) },
    { label: pt ? "Empresa" : "Company", value: profile?.company || "—" },
    { label: "Status", value: pt ? "Ativa" : "Active" },
    { label: pt ? "Plano" : "Plan", value: planLabel },
    { label: pt ? "Desde" : "Since", value: memberSince },
  ];

  const unlockedCount = achievements.length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-gray-500"
      >
        <Link href="/settings" className="hover:text-gray-700 cursor-pointer transition-colors">
          {pt ? "Configurações" : "Settings"}
        </Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">{pt ? "Perfil" : "Profile"}</span>
      </motion.div>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Avatar + identity */}
          <div className="flex flex-col items-center md:items-start gap-3 md:w-[200px] shrink-0">
            <div className="relative">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover ring-3 ring-[#1B6545] ring-offset-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1B6545] flex items-center justify-center ring-3 ring-[#1B6545] ring-offset-2">
                  <span className="text-xl font-bold text-white">{initials}</span>
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1B6545] rounded-full px-2.5 py-0.5 shadow-sm">
                <Shield className="h-3 w-3 text-white" />
                <span className="text-[10px] font-semibold text-white">{planLabel}</span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-lg font-semibold text-gray-900">{userName}</h1>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
            <Link
              href="/settings"
              className="mt-1 text-xs font-medium text-[#1B6545] border border-[#1B6545] rounded-full px-4 py-1.5 hover:bg-[#E6F4ED] transition-colors"
            >
              {pt ? "Editar perfil" : "Edit Profile"}
            </Link>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200 self-stretch" />

          {/* Right: Info grid */}
          <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-4">
            {infoGrid.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400">{item.label}</p>
                {item.label === "Status" ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#1B6545]" />
                    <span className="text-xs font-semibold text-[#1B6545]">{item.value}</span>
                  </div>
                ) : item.label === (pt ? "Plano" : "Plan") ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B6545] bg-[#E6F4ED] rounded-full px-2 py-0.5 mt-0.5">
                    <Shield className="h-3 w-3" />
                    {item.value}
                    {isTrialing && trialDaysLeft !== null && (
                      <span className="ml-1 text-[9px] text-amber-600">
                        ({trialDaysLeft}d trial)
                      </span>
                    )}
                  </span>
                ) : (
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                )}
              </div>
            ))}
            <div>
              <p className="text-xs text-gray-400">{pt ? "Telefone" : "Phone"}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {profile?.phone || <span className="text-gray-400 font-normal">—</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{pt ? "Localização" : "Location"}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {profile?.address
                  ? profile.address.split(",").slice(-1)[0].trim()
                  : <span className="text-gray-400 font-normal">—</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{pt ? "Clientes" : "Clients"}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{currentClients}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Achievements list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
          className="bg-white border border-gray-200 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {pt ? "Conquistas desbloqueadas" : "Unlocked achievements"}
            </h3>
            <Link href="/conquistas" className="text-xs text-[#1B6545] font-medium hover:underline">
              {pt ? "Ver todas →" : "View all →"}
            </Link>
          </div>

          {achievements.length === 0 ? (
            <div className="py-8 text-center">
              <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {pt
                  ? "Nenhuma conquista ainda. Continue usando o app!"
                  : "No achievements yet. Keep using the app!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {achievements.slice(0, 6).map((ua) => (
                <div key={ua.id} className="py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4ED] flex items-center justify-center shrink-0">
                    <AchievementIcon icon={ua.achievement.icon} className="h-4 w-4 text-[#1B6545]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {ua.achievement.title}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      +{ua.achievement.xpReward} XP ·{" "}
                      {new Date(ua.unlockedAt).toLocaleDateString(pt ? "pt-BR" : "en-GB", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column: summary + preferences */}
        <div className="space-y-6">
          {/* Achievements summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
            className="flex items-center justify-between p-4 bg-gray-50/80 border border-gray-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F3D28] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#FAC775]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {unlockedCount} {pt ? "conquistas" : "achievements"}
                </p>
                <p className="text-xs text-gray-500">
                  {pt ? "Desbloqueadas" : "Unlocked"}
                </p>
              </div>
            </div>
            <Link href="/conquistas" className="text-sm text-[#1B6545] font-medium hover:underline">
              {pt ? "Ver todas" : "View all"} →
            </Link>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 pb-3 mb-3 border-b border-gray-100">
              {pt ? "Preferências" : "Preferences"}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {pt ? "Moeda" : "Currency"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {pt ? "Exibição de valores" : "Value display"}
                  </p>
                </div>
                <CurrencySelector size="sm" />
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {pt ? "Idioma" : "Language"}
                  </p>
                </div>
                <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  {pt ? "Português" : "English"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {pt ? "Configurações" : "Settings"}
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="text-[11px] text-[#1B6545] font-medium hover:underline"
                >
                  {pt ? "Abrir →" : "Open →"}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
