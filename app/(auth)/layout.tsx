"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { LanguageProvider } from "@/hooks/use-language";
import { CurrencyProvider } from "@/hooks/use-currency";
import { AchievementToastProvider } from "@/components/achievements/achievement-toast";
import { Toaster } from "sonner";
import { PlanStatusBanners } from "@/components/plan-status-banners";

function AuthContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-gray-950">
      <Sidebar />
      <main
        className={`transition-all duration-300 ease-in-out overscroll-none ml-0 pt-14 md:pt-0 ${
          isCollapsed ? "md:ml-[64px]" : "md:ml-[240px]"
        }`}
      >
        <PlanStatusBanners />
        {children}
      </main>
      <AchievementToastProvider />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <SidebarProvider>
          <AuthContent>{children}</AuthContent>
        </SidebarProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
