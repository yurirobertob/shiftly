"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { LanguageProvider } from "@/hooks/use-language";
import { CurrencyProvider } from "@/hooks/use-currency";
import { AchievementToastProvider } from "@/components/achievements/achievement-toast";
import { Toaster } from "sonner";
import { PlanStatusBanners } from "@/components/plan-status-banners";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();

  const { data, isLoading } = useQuery<{ completed: boolean }>({
    queryKey: ["onboarding-status"],
    queryFn: () => api.get("/user/onboarding"),
    enabled: status === "authenticated" && pathname !== "/onboarding",
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (
      !isLoading &&
      data?.completed === false &&
      pathname !== "/onboarding"
    ) {
      router.replace("/onboarding");
    }
  }, [data, isLoading, pathname, router]);

  return <>{children}</>;
}

function AuthContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] dark:bg-gray-950">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </div>
    );
  }

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
          <OnboardingGate>
            <AuthContent>{children}</AuthContent>
          </OnboardingGate>
        </SidebarProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
