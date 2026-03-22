import Link from "next/link";

const features = [
  {
    title: "Escalas inteligentes",
    description: "Monte escalas semanais com drag-and-drop. Gerencie turnos normais, extras e fins de semana.",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  },
  {
    title: "Banco de horas automático",
    description: "Controle de horas extras, faltas e banco de horas calculado automaticamente.",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Gestão de equipes",
    description: "Organize colaboradores por unidade, setor e cargo. Controle permissões por função.",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    title: "Múltiplas unidades",
    description: "Gerencie filiais independentes, cada uma com gestor próprio e escala individual.",
    icon: "M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 7.5h1.5m-1.5 3h1.5m-1.5 3h1.5m6-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  },
  {
    title: "Relatórios e exportação",
    description: "Dashboards de performance com exportação em PDF e Excel. Visão por período, unidade e colaborador.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    title: "Portal do colaborador",
    description: "App mobile para seus colaboradores verem escalas, registrarem ponto e consultarem banco de horas.",
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    period: "",
    description: "Para testar a plataforma",
    features: ["Até 5 colaboradores", "1 unidade", "Escala semanal", "Exportar PDF básico"],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 149",
    period: "/mês",
    description: "Para operações em crescimento",
    features: [
      "Até 30 colaboradores",
      "3 unidades",
      "Banco de horas",
      "Gestão de ausências",
      "Dashboard básico",
      "Portal do colaborador",
    ],
    cta: "Começar teste grátis",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "R$ 349",
    period: "/mês",
    description: "Para operações complexas",
    features: [
      "Colaboradores ilimitados",
      "Unidades ilimitadas",
      "Dashboard avançado",
      "Múltiplos gestores",
      "Integração com folha",
      "API e webhooks",
      "Suporte prioritário",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#2463EB] flex items-center justify-center">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold">Shiftly</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Preços</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Entrar
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[#2463EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4fc7] transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-blue-50 px-4 py-1.5 text-xs font-medium text-[#2463EB] mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2463EB]" />
          Plataforma de gestão operacional
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Chega de planilha.{" "}
          <span className="text-[#2463EB]">Comece a escalar</span> sua operação
          com inteligência.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Gerencie escalas, colaboradores e unidades em uma única plataforma.
          Ideal para operações de limpeza, segurança, manutenção, logística e mais.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-[#2463EB] px-8 py-3 text-sm font-semibold text-white hover:bg-[#1d4fc7] transition-colors shadow-lg shadow-blue-500/25"
          >
            Teste grátis por 14 dias
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Ver recursos
          </a>
        </div>
      </section>

      {/* Screenshot placeholder */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-2xl border bg-[#F6F7F9] p-4 shadow-2xl shadow-gray-200">
          <div className="aspect-[16/9] rounded-xl bg-white border flex items-center justify-center">
            <p className="text-gray-400 text-sm">Screenshot do dashboard</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#F6F7F9] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tudo que você precisa para gerenciar sua operação
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Do planejamento de escalas ao controle de horas, em uma única plataforma.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <svg
                    className="h-5 w-5 text-[#2463EB]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Planos simples e transparentes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comece grátis. Escale quando precisar.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-[#2463EB] bg-white shadow-xl shadow-blue-500/10 ring-1 ring-[#2463EB]"
                    : "bg-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2463EB]">
                    Mais popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  )}
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-[#2463EB] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-[#2463EB] text-white hover:bg-[#1d4fc7]"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-[#F6F7F9] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#2463EB] flex items-center justify-center">
                <span className="text-xs font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold">Shiftly</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Shiftly. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
