"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  Users,
  Target,
  Shield,
  Heart,
  TrendingUp,
  Star,
  Sparkles,
  Briefcase,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

const ICON_MAP: Record<string, LucideIcon> = {
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

const CATEGORY_COLORS: Record<string, string> = {
  onboarding: "#1B6545",
  growth: "#2463EB",
  quality: "#E24B4A",
  consistency: "#8B5CF6",
  milestone: "#BA7517",
};

function AchievementIcon({ icon, unlocked, color }: { icon: string; unlocked: boolean; color: string }) {
  const Icon = ICON_MAP[icon] ?? Star;
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{
        backgroundColor: unlocked ? `${color}20` : "#F3F4F6",
      }}
    >
      {unlocked ? (
        <Icon className="h-6 w-6" style={{ color }} />
      ) : (
        <Lock className="h-5 w-5 text-gray-300" />
      )}
    </div>
  );
}

export default function ConquistasPage() {
  const { language } = useLanguage();
  const pt = language === "pt";

  const { data: unlockedAchievements = [], isLoading } = useQuery<UserAchievement[]>({
    queryKey: ["user-achievements"],
    queryFn: () => api.get("/user/achievements"),
  });

  const totalXP = unlockedAchievements.reduce(
    (sum, ua) => sum + ua.achievement.xpReward,
    0
  );

  const groupedByCategory = unlockedAchievements.reduce<Record<string, UserAchievement[]>>(
    (acc, ua) => {
      const cat = ua.achievement.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ua);
      return acc;
    },
    {}
  );

  const categoryLabels: Record<string, { pt: string; en: string }> = {
    onboarding: { pt: "Primeiros passos", en: "Getting started" },
    growth: { pt: "Crescimento", en: "Growth" },
    quality: { pt: "Qualidade", en: "Quality" },
    consistency: { pt: "Consistência", en: "Consistency" },
    milestone: { pt: "Marcos", en: "Milestones" },
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">
          {pt ? "Conquistas" : "Achievements"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {pt
            ? "Desbloqueie conquistas usando o Shiftsly"
            : "Unlock achievements by using Shiftsly"}
        </p>
      </motion.div>

      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
        className="bg-[#0F3D28] rounded-xl p-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#1B6545] flex items-center justify-center shrink-0">
          <Trophy className="h-7 w-7 text-[#FAC775]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-lg">
            {unlockedAchievements.length}{" "}
            {pt ? "conquistas desbloqueadas" : "achievements unlocked"}
          </p>
          <p className="text-[#4DAE89] text-sm mt-0.5">
            {totalXP} XP {pt ? "acumulados" : "accumulated"}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : unlockedAchievements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
        >
          <Trophy className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">
            {pt ? "Nenhuma conquista ainda" : "No achievements yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
            {pt
              ? "Continue usando o Shiftsly para desbloquear suas primeiras conquistas."
              : "Keep using Shiftsly to unlock your first achievements."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([category, items], groupIdx) => {
            const color = CATEGORY_COLORS[category] ?? "#1B6545";
            const catLabel = categoryLabels[category]?.[pt ? "pt" : "en"] ?? category;

            return (
              <motion.section
                key={category}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: groupIdx * 0.08 }}
              >
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {catLabel}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((ua, i) => (
                    <motion.div
                      key={ua.id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AchievementIcon
                        icon={ua.achievement.icon}
                        unlocked={true}
                        color={color}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                          {ua.achievement.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          {ua.achievement.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${color}15`, color }}
                          >
                            +{ua.achievement.xpReward} XP
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(ua.unlockedAt).toLocaleDateString(
                              pt ? "pt-BR" : "en-GB",
                              { month: "short", year: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
