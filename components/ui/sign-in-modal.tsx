"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { X, Mail, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setEmailSent(false);
      setIsLoadingGoogle(false);
      setIsLoadingEmail(false);
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoadingEmail(true);
    try {
      await signIn("resend", { email, callbackUrl: "/dashboard" });
      setEmailSent(true);
    } catch {
      setIsLoadingEmail(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex min-h-[520px]">
              {/* Left column — form */}
              <div className="flex w-full flex-col justify-center px-8 py-10 md:w-1/2 md:px-10">
                {/* Branding */}
                <div className="animate-element mb-8">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B6545]">
                      <span className="text-sm font-bold text-white">S</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      Shiftsly
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Bem-vinda de volta
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-500">
                    Acesse sua conta e gerencie sua equipe
                  </p>
                </div>

                {emailSent ? (
                  <div className="animate-element flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B6545]/10">
                      <Mail className="h-7 w-7 text-[#1B6545]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Verifique seu email
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Enviamos um link de acesso para{" "}
                      <span className="font-medium text-gray-700">
                        {email}
                      </span>
                      . Clique no link para entrar.
                    </p>
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setIsLoadingEmail(false);
                      }}
                      className="mt-6 text-sm font-medium text-[#1B6545] hover:underline"
                    >
                      Usar outro email
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Google sign-in */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoadingGoogle}
                      className="animate-element animate-delay-100 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-[#1B6545]/30 focus:ring-offset-1 disabled:opacity-60"
                    >
                      {isLoadingGoogle ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      )}
                      Continuar com Google
                    </button>

                    {/* Divider */}
                    <div className="animate-element animate-delay-200 my-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-xs font-medium text-gray-400">
                        Ou continue com email
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                      <div className="animate-element animate-delay-300">
                        <label
                          htmlFor="signin-email"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <input
                          id="signin-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="voce@empresa.com"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-[#1B6545] focus:outline-none focus:ring-2 focus:ring-[#1B6545]/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoadingEmail || !email.trim()}
                        className="animate-element animate-delay-400 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B6545] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#155236] focus:outline-none focus:ring-2 focus:ring-[#1B6545]/30 focus:ring-offset-1 disabled:opacity-60"
                      >
                        {isLoadingEmail ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        Enviar magic link
                      </button>
                    </form>

                    <p className="animate-element animate-delay-500 mt-6 text-center text-xs text-gray-400">
                      Ao continuar, voce concorda com os{" "}
                      <a href="#" className="underline hover:text-gray-600">
                        Termos de Uso
                      </a>{" "}
                      e{" "}
                      <a href="#" className="underline hover:text-gray-600">
                        Politica de Privacidade
                      </a>
                    </p>
                  </>
                )}
              </div>

              {/* Right column — image + testimonials */}
              <div className="relative hidden w-1/2 md:block">
                <div className="animate-slide-right absolute inset-0 m-3 overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80"
                    alt="Equipe de trabalho"
                    className="h-full w-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Testimonials */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2.5">
                    <div className="animate-testimonial animate-delay-400 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                      <p className="text-xs leading-relaxed text-gray-700">
                        &ldquo;O Shiftsly transformou a forma como gerenciamos
                        nossas escalas. Economizamos horas toda semana.&rdquo;
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#1B6545]/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#1B6545]">
                            MC
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-gray-900">
                            Maria Costa
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Gerente de Operacoes
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="animate-testimonial animate-delay-700 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                      <p className="text-xs leading-relaxed text-gray-700">
                        &ldquo;Interface super intuitiva. Minha equipe adotou em
                        minutos, sem treinamento.&rdquo;
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#1B6545]/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#1B6545]">
                            RS
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-gray-900">
                            Rafael Santos
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Dono de Franquia
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
