"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

export function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="border-t border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[#1B6545] flex items-center justify-center">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">Shiftsly</span>
              <p className="text-xs text-gray-400">{t("footer.tagline")}</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">{t("nav.resources")}</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">{t("nav.plans")}</a>
            <a href="#for-who" className="hover:text-gray-900 transition-colors">{t("nav.testimonials")}</a>
            <Link href="/login" className="hover:text-gray-900 transition-colors">{t("nav.login")}</Link>
          </nav>

          {/* Language toggle + copyright */}
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm">
              <button
                onClick={() => setLanguage("pt")}
                className={`px-1.5 ${language === "pt" ? "font-semibold text-[#1B6545]" : "text-gray-400"}`}
              >
                PT
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setLanguage("en")}
                className={`px-1.5 ${language === "en" ? "font-semibold text-[#1B6545]" : "text-gray-400"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Shiftsly. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-gray-600">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
