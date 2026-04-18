"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
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

const mainTabs = [
  { name: "Semana", href: "/dashboard", icon: Calendar },
  { name: "Serviços", href: "/servicos", icon: ClipboardList },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

const moreTabs = [
  { name: "Colaboradores", href: "/colaboradores", icon: Users },
  { name: "Unidades", href: "/unidades", icon: Building2 },
  { name: "Clientes", href: "/clientes", icon: UserCircle },
];

export function AppNavbar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMoreActive = moreTabs.some((tab) => pathname.startsWith(tab.href));

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center border-b bg-white px-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 mr-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2463EB]">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="text-lg font-bold hidden sm:inline">Shiftsly</span>
      </Link>

      {/* Center navigation tabs */}
      <nav className="flex items-center gap-1">
        {mainTabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2463EB]/10 text-[#2463EB]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.name}</span>
            </Link>
          );
        })}

        {/* More dropdown for secondary pages */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isMoreActive
                ? "bg-[#2463EB]/10 text-[#2463EB]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="hidden md:inline">Mais</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showMoreMenu && (
            <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
              {moreTabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-[#2463EB]/10 text-[#2463EB]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
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
        {/* Upgrade button */}
        <Link
          href="/settings/upgrade"
          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2463EB] to-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Upgrade
        </Link>

        {/* User avatar dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2463EB] text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            GM
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
