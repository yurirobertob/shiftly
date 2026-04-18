"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Bell,
  Building2,
  CalendarPlus,
  UserPlus,
  Search,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getAvatarColor } from "@/lib/avatar-color";
import Link from "next/link";

interface UserProfile {
  role: string | null;
  company: string | null;
  name: string | null;
}

interface SearchResult {
  id: string;
  name: string;
  type: "client" | "cleaner";
  subtitle?: string;
}

export function DashboardHeader() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const router = useRouter();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const notifRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => api.get("/user/profile"),
    staleTime: 60000,
  });

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent));
  }, []);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [clients, cleaners] = await Promise.all([
          api.get<any[]>(`/clients?search=${encodeURIComponent(searchQuery)}`).catch(() => []),
          api.get<any[]>(`/cleaners?search=${encodeURIComponent(searchQuery)}`).catch(() => []),
        ]);
        const results: SearchResult[] = [
          ...(clients || []).slice(0, 4).map((c: any) => ({
            id: c.id,
            name: c.name,
            type: "client" as const,
            subtitle: c.address || (language === "pt" ? "Cliente" : "Client"),
          })),
          ...(cleaners || []).slice(0, 4).map((c: any) => ({
            id: c.id,
            name: c.name,
            type: "cleaner" as const,
            subtitle: c.phone || (language === "pt" ? "Colaboradora" : "Cleaner"),
          })),
        ];
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, language]);

  // Close search on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const { data: absences } = useQuery<any[]>({
    queryKey: ["absences-today", todayStr],
    queryFn: () => api.get(`/absences?from=${todayStr}&to=${todayStr}&covered=false`),
    staleTime: 30000,
  });
  const notifCount = absences?.length ?? 0;

  const userName = profile?.name || session?.user?.name || "User";
  const userImage = session?.user?.image;
  const avatarColor = getAvatarColor(userName);
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = profile?.role === "cleaner"
    ? (language === "pt" ? "Colaboradora" : "Cleaner")
    : (language === "pt" ? "Gestora" : "Manager");

  const addOptions = [
    {
      icon: Building2,
      label: language === "pt" ? "Novo cliente" : "New client",
      desc: language === "pt" ? "Adicionar cliente ou propriedade" : "Add client or property",
      action: () => router.push("/clientes"),
    },
    {
      icon: CalendarPlus,
      label: language === "pt" ? "Novo serviço agendado" : "New scheduled service",
      desc: language === "pt" ? "Alocar a um cliente" : "Assign to a client",
      action: () => router.push("/clientes?filter=unassigned"),
    },
    {
      icon: UserPlus,
      label: language === "pt" ? "Nova colaboradora" : "New cleaner",
      desc: language === "pt" ? "Cadastrar colaboradora" : "Register cleaner",
      action: () => router.push("/colaboradores"),
    },
  ];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 mb-6">
      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-lg">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder={language === "pt" ? "Buscar..." : "Search..."}
            className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 py-2 pl-9 pr-16 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#22C55E]/30 transition-colors"
          />
          <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            {isMac ? "⌘" : "Ctrl"} F
          </kbd>
        </div>

        {/* Search results dropdown */}
        {searchFocused && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-xl max-h-72 overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-3 text-center text-xs text-gray-400">
                {language === "pt" ? "Buscando..." : "Searching..."}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-gray-400">
                {language === "pt" ? "Nenhum resultado" : "No results"}
              </div>
            ) : (
              <>
                {searchResults.filter(r => r.type === "client").length > 0 && (
                  <>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase">
                      {language === "pt" ? "Clientes" : "Clients"}
                    </p>
                    {searchResults.filter(r => r.type === "client").map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { router.push("/clientes"); setSearchFocused(false); setSearchQuery(""); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{r.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{r.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
                {searchResults.filter(r => r.type === "cleaner").length > 0 && (
                  <>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase">
                      {language === "pt" ? "Colaboradoras" : "Cleaners"}
                    </p>
                    {searchResults.filter(r => r.type === "cleaner").map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { router.push("/colaboradores"); setSearchFocused(false); setSearchQuery(""); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <UserPlus className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{r.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{r.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        {/* Add button */}
        <div className="relative">
          <button
            ref={addRef}
            onClick={() => { setShowAddMenu(!showAddMenu); setShowNotifications(false); }}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white transition-colors"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
          {showAddMenu && createPortal(
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowAddMenu(false)} />
              <div
                className="fixed z-[101] w-64 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 py-2 shadow-xl animate-in fade-in zoom-in-95"
                style={{
                  top: (addRef.current?.getBoundingClientRect().bottom ?? 0) + 6,
                  right: window.innerWidth - (addRef.current?.getBoundingClientRect().right ?? 0),
                }}
              >
                {addOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => { opt.action(); setShowAddMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4] dark:bg-gray-800">
                        <Icon className="h-4 w-4 text-[#22C55E]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</p>
                        <p className="text-[11px] text-gray-400">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>,
            document.body
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifRef}
            onClick={() => { setShowNotifications(!showNotifications); setShowAddMenu(false); }}
            className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="h-4 w-4 text-gray-500" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {notifCount}
              </span>
            )}
          </button>
          {showNotifications && createPortal(
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowNotifications(false)} />
              <div
                className="fixed z-[101] w-72 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-xl animate-in fade-in zoom-in-95"
                style={{
                  top: (notifRef.current?.getBoundingClientRect().bottom ?? 0) + 6,
                  right: window.innerWidth - (notifRef.current?.getBoundingClientRect().right ?? 0),
                }}
              >
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {language === "pt" ? "Notificações" : "Notifications"}
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifCount === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">
                        {language === "pt" ? "Tudo tranquilo por aqui!" : "All quiet here!"}
                      </p>
                    </div>
                  ) : (
                    (absences ?? []).map((a: any) => (
                      <div key={a.id} className="px-4 py-3 border-b last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {a.cleaner?.name} — {language === "pt" ? "Ausente" : "Absent"}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {a.reason || (language === "pt" ? "Sem motivo informado" : "No reason provided")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>,
            document.body
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Profile */}
        <Link href="/settings" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
          {userImage ? (
            <img src={userImage} alt={userName} className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
            >
              {initials}
            </div>
          )}
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">{userName}</p>
            <p className="text-[11px] text-gray-400 leading-tight">{roleLabel}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
