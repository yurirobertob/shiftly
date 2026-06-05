"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import {
  Calendar,
  ClipboardList,
  BarChart3,
  Users,
  Building2,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function AppNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { language } = useLanguage();
  const pt = language === "pt";

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const mainTabs = [
    { name: pt ? "Semana" : "Week", href: "/dashboard", icon: Calendar },
    { name: pt ? "Serviços" : "Services", href: "/servicos", icon: ClipboardList },
    { name: pt ? "Relatórios" : "Reports", href: "/relatorios", icon: BarChart3 },
  ];

  const moreTabs = [
    { name: pt ? "Colaboradores" : "Cleaners", href: "/colaboradores", icon: Users },
    { name: pt ? "Unidades" : "Units", href: "/unidades", icon: Building2 },
    { name: pt ? "Clientes" : "Clients", href: "/clientes", icon: UserCircle },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowUserMenu(false);
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isMoreActive = moreTabs.some((tab) => pathname.startsWith(tab.href));

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center border-b bg-white px-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 mr-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6545]">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="text-lg font-bold hidden sm:inline">Shiftsly</span>
      </Link>

      {/* Main nav */}
      <nav className="flex items-center gap-1" aria-label={pt ? "Navegação principal" : "Main navigation"}>
        {mainTabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1B6545]/10 text-[#1B6545]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">{tab.name}</span>
            </Link>
          );
        })}

        {/* More dropdown */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            aria-expanded={showMoreMenu}
            aria-haspopup="menu"
            aria-label={pt ? "Mais páginas" : "More pages"}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isMoreActive
                ? "bg-[#1B6545]/10 text-[#1B6545]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="hidden md:inline">{pt ? "Mais" : "More"}</span>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {showMoreMenu && (
            <div
              role="menu"
              className="absolute left-0 top-full mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg"
            >
              {moreTabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    role="menuitem"
                    onClick={() => setShowMoreMenu(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      active ? "bg-[#1B6545]/10 text-[#1B6545]" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/settings/upgrade"
          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#1B6545] to-[#2463EB] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Upgrade
        </Link>

        {/* User avatar dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-expanded={showUserMenu}
            aria-haspopup="menu"
            aria-label={pt ? "Menu do usuário" : "User menu"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6545] text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            {initials}
          </button>

          {showUserMenu && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg"
            >
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                {pt ? "Configurações" : "Settings"}
              </Link>
              <button
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {pt ? "Sair" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
