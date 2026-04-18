import { PrismaClient, JobStatus, WeekStatus, PaymentStatus, CleanerStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Achievements (existing) ──────────────────────────────────────────────────

const achievements = [
  { slug: "primeira-semana-completa", title: "Primeira semana completa", category: "servicos", xpReward: 25, icon: "Calendar", description: "Monte a agenda completa de uma semana" },
  { slug: "10-cleaners-gerenciadas", title: "10+ cleaners gerenciadas", category: "equipe", xpReward: 50, icon: "Users", description: "Tenha 10 ou mais cleaners ativas" },
  { slug: "100-servicos-agendados", title: "100 serviços agendados", category: "servicos", xpReward: 75, icon: "CheckCircle", description: "Agende 100 serviços no total" },
  { slug: "zero-faltas-na-semana", title: "Zero faltas na semana", category: "pontualidade", xpReward: 30, icon: "Shield", description: "Tenha uma semana sem nenhuma ausência" },
  { slug: "nota-5-de-cliente", title: "Nota 5.0 de um cliente", category: "servicos", xpReward: 40, icon: "Star", description: "Receba avaliação máxima de um cliente" },
  { slug: "custo-reduzido-15", title: "Custo reduzido em 15%", category: "financeiro", xpReward: 60, icon: "TrendingDown", description: "Reduza o custo semanal em 15% vs semana anterior" },
  { slug: "500-servicos-concluidos", title: "500 serviços concluídos", category: "servicos", xpReward: 100, icon: "Award", description: "Conclua 500 serviços no total" },
  { slug: "equipe-completa-semana", title: "Equipe 100% na semana", category: "equipe", xpReward: 35, icon: "UserCheck", description: "Tenha todas as cleaners com serviço em uma semana" },
  { slug: "relatorio-gerado", title: "Primeiro relatório gerado", category: "financeiro", xpReward: 20, icon: "FileText", description: "Gere e exporte seu primeiro relatório" },
  { slug: "semana-fechada", title: "Semana fechada no prazo", category: "pontualidade", xpReward: 30, icon: "Lock", description: "Feche a semana antes do domingo" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get Monday of the current week */
function getCurrentMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Get Monday of last week */
function getLastMonday(): Date {
  const monday = getCurrentMonday();
  monday.setDate(monday.getDate() - 7);
  return monday;
}

/** Add days to a date */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Calculate hours between time strings "HH:MM" */
function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Shiftsly database...\n");

  // 1. Seed achievements
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { slug: ach.slug },
      update: { title: ach.title, description: ach.description, category: ach.category, xpReward: ach.xpReward, icon: ach.icon },
      create: ach,
    });
  }
  console.log(`✓ ${achievements.length} achievements seeded`);

  // 2. Find or skip test user
  const testEmail = "yuri@shiftsly.com";
  let user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: { name: "Yuri Roberto", email: testEmail },
    });
    console.log("✓ Test user created:", user.email);
  } else {
    console.log("✓ Test user found:", user.email);
  }

  // Check if already seeded (cleaners exist)
  const existingCleaners = await prisma.cleaner.count({ where: { userId: user.id } });
  if (existingCleaners > 0) {
    console.log("⏩ Business data already seeded, skipping...");
    return;
  }

  // 3. Create cleaners
  const cleanerData = [
    { name: "Ana Santos",     phone: "+44 7700 100001", hourlyRate: 15.00, avatarColor: "#1B6545" },
    { name: "Maria Lima",     phone: "+44 7700 100002", hourlyRate: 14.00, avatarColor: "#4DAE89" },
    { name: "Julia Reis",     phone: "+44 7700 100003", hourlyRate: 15.00, avatarColor: "#BA7517" },
    { name: "Carla Martins",  phone: "+44 7700 100004", hourlyRate: 13.50, avatarColor: "#6366F1" },
    { name: "Luisa Ferreira", phone: "+44 7700 100005", hourlyRate: 15.00, avatarColor: "#E24B4A" },
  ];

  const cleaners: Record<string, { id: string; hourlyRate: number }> = {};
  for (const c of cleanerData) {
    const cleaner = await prisma.cleaner.create({
      data: { userId: user.id, ...c },
    });
    cleaners[c.name.split(" ")[0]] = { id: cleaner.id, hourlyRate: c.hourlyRate };
  }
  console.log(`✓ ${cleanerData.length} cleaners created`);

  // 4. Create clients
  const clientData = [
    { name: "Casa Ramos",     address: "12 Oak Lane, SW1A 1AA",   contactName: "Mrs. Ramos" },
    { name: "Apt. Silva",     address: "45 High Street, W1K 3QB", contactName: "Mr. Silva" },
    { name: "Casa Oliveira",  address: "8 Garden Road, NW3 5SG",  contactName: "Mrs. Oliveira" },
    { name: "Flat Henderson", address: "22 Park Ave, EC2A 4NE",   contactName: "James Henderson" },
    { name: "Casa Pereira",   address: "6 Mill Lane, SE1 7PB",    contactName: "Mrs. Pereira" },
    { name: "Apt. Williams",  address: "33 Church St, W2 1NN",    contactName: "Sarah Williams" },
  ];

  const clients: Record<string, string> = {};
  for (const c of clientData) {
    const client = await prisma.client.create({
      data: { userId: user.id, ...c },
    });
    clients[c.name] = client.id;
  }
  console.log(`✓ ${clientData.length} clients created`);

  // 5. Create schedule template + slots
  const template = await prisma.scheduleTemplate.create({
    data: { userId: user.id, name: "Default", isActive: true },
  });

  const templateSlots = [
    // Ana: Mon, Tue, Thu, Fri
    { cleaner: "Ana",   client: "Casa Ramos",     day: 0, start: "09:00", end: "13:00" },
    { cleaner: "Ana",   client: "Apt. Silva",      day: 1, start: "09:00", end: "12:00" },
    { cleaner: "Ana",   client: "Casa Oliveira",   day: 3, start: "10:00", end: "14:00" },
    { cleaner: "Ana",   client: "Flat Henderson",  day: 4, start: "09:00", end: "13:00" },
    // Maria: Mon, Wed, Thu
    { cleaner: "Maria", client: "Apt. Silva",      day: 0, start: "13:00", end: "17:00" },
    { cleaner: "Maria", client: "Casa Pereira",    day: 2, start: "09:00", end: "13:00" },
    { cleaner: "Maria", client: "Apt. Williams",   day: 3, start: "09:00", end: "12:00" },
    // Julia: Tue, Wed, Fri
    { cleaner: "Julia", client: "Casa Pereira",    day: 1, start: "13:00", end: "17:00" },
    { cleaner: "Julia", client: "Casa Ramos",      day: 2, start: "09:00", end: "12:00" },
    { cleaner: "Julia", client: "Flat Henderson",  day: 4, start: "14:00", end: "18:00" },
    // Carla: Mon–Fri (full week)
    { cleaner: "Carla", client: "Casa Oliveira",   day: 0, start: "09:00", end: "12:00" },
    { cleaner: "Carla", client: "Apt. Williams",   day: 1, start: "09:00", end: "13:00" },
    { cleaner: "Carla", client: "Casa Ramos",      day: 2, start: "13:00", end: "17:00" },
    { cleaner: "Carla", client: "Apt. Silva",      day: 3, start: "13:00", end: "17:00" },
    { cleaner: "Carla", client: "Casa Pereira",    day: 4, start: "09:00", end: "13:00" },
    // Luisa: Mon, Wed, Thu, Fri
    { cleaner: "Luisa", client: "Flat Henderson",  day: 0, start: "09:00", end: "13:00" },
    { cleaner: "Luisa", client: "Casa Oliveira",   day: 2, start: "13:00", end: "17:00" },
    { cleaner: "Luisa", client: "Casa Ramos",      day: 3, start: "14:00", end: "17:00" },
    { cleaner: "Luisa", client: "Apt. Williams",   day: 4, start: "13:00", end: "17:00" },
  ];

  for (const slot of templateSlots) {
    await prisma.templateSlot.create({
      data: {
        templateId: template.id,
        cleanerId: cleaners[slot.cleaner].id,
        clientId: clients[slot.client],
        dayOfWeek: slot.day,
        startTime: slot.start,
        endTime: slot.end,
      },
    });
  }
  console.log(`✓ ${templateSlots.length} template slots created`);

  // 6. Generate current week schedule + jobs
  const currentMonday = getCurrentMonday();
  const currentSchedule = await prisma.weeklySchedule.create({
    data: { userId: user.id, weekStart: currentMonday, status: WeekStatus.ACTIVE },
  });

  let currentTotalCost = 0;
  for (const slot of templateSlots) {
    const hours = calcHours(slot.start, slot.end);
    const rate = cleaners[slot.cleaner].hourlyRate;
    const cost = hours * rate;
    currentTotalCost += cost;

    await prisma.job.create({
      data: {
        scheduleId: currentSchedule.id,
        cleanerId: cleaners[slot.cleaner].id,
        clientId: clients[slot.client],
        date: addDays(currentMonday, slot.day),
        startTime: slot.start,
        endTime: slot.end,
        status: JobStatus.SCHEDULED,
        hoursWorked: hours,
        hourlyRate: rate,
        cost,
        createdFromTemplate: true,
      },
    });
  }

  await prisma.weeklySchedule.update({
    where: { id: currentSchedule.id },
    data: { totalCost: currentTotalCost, totalJobs: templateSlots.length, totalAbsences: 0 },
  });
  console.log(`✓ Current week: ${templateSlots.length} jobs, £${currentTotalCost.toFixed(2)}`);

  // 7. Register Maria's absence on Friday (current week)
  const friday = addDays(currentMonday, 4);
  const mariaFridayJobs = await prisma.job.updateMany({
    where: {
      scheduleId: currentSchedule.id,
      cleanerId: cleaners["Maria"].id,
      date: friday,
      status: JobStatus.SCHEDULED,
    },
    data: { status: JobStatus.ABSENT },
  });

  if (mariaFridayJobs.count > 0) {
    await prisma.absence.create({
      data: {
        cleanerId: cleaners["Maria"].id,
        userId: user.id,
        date: friday,
        reason: "Called in sick",
        jobsAffected: mariaFridayJobs.count,
        covered: false,
      },
    });
    console.log(`✓ Absence: Maria on Friday (${mariaFridayJobs.count} jobs affected)`);
  } else {
    console.log("  Maria has no Friday jobs — no absence created");
  }

  // 8. Generate last week schedule + jobs (CLOSED, with payment summaries)
  const lastMonday = getLastMonday();
  const lastSchedule = await prisma.weeklySchedule.create({
    data: { userId: user.id, weekStart: lastMonday, status: WeekStatus.CLOSED },
  });

  let lastTotalCost = 0;
  const cleanerHours: Record<string, { hours: number; jobs: number; cost: number }> = {};

  for (const slot of templateSlots) {
    const hours = calcHours(slot.start, slot.end);
    const rate = cleaners[slot.cleaner].hourlyRate;
    const cost = hours * rate;
    lastTotalCost += cost;

    if (!cleanerHours[slot.cleaner]) {
      cleanerHours[slot.cleaner] = { hours: 0, jobs: 0, cost: 0 };
    }
    cleanerHours[slot.cleaner].hours += hours;
    cleanerHours[slot.cleaner].jobs += 1;
    cleanerHours[slot.cleaner].cost += cost;

    await prisma.job.create({
      data: {
        scheduleId: lastSchedule.id,
        cleanerId: cleaners[slot.cleaner].id,
        clientId: clients[slot.client],
        date: addDays(lastMonday, slot.day),
        startTime: slot.start,
        endTime: slot.end,
        status: JobStatus.COMPLETED,
        hoursWorked: hours,
        hourlyRate: rate,
        cost,
        createdFromTemplate: true,
      },
    });
  }

  await prisma.weeklySchedule.update({
    where: { id: lastSchedule.id },
    data: { totalCost: lastTotalCost, totalJobs: templateSlots.length, totalAbsences: 0 },
  });

  // Payment summaries for last week
  for (const [name, data] of Object.entries(cleanerHours)) {
    await prisma.paymentSummary.create({
      data: {
        userId: user.id,
        scheduleId: lastSchedule.id,
        cleanerId: cleaners[name].id,
        totalHours: data.hours,
        totalJobs: data.jobs,
        totalAbsences: 0,
        totalAmount: data.cost,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });
  }
  console.log(`✓ Last week: ${templateSlots.length} jobs (CLOSED), ${Object.keys(cleanerHours).length} payment summaries (PAID)`);

  // 9. Create subscription (Pro trial)
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: "PRO",
      status: "TRIALING",
      maxCleaners: 15,
      trialEndsAt: trialEnd,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
    },
  });
  console.log(`✓ Subscription: PRO (trialing, ends ${trialEnd.toISOString().slice(0, 10)})`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
