"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { SignInModal } from "@/components/ui/sign-in-modal";
import { LanguageToggle } from "@/components/ui/language-toggle";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const links = [
    { label: t("nav.resources"), href: "#features" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.plans"), href: "#pricing" },
    { label: t("nav.testimonials"), href: "#for-who" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="mx-auto grid h-[72px] max-w-6xl grid-cols-[auto_1fr_auto] items-center px-6">
        {/* Logo — fixed left */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-[#1B6545] flex items-center justify-center">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Shiftsly</span>
        </Link>

        {/* Center nav — desktop, always centered in its column */}
        <nav className="hidden lg:flex items-center justify-center gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50 whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>
        {/* Spacer for when nav is hidden on mobile */}
        <div className="lg:hidden" />

        {/* Right side — fixed right */}
        <div className="flex items-center gap-6 justify-end shrink-0">
          {/* iOS-style draggable language toggle */}
          <LanguageToggle language={language} onChangeLanguage={setLanguage} size="md" />

          <button
            onClick={() => setLoginOpen(true)}
            className="hidden sm:inline-flex min-w-[56px] justify-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            {t("nav.login")}
          </button>

          <button
            onClick={() => setLoginOpen(true)}
            className="hidden sm:inline-flex min-w-[160px] justify-center rounded-lg bg-[#1B6545] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#155236] transition-colors whitespace-nowrap"
          >
            {t("nav.cta")}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-white overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setLoginOpen(true);
                }}
                className="mt-2 rounded-lg bg-[#1B6545] px-5 py-2.5 text-center text-sm font-medium text-white"
              >
                {t("nav.cta")}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <SignInModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
