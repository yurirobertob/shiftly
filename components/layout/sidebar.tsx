"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart2,
  CheckCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Settings,
  Moon,
  Sun,
  Sparkles,
  Building2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "./sidebar-context";
import { usePlan } from "@/hooks/use-plan";
import { useLanguage } from "@/hooks/use-language";
import { BrazilFlag, UKFlag } from "@/components/ui/flag-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { getAvatarColor } from "@/lib/avatar-color";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
  dot?: boolean;
};

type NavSection = {
  title: { pt: string; en: string };
  items: NavItem[];
};

/* ─── Nav Link ─── */
function NavLink({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  if (isCollapsed) {
    return (
      <Link
        href={item.href}
        title={item.label}
        className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors ${
          isActive
            ? "bg-[#22C55E] text-white"
            : "text-gray-400 dark:text-gray-500 hover:bg-[#F0FDF4] dark:hover:bg-gray-800 hover:text-[#15803D] dark:hover:text-green-400"
        }`}
      >
        <Icon className="h-5 w-5" />
        {item.dot && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        )}
        {item.badge && isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white/25 text-[8px] font-bold flex items-center justify-center text-white">{item.badge}</span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        isActive
          ? "bg-[#22C55E] text-white"
          : "text-gray-600 dark:text-gray-400 hover:bg-[#F0FDF4] dark:hover:bg-gray-800 hover:text-[#15803D] dark:hover:text-green-400"
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}`} />
      <span className="text-sm font-medium flex-1">{item.label}</span>
      {item.badge && (
        <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
          isActive ? "bg-white/25 text-white" : "bg-[#DCFCE7] text-[#15803D]"
        }`}>
          {item.badge}
        </span>
      )}
      {item.dot && (
        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 shrink-0" />
      )}
    </Link>
  );
}

/* ─── Sidebar Content ─── */
function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
  const { data: session } = useSession();
  const { toggleSidebar, setMobileOpen } = useSidebar();
  const { plan } = usePlan();
  const { t, language, setLanguage } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shiftsly-dark-mode") === "true";
    }
    return false;
  });

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("shiftsly-dark-mode", String(next));
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return next;
    });
  }, []);

  // Sync dark mode class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const { data: cleanerCountData } = useQuery<any[]>({
    queryKey: ["cleaners-sidebar"],
    queryFn: () => api.get("/cleaners?status=ACTIVE"),
    staleTime: 30000,
  });
  const cleanerCount = cleanerCountData?.length ?? 0;

  const sections: NavSection[] = [
    {
      title: { pt: "GESTÃO", en: "MANAGEMENT" },
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Users, label: t("dashboard.sidebar.cleaners"), href: "/colaboradores", badge: cleanerCount > 0 ? String(cleanerCount) : undefined },
        { icon: Building2, label: language === "pt" ? "Clientes" : "Clients", href: "/clientes" },
      ],
    },
    {
      title: { pt: "FINANCEIRO", en: "FINANCE" },
      items: [
        { icon: BarChart2, label: t("dashboard.sidebar.reports"), href: "/relatorios" },
        { icon: CheckCircle, label: t("dashboard.sidebar.payroll"), href: "/fechamento" },
      ],
    },
    {
      title: { pt: "SISTEMA", en: "SYSTEM" },
      items: [
        { icon: Settings, label: language === "pt" ? "Configurações" : "Settings", href: "/settings" },
      ],
    },
  ];

  const userName = session?.user?.name ?? "User";
  const userImage = session?.user?.image;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarColor = getAvatarColor(userName);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      {/* Logo + collapse button */}
      <div className={`flex h-14 items-center border-b border-gray-100 dark:border-gray-800 shrink-0 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center hover:opacity-80 transition-opacity ${isCollapsed ? "" : "gap-2.5"}`}
        >
          <div className="h-8 w-8 rounded-lg bg-[#22C55E] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">Shiftsly</span>
          )}
        </Link>
        {/* Collapse button — desktop only */}
        <button
          onClick={toggleSidebar}
          className={`hidden md:flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm ${isCollapsed ? "mx-auto mt-2" : ""}`}
          title={isCollapsed ? "Expand sidebar" : t("dashboard.sidebar.collapse")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Nav sections */}
      <nav className={`flex-1 py-3 overflow-y-auto ${isCollapsed ? "px-2" : "px-3"}`}>
        {sections.map((section, sIdx) => (
          <div key={section.title.en}>
            {/* Section label */}
            {!isCollapsed ? (
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mt-5 mb-2 first:mt-2">
                {language === "pt" ? section.title.pt : section.title.en}
              </p>
            ) : (
              sIdx > 0 && <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 my-3" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.href} onClick={() => setMobileOpen(false)}>
                  <NavLink item={item} isCollapsed={isCollapsed} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Dark mode toggle in SISTEMA section */}
        {!isCollapsed ? (
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 w-full text-gray-600 dark:text-gray-400 hover:bg-[#F0FDF4] dark:hover:bg-gray-800 hover:text-[#15803D] dark:hover:text-green-400 transition-colors mt-0.5"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-gray-400 dark:text-gray-500" /> : <Moon className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
            <span className="text-sm font-medium flex-1 text-left">{language === "pt" ? "Modo escuro" : "Dark mode"}</span>
            <div className={`w-8 h-4.5 rounded-full flex items-center px-0.5 transition-colors ${isDarkMode ? "bg-[#22C55E]" : "bg-gray-300"}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? "translate-x-3.5" : "translate-x-0"}`} />
            </div>
          </button>
        ) : (
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-gray-400 dark:text-gray-500 hover:bg-[#F0FDF4] dark:hover:bg-gray-800 hover:text-[#15803D] dark:hover:text-green-400 transition-colors"
            title={language === "pt" ? "Modo escuro" : "Dark mode"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
      </nav>

      {/* Separator */}
      <div className="border-t border-gray-100 dark:border-gray-800 mx-3" />

      {/* Language toggle */}
      <div className={`shrink-0 py-2 ${isCollapsed ? "px-2 flex flex-col items-center gap-2" : "px-3 space-y-2"}`}>
        <button
          onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
          className={`flex items-center rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            isCollapsed ? "justify-center w-10 h-10" : "gap-3 px-3 py-2.5 w-full text-gray-600 dark:text-gray-400"
          }`}
          title={language === "pt" ? "Switch to English" : "Mudar para Portugues"}
        >
          {language === "pt" ? <BrazilFlag className="w-5 h-3.5 rounded-[2px]" /> : <UKFlag className="w-5 h-3.5 rounded-[2px]" />}
          {!isCollapsed && (
            <span className="text-sm font-medium">{language === "pt" ? "PT" : "EN"}</span>
          )}
        </button>
      </div>

      {/* Upgrade Plan — only for Basic */}
      {!isCollapsed && plan === "basic" && (
        <div className="mx-3 mb-2 shrink-0">
          <Link
            href="/settings/upgrade"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1B6545] to-[#4DAE89] px-4 py-3 text-white hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{language === "pt" ? "Upgrade Plan" : "Upgrade Plan"}</p>
              <p className="text-[10px] text-white/70">{language === "pt" ? "Desbloqueie mais recursos" : "Unlock more features"}</p>
            </div>
          </Link>
        </div>
      )}
      {isCollapsed && plan === "basic" && (
        <Link
          href="/settings/upgrade"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r from-[#1B6545] to-[#4DAE89] text-white hover:opacity-90 transition-opacity"
          title="Upgrade Plan"
        >
          <Sparkles className="h-4 w-4" />
        </Link>
      )}

      {/* Separator */}
      <div className="border-t border-gray-100 dark:border-gray-800 mx-3" />

      {/* Profile + Sign out at bottom */}
      <div className={`shrink-0 py-3 ${isCollapsed ? "px-2" : "px-3"}`}>
        {/* Profile */}
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center rounded-lg transition-colors hover:bg-gray-50 group ${
            isCollapsed ? "justify-center w-10 h-10 mx-auto mb-2" : "gap-2.5 px-2.5 py-2 w-full mb-1"
          }`}
        >
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
              style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
            >
              {initials}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t("dashboard.sidebar.manager")}</p>
            </div>
          )}
        </Link>

        {/* Sign out — same hover style as nav items */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-[#F0FDF4] dark:hover:bg-gray-800 hover:text-[#15803D] dark:hover:text-green-400 transition-colors ${
            isCollapsed
              ? "w-10 h-10 justify-center mx-auto"
              : "w-full gap-3 px-3 py-2"
          }`}
          title={t("dashboard.sidebar.signOut")}
        >
          <LogOut className="h-5 w-5 text-gray-400 shrink-0" />
          {!isCollapsed && <span>{t("dashboard.sidebar.signOut")}</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 flex md:hidden h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        <SidebarContent isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-white dark:bg-gray-900 shadow-xl md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent isCollapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
