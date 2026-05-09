import type { Heuristic, Snapshot, Candidate } from "./types";

// Each heuristic is a small, deterministic rule that fires only when the
// snapshot satisfies its condition. Keep messages tight, action-oriented and
// always grounded in evidence the user can check.

const heuristics: Heuristic[] = [
  // ── Funnel / momentum ─────────────────────────────────────────────────────
  {
    id: "north-star-recap",
    category: "north-star",
    cooldownDays: 3,
    evaluate(s): Candidate | null {
      const f = s.funnel;
      const lines = [
        `Pagantes hoje: *${f.payingCustomers}* / *${f.targetCustomers}*`,
        `Faltam: *${f.customersToTarget}* clientes`,
        `MRR estimado: *$${f.mrrUsd.toFixed(0)}*`,
        `Trialing: *${f.trialingCustomers}* · Past due: *${f.pastDueCustomers}*`,
        `Novos pagantes 7d: *${s.growth.newPaying7d}* · 30d: *${s.growth.newPaying30d}*`,
      ];
      return {
        templateId: "north-star-recap",
        category: "north-star",
        title: "Status do funil",
        body: lines.join("\n"),
        evidence: [`Stage: ${f.stage}`],
        effort: "S",
        impact: "L",
      };
    },
  },
  {
    id: "no-paying-yet",
    category: "acquisition",
    cooldownDays: 4,
    stages: ["0"],
    evaluate(s): Candidate | null {
      if (s.funnel.payingCustomers > 0) return null;
      return {
        templateId: "no-paying-yet",
        category: "acquisition",
        title: "Zero pagantes — semana de outbound manual",
        body: [
          "Não dá pra otimizar funil sem ter um. Meta: *5 conversas qualificadas/dia* essa semana.",
          "",
          "*Onde caçar gestoras de operação:*",
          "• Grupos no Facebook de gestoras de limpeza/Airbnb/condomínio",
          "• LinkedIn: cargo \"gerente de operações\" + cidade",
          "• Comunidades de Airbnb hosts (BR + EN se aplicável)",
          "• Indicação direta de quem te conhece",
          "",
          "Pitch: 1 linha do problema (planilha quebrando), oferta de mostrar 10min, sem pedir cadastro.",
          "Meta da semana: *3 demos agendadas* + *1 trial iniciado*.",
        ].join("\n"),
        evidence: [
          `Pagantes: ${s.funnel.payingCustomers}`,
          `Total de usuários: ${s.funnel.totalUsers}`,
        ],
        effort: "L",
        impact: "H",
      };
    },
  },
  {
    id: "stale-paying-funnel",
    category: "acquisition",
    cooldownDays: 7,
    evaluate(s): Candidate | null {
      const d = s.growth.daysSinceLastNewPaying;
      if (d === null || d < 14) return null;
      return {
        templateId: "stale-paying-funnel",
        category: "acquisition",
        title: `Sem novo pagante há ${d} dias`,
        body: [
          "Funil esfriou. Antes de mexer em produto, audita o topo:",
          "",
          "1. Quantas pessoas chegaram no /pricing nos últimos 14d? (precisa de analytics — ver insight de tracking)",
          "2. Quantas começaram trial? Quantas terminaram trial?",
          "3. O CTA principal da landing está acima da dobra e direto?",
          "",
          "Ação: revisita 1 canal de aquisição que funcionou antes e dobra dose por 1 semana.",
        ].join("\n"),
        evidence: [`Último novo pagante: ${d} dias atrás`],
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "trial-stuck",
    category: "conversion",
    cooldownDays: 7,
    evaluate(s): Candidate | null {
      if (s.funnel.trialingCustomers < 2) return null;
      if (s.funnel.payingCustomers >= s.funnel.trialingCustomers * 2) return null;
      return {
        templateId: "trial-stuck",
        category: "conversion",
        title: `${s.funnel.trialingCustomers} contas em trial — ative call de check-in`,
        body: [
          `Você tem *${s.funnel.trialingCustomers}* contas em trial vs *${s.funnel.payingCustomers}* pagantes.`,
          "",
          "Trial sem toque humano nessa fase é dinheiro escorrendo.",
          "Ação para *hoje*:",
          "• Mande 1 email pessoal pra cada um: \"Como tá indo? Posso te ajudar em 10min?\"",
          "• Quem responder: faz call, vê o que travou, ajuda na configuração",
          "• Quem não responder em 48h: 2º contato curtíssimo (\"some?\")",
          "",
          "Anota o motivo de quem não converter — vira heurística aqui.",
        ].join("\n"),
        evidence: [
          `Trialing: ${s.funnel.trialingCustomers}`,
          `Pagantes: ${s.funnel.payingCustomers}`,
        ],
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "past-due-recovery",
    category: "retention",
    cooldownDays: 5,
    evaluate(s): Candidate | null {
      if (s.funnel.pastDueCustomers === 0) return null;
      return {
        templateId: "past-due-recovery",
        category: "retention",
        title: `${s.funnel.pastDueCustomers} pagamento(s) past due — recupera HOJE`,
        body: [
          "Past due silencioso é churn. Recupera 1 a 1, com mensagem humana, não automação.",
          "",
          "Ferramentas: Stripe dashboard → Customers → filter Past due → email direto.",
          "Texto: \"Vi que o pagamento falhou. Quer que eu mande novo link ou ajusta no Stripe Portal? — Yuri\"",
        ].join("\n"),
        evidence: [`Past due: ${s.funnel.pastDueCustomers}`],
        effort: "S",
        impact: "H",
      };
    },
  },
  {
    id: "user-to-paying-leak",
    category: "conversion",
    cooldownDays: 7,
    evaluate(s): Candidate | null {
      const totalConverters = s.funnel.payingCustomers + s.funnel.trialingCustomers;
      if (s.funnel.totalUsers < 10) return null;
      const ratio = totalConverters / s.funnel.totalUsers;
      if (ratio >= 0.15) return null;
      return {
        templateId: "user-to-paying-leak",
        category: "conversion",
        title: `Conversão usuário→trial+pagante em ${Math.round(ratio * 100)}%`,
        body: [
          `*${s.funnel.totalUsers}* contas criadas, só *${totalConverters}* viraram trial/pagante.`,
          "",
          "Hipóteses pra investigar nessa ordem:",
          "1. *Aha-moment lento*: o usuário precisa criar escala antes de ver valor — bota onboarding guiado",
          "2. *Free generoso demais*: até 5 colaboradoras + 10 clientes pode ser suficiente pra muita gente",
          "3. *Paywall invisível*: o usuário sabe quando ele bate no limite? Tem prompt claro pra upgrade?",
          "",
          "Pra essa semana: liga pra 3 contas free com >2 colaboradoras e pergunta o que faltou.",
        ].join("\n"),
        evidence: [
          `Usuários: ${s.funnel.totalUsers}`,
          `Pagantes: ${s.funnel.payingCustomers}`,
          `Trialing: ${s.funnel.trialingCustomers}`,
        ],
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "plan-distribution-skew",
    category: "pricing",
    cooldownDays: 14,
    evaluate(s): Candidate | null {
      const paid = s.plans.pro + s.plans.plus;
      if (paid < 5) return null;
      const plusRatio = s.plans.plus / paid;
      if (plusRatio >= 0.15) return null;
      return {
        templateId: "plan-distribution-skew",
        category: "pricing",
        title: `Plus quase invisível: ${s.plans.plus}/${paid} pagantes`,
        body: [
          "Quando 90%+ vai pro Pro, ou o Plus tá subprecificado em valor percebido, ou a página de pricing não comunica o salto.",
          "",
          "Teste em 1 semana:",
          "• Reescreve o cabeçalho do Plus pra falar do *valor de negócio* (relatórios avançados → \"feche o mês 3x mais rápido\")",
          "• Adiciona 1 feature exclusiva no Plus que dói não ter (ex: relatório por cliente, white-label)",
          "• Compara lado a lado com destaque no card do Plus",
        ].join("\n"),
        evidence: [
          `Pro: ${s.plans.pro}`,
          `Plus: ${s.plans.plus}`,
        ],
        effort: "S",
        impact: "M",
      };
    },
  },

  // ── Feedback-driven ───────────────────────────────────────────────────────
  {
    id: "no-feedback-yet",
    category: "discovery",
    cooldownDays: 5,
    evaluate(s): Candidate | null {
      if (s.feedback.last30d > 0) return null;
      return {
        templateId: "no-feedback-yet",
        category: "discovery",
        title: "Zero respostas no /teste em 30 dias",
        body: [
          "Você tem o formulário de usabilidade montado e ninguém respondeu mês passado.",
          "",
          "Sem dado de fora, qualquer ideia aqui vira chute.",
          "Ação: convida *5 pessoas específicas* esta semana — alguém que você sabe que sente a dor:",
          "1 ex-colega de operação, 1 dona de Airbnb, 1 gestora que ainda usa planilha.",
          "Texto: \"15min testando algo que tô construindo, te mando R$30 pix de agradecimento.\"",
        ].join("\n"),
        evidence: [`Respostas em 30d: 0`],
        effort: "S",
        impact: "H",
      };
    },
  },
  {
    id: "low-nps",
    category: "product",
    cooldownDays: 10,
    evaluate(s): Candidate | null {
      if (s.feedback.npsAvg30d === null || s.feedback.last30d < 3) return null;
      if (s.feedback.npsAvg30d >= 7) return null;
      return {
        templateId: "low-nps",
        category: "product",
        title: `NPS médio ${s.feedback.npsAvg30d} (${s.feedback.detractors30d} detratores em 30d)`,
        body: [
          "NPS abaixo de 7 com volume baixo é sinal — não ruído.",
          "",
          "Antes de investir em aquisição:",
          "1. Lê os \"motivos do NPS\" dos detratores em /admin/respostas",
          "2. Liga pros 2 mais detalhados — pergunta \"o que precisaria mudar pra você dar 9?\"",
          "3. Se aparecer *o mesmo tema* em 2+ — esse é o próximo épico",
        ].join("\n"),
        evidence: [
          `NPS 30d: ${s.feedback.npsAvg30d}`,
          `Detratores: ${s.feedback.detractors30d}`,
          `Promotores: ${s.feedback.promoters30d}`,
        ],
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "missing-feature-recurring",
    category: "product",
    cooldownDays: 7,
    evaluate(s): Candidate | null {
      const top = s.feedback.topMissingFeatures[0];
      if (!top || top.count < 2) return null;
      return {
        templateId: `missing-feature-recurring:${top.token}`,
        category: "product",
        title: `Feature pedida ${top.count}x: "${top.token}"`,
        body: [
          `*${top.count} pessoas diferentes* mencionaram "${top.token}" como feature que faltou.`,
          "",
          "*Exemplos textuais:*",
          ...top.samples.map((s) => `• ${s}`),
          "",
          "Próximo passo: 1 call de 15min com alguém que pediu pra entender o que exatamente eles querem antes de codar.",
          "Pode ser um copy/posicionamento, não feature.",
        ].join("\n"),
        evidence: [`Menções: ${top.count}`, ...top.samples.slice(0, 2)],
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "broken-feature-mention",
    category: "bug",
    cooldownDays: 2,
    evaluate(s): Candidate | null {
      if (s.feedback.brokenFeatureMentions.length === 0) return null;
      return {
        templateId: "broken-feature-mention",
        category: "bug",
        title: `${s.feedback.brokenFeatureMentions.length} relato(s) de bug recente(s)`,
        body: [
          "Bug reportado em pesquisa não vai gerar ticket — você precisa caçar.",
          "",
          "*Relatos:*",
          ...s.feedback.brokenFeatureMentions.map((b) => `• ${b}`),
          "",
          "Resolve antes de qualquer feature nova. Bug visível mata trial mais rápido que feature ausente.",
        ].join("\n"),
        evidence: s.feedback.brokenFeatureMentions.slice(0, 3),
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "quit-moment-pattern",
    category: "activation",
    cooldownDays: 14,
    evaluate(s): Candidate | null {
      if (s.feedback.quitMomentMentions.length < 2) return null;
      return {
        templateId: "quit-moment-pattern",
        category: "activation",
        title: `${s.feedback.quitMomentMentions.length} pessoas relataram \"momento que quase desistiu\"`,
        body: [
          "Esse é o ponto mais barato pra mover conversão — alguém quase saiu e te falou onde.",
          "",
          "*Onde travaram:*",
          ...s.feedback.quitMomentMentions.map((q) => `• ${q}`),
          "",
          "Triagem:",
          "1. Tem 2+ menções no mesmo lugar? Conserta esse fluxo essa semana.",
          "2. Só 1 menção? Vê se é ergonomia ou se é o conceito que confunde.",
        ].join("\n"),
        evidence: s.feedback.quitMomentMentions.slice(0, 3),
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "low-completed-week",
    category: "activation",
    cooldownDays: 14,
    evaluate(s): Candidate | null {
      if (s.feedback.completedWeekRate === null || s.feedback.last30d < 3) return null;
      if (s.feedback.completedWeekRate >= 0.6) return null;
      return {
        templateId: "low-completed-week",
        category: "activation",
        title: `Apenas ${Math.round(s.feedback.completedWeekRate * 100)}% completou a semana de teste`,
        body: [
          "A semana de teste é o aha-moment do Shiftsly. Se a maioria não conclui, o produto não tá entregando o valor prometido na landing.",
          "",
          "Hipóteses:",
          "• Setup inicial pesado demais — onboarding precisa de seed automático ou template pronto",
          "• Falta de incentivo pra voltar (notificação? email no dia seguinte?)",
          "• Conceito confuso — UI pede explicação que não dá",
          "",
          "Ação: assiste *1 sessão completa* (peça permissão pra gravar tela ou Hotjar) antes de mexer no código.",
        ].join("\n"),
        evidence: [`Taxa: ${Math.round(s.feedback.completedWeekRate * 100)}%`, `Amostra: ${s.feedback.last30d}`],
        effort: "M",
        impact: "H",
      };
    },
  },
  {
    id: "pain-point-theme",
    category: "positioning",
    cooldownDays: 7,
    evaluate(s): Candidate | null {
      const top = s.feedback.topPainPoints[0];
      if (!top || top.count < 2) return null;
      return {
        templateId: `pain-point-theme:${top.token}`,
        category: "positioning",
        title: `Dor recorrente: "${top.token}" (${top.count}x)`,
        body: [
          `Dor de dia-a-dia mais citada: *"${top.token}"*.`,
          "",
          "*Falas reais:*",
          ...top.samples.map((s) => `• ${s}`),
          "",
          "Usa *exatamente essas palavras* na headline da landing — copy do cliente converte mais que copy do criador.",
          "Próximo passo: testar 1 variação de hero copy com esse termo por 1 semana e medir CTR no CTA.",
        ].join("\n"),
        evidence: [`Menções: ${top.count}`, ...top.samples.slice(0, 2)],
        effort: "S",
        impact: "M",
      };
    },
  },

  // ── Operational / measurement ─────────────────────────────────────────────
  {
    id: "no-analytics",
    category: "measurement",
    cooldownDays: 21,
    evaluate(s): Candidate | null {
      // Manual heuristic — fires until user marks done
      return {
        templateId: "no-analytics",
        category: "measurement",
        title: "Você tá voando sem instrumento? (analytics)",
        body: [
          "Antes de gastar 1 real em aquisição, precisa saber: de onde vem tráfego, onde caem, quantos clicam no /pricing.",
          "",
          "Sugestão: *PostHog free* (até 1M eventos/mês) — instrumenta:",
          "• page views (landing, /pricing, /teste, /login)",
          "• evento `signup_started`, `signup_completed`",
          "• evento `paywall_shown`, `checkout_started`, `checkout_completed`",
          "• evento `usability_test_completed`",
          "",
          "30min de setup. Te dá funil de verdade dentro de 7 dias.",
          "",
          "Se já tem instrumentado: responde /done aqui que eu paro de sugerir.",
        ].join("\n"),
        evidence: [],
        effort: "S",
        impact: "H",
      };
    },
  },
  {
    id: "no-public-changelog",
    category: "trust",
    cooldownDays: 30,
    stages: ["1-10", "10-30", "30-50"],
    evaluate(s): Candidate | null {
      return {
        templateId: "no-public-changelog",
        category: "trust",
        title: "Adiciona um /changelog público",
        body: [
          "Visitantes recorrentes do site precisam ver que o produto evolui — senão acham que tá morto.",
          "",
          "Versão mínima: 1 página simples lendo de um JSON local com últimos 10 ships.",
          "Bonus: linka no footer e na landing (\"Última atualização: 3 dias atrás\").",
          "",
          "Marca /done quando publicar.",
        ].join("\n"),
        evidence: [],
        effort: "S",
        impact: "M",
      };
    },
  },
  {
    id: "no-comparison-page",
    category: "acquisition",
    cooldownDays: 30,
    stages: ["1-10", "10-30"],
    evaluate(s): Candidate | null {
      return {
        templateId: "no-comparison-page",
        category: "acquisition",
        title: "Página de comparação \"Shiftsly vs Planilha\"",
        body: [
          "Quem busca \"escala de limpeza planilha\" no Google é tua audiência ideal — está admitindo a dor.",
          "",
          "Cria /vs/planilha com:",
          "• Tabela lado a lado com 8 critérios (cobertura ausência, cálculo de pagamento, etc)",
          "• Print real do Shiftsly em cada linha onde ganha",
          "• CTA pra trial no fim",
          "",
          "Esse tipo de página rankeia em SEO long-tail e não precisa de ads.",
        ].join("\n"),
        evidence: [],
        effort: "M",
        impact: "M",
      };
    },
  },
  {
    id: "ask-for-referral",
    category: "growth-loop",
    cooldownDays: 14,
    stages: ["10-30", "30-50"],
    evaluate(s): Candidate | null {
      if (s.feedback.promoters30d < 1) return null;
      return {
        templateId: "ask-for-referral",
        category: "growth-loop",
        title: `${s.feedback.promoters30d} promotor(es) recente(s) — pede indicação`,
        body: [
          "Promotor (NPS 9-10) que não foi pedido pra indicar é desperdício gritante.",
          "",
          "Texto pra mandar agora:",
          "\"Vi seu feedback — obrigado de verdade. Conhece outra gestora que também sofre com escala? Te dou 1 mês free se ela virar pagante.\"",
          "",
          "Funciona porque é específico, recíproco e fácil.",
        ].join("\n"),
        evidence: [`Promotores 30d: ${s.feedback.promoters30d}`],
        effort: "S",
        impact: "M",
      };
    },
  },
  {
    id: "low-acted-rate",
    category: "meta",
    cooldownDays: 14,
    evaluate(s): Candidate | null {
      if (s.insightHistory.actedRate === null) return null;
      const sentRecent = s.insightHistory.sentLast7d;
      if (sentRecent < 5) return null;
      if (s.insightHistory.actedRate >= 0.2) return null;
      return {
        templateId: "low-acted-rate",
        category: "meta",
        title: "Você tá ignorando minhas sugestões",
        body: [
          `Mandei ${sentRecent} insight(s) na última semana, ${Math.round(s.insightHistory.actedRate * 100)}% viraram /done.`,
          "",
          "Ou eu tô gerando ruído, ou você tá ocupado demais. Honestidade aqui >> volume:",
          "• Se for ruído: responde /ruim nos que não fizeram sentido pra eu calibrar",
          "• Se for tempo: marca /skip pra adiar 14 dias",
          "• Se for relevante mas grande demais: pede /pensa pra eu propor versão menor",
        ].join("\n"),
        evidence: [`Sent 7d: ${sentRecent}`, `Acted rate: ${Math.round((s.insightHistory.actedRate ?? 0) * 100)}%`],
        effort: "S",
        impact: "L",
      };
    },
  },
];

export function getHeuristics(): Heuristic[] {
  return heuristics;
}

export function evaluateAll(snapshot: Snapshot): Candidate[] {
  const out: Candidate[] = [];
  for (const h of heuristics) {
    if (h.stages && !h.stages.includes(snapshot.funnel.stage)) continue;
    const c = h.evaluate(snapshot);
    if (c) out.push(c);
  }
  return out;
}
