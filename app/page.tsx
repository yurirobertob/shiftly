import { cookies } from "next/headers";
import { LanguageProvider } from "@/hooks/use-language";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";

import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesShowcase } from "@/components/landing/features-showcase";

import { MetricsSection } from "@/components/landing/metrics-section";
import { ForWhoSection } from "@/components/landing/for-who-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("shiftsly-lang")?.value;
  const initialLanguage: "pt" | "en" = langCookie === "pt" ? "pt" : "en";

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <div className="min-h-screen bg-white">
        <Navbar />
        <HeroSection />

        <ProblemSection />
        <HowItWorks />
        <FeaturesShowcase />

        <MetricsSection />
        <ForWhoSection />
        <PricingSection />
        <FinalCTA />
        <Footer />
      </div>
    </LanguageProvider>
  );
}
