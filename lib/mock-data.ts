// Mock data for Shiftsly dashboard - all in pt-BR

export interface Colaborador {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatar: string;
  role: string;
  unit: string;
  status: "active" | "inactive";
  hoursThisWeek: number;
  schedule: WeekSchedule;
}

export interface WeekSchedule {
  seg: DayEntry | null;
  ter: DayEntry | null;
  qua: DayEntry | null;
  qui: DayEntry | null;
  sex: DayEntry | null;
  sab: DayEntry | null;
  dom: DayEntry | null;
}

export interface DayEntry {
  type: "work" | "absence";
  services?: number;
  hours?: number;
  absenceReason?: string;
}

export interface Servico {
  id: string;
  client: string;
  type: string;
  day: string;
  duration: string;
  estimatedCost: string;
  assignedTo: string | null;
}

export interface Cliente {
  id: string;
  name: string;
  address: string;
  serviceType: string;
  frequency: string;
  phone: string;
}

export interface Unidade {
  id: string;
  name: string;
  address: string;
  collaboratorCount: number;
  sectors: string[];
  manager: string;
}

export interface RotaAtiva {
  id: string;
  diarista: {
    nome: string;
    iniciais: string;
    corAvatar: string;
  };
  local: string;
  tipoServico: string;
  inicioISO: string;
  terminoPrevisoISO: string;
  status: 'iniciando' | 'em-servico' | 'quase-no-fim' | 'atrasada';
}

export type TipoServico = 'standard' | 'deep-clean' | 'pos-obra' | 'airbnb' | 'laundry' | '';

export interface ServicoHoje {
  id: string;
  cliente: string;
  diarista: string;
  horarioInicio: string;
  horarioFim: string;
  status: 'concluido' | 'em-servico' | 'a-caminho' | 'descoberto';
  tipoServico: TipoServico;
}

export interface ReportRow {
  id: string;
  name: string;
  initials: string;
  color: string;
  standard: number;
  deep: number;
  posObra: number;
  laundry: number;
  airbnb: number;
  weekend: number;
  adicFds: number;
  subtotal: string;
}

const avatarColors = [
  "#2463EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
  "#E11D48", "#7C3AED",
];

export const weekDates = {
  range: "9 de fev. – 15 de fev., 2026",
  seg: { day: "Seg", date: "09/02" },
  ter: { day: "Ter", date: "10/02" },
  qua: { day: "Qua", date: "11/02" },
  qui: { day: "Qui", date: "12/02" },
  sex: { day: "Sex", date: "13/02" },
  sab: { day: "Sáb", date: "14/02" },
  dom: { day: "Dom", date: "15/02" },
};

export const colaboradores: Colaborador[] = [
  {
    id: "1", name: "Ana Paula Silva", initials: "AP", color: avatarColors[0],
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    role: "Diarista", unit: "Centro", status: "active", hoursThisWeek: 32,
    schedule: {
      seg: { type: "work", services: 2, hours: 6.5 },
      ter: { type: "work", services: 1, hours: 5 },
      qua: { type: "work", services: 2, hours: 7 },
      qui: { type: "work", services: 1, hours: 5.5 },
      sex: { type: "work", services: 2, hours: 8 },
      sab: null, dom: null,
    },
  },
  {
    id: "2", name: "Bruno Costa Oliveira", initials: "BC", color: avatarColors[1],
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    role: "Diarista", unit: "Zona Sul", status: "active", hoursThisWeek: 28,
    schedule: {
      seg: { type: "work", services: 1, hours: 5 },
      ter: { type: "work", services: 2, hours: 6 },
      qua: { type: "absence", absenceReason: "Atestado" },
      qui: { type: "work", services: 2, hours: 7 },
      sex: { type: "work", services: 1, hours: 5 },
      sab: { type: "work", services: 1, hours: 5 },
      dom: null,
    },
  },
  {
    id: "3", name: "Carla Rodrigues", initials: "CR", color: avatarColors[2],
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    role: "Supervisora", unit: "Centro", status: "active", hoursThisWeek: 15,
    schedule: {
      seg: { type: "work", services: 1, hours: 3 },
      ter: { type: "work", services: 1, hours: 3 },
      qua: { type: "work", services: 1, hours: 3 },
      qui: { type: "work", services: 1, hours: 3 },
      sex: { type: "work", services: 1, hours: 3 },
      sab: null, dom: null,
    },
  },
  {
    id: "4", name: "Diego Ferreira Santos", initials: "DF", color: avatarColors[3],
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    role: "Diarista", unit: "Zona Norte", status: "active", hoursThisWeek: 0,
    schedule: {
      seg: null, ter: null, qua: null, qui: null, sex: null, sab: null, dom: null,
    },
  },
  {
    id: "5", name: "Elaine Martins", initials: "EM", color: avatarColors[4],
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    role: "Diarista", unit: "Zona Sul", status: "active", hoursThisWeek: 26.5,
    schedule: {
      seg: { type: "work", services: 2, hours: 6.5 },
      ter: { type: "work", services: 1, hours: 4 },
      qua: { type: "work", services: 2, hours: 7 },
      qui: { type: "absence", absenceReason: "Falta" },
      sex: { type: "work", services: 2, hours: 5 },
      sab: { type: "work", services: 1, hours: 4 },
      dom: null,
    },
  },
  {
    id: "6", name: "Fabiana Souza", initials: "FS", color: avatarColors[5],
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    role: "Diarista", unit: "Centro", status: "active", hoursThisWeek: 10,
    schedule: {
      seg: { type: "work", services: 1, hours: 5 },
      ter: null,
      qua: { type: "work", services: 1, hours: 5 },
      qui: null, sex: null, sab: null, dom: null,
    },
  },
  {
    id: "7", name: "Gabriel Lima", initials: "GL", color: avatarColors[6],
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    role: "Diarista", unit: "Zona Oeste", status: "active", hoursThisWeek: 8,
    schedule: {
      seg: null,
      ter: { type: "work", services: 1, hours: 4 },
      qua: null,
      qui: { type: "work", services: 1, hours: 4 },
      sex: null,
      sab: null,
      dom: { type: "work", services: 1, hours: 4 },
    },
  },
  {
    id: "8", name: "Helena Nascimento", initials: "HN", color: avatarColors[7],
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    role: "Diarista", unit: "Zona Sul", status: "active", hoursThisWeek: 5,
    schedule: {
      seg: null, ter: null, qua: null, qui: null,
      sex: { type: "work", services: 1, hours: 5 },
      sab: null, dom: null,
    },
  },
  {
    id: "9", name: "Igor Pereira", initials: "IP", color: avatarColors[8],
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    role: "Diarista", unit: "Centro", status: "active", hoursThisWeek: 0,
    schedule: {
      seg: null, ter: null, qua: null, qui: null, sex: null, sab: null, dom: null,
    },
  },
  {
    id: "10", name: "Juliana Alves Ribeiro", initials: "JA", color: avatarColors[9],
    avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    role: "Diarista", unit: "Zona Norte", status: "active", hoursThisWeek: 12,
    schedule: {
      seg: { type: "work", services: 1, hours: 4 },
      ter: null,
      qua: { type: "work", services: 1, hours: 4 },
      qui: null,
      sex: { type: "work", services: 1, hours: 4 },
      sab: null, dom: null,
    },
  },
  {
    id: "11", name: "Lucas Mendes", initials: "LM", color: avatarColors[10],
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    role: "Diarista", unit: "Zona Oeste", status: "active", hoursThisWeek: 4,
    schedule: {
      seg: null, ter: null, qua: null, qui: null, sex: null,
      sab: { type: "work", services: 1, hours: 4 },
      dom: null,
    },
  },
  {
    id: "12", name: "Mariana Campos", initials: "MC", color: avatarColors[11],
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    role: "Diarista", unit: "Centro", status: "inactive", hoursThisWeek: 4,
    schedule: {
      seg: { type: "work", services: 1, hours: 4 },
      ter: null, qua: null, qui: null, sex: null, sab: null, dom: null,
    },
  },
];

export const servicosSemAtribuicao: Servico[] = [
  {
    id: "s1", client: "Apartamento Santos", type: "Standard Clean",
    day: "Quarta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: null,
  },
  {
    id: "s2", client: "Residência Moreira", type: "Deep Clean",
    day: "Quinta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: null,
  },
  {
    id: "s3", client: "Casa de Campo", type: "Airbnb",
    day: "Sexta", duration: "4h", estimatedCost: "R$ 180,00", assignedTo: null,
  },
];

export const servicosAtribuidos: Servico[] = [
  { id: "s4", client: "Cobertura Oliveira", type: "Standard Clean", day: "Segunda", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Ana Paula Silva" },
  { id: "s5", client: "Apt. Marques", type: "Deep Clean", day: "Segunda", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Ana Paula Silva" },
  { id: "s6", client: "Casa Ferreira", type: "Standard Clean", day: "Terça", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Bruno Costa Oliveira" },
  { id: "s7", client: "Residência Lima", type: "Pós-obra", day: "Terça", duration: "6h", estimatedCost: "R$ 330,00", assignedTo: "Bruno Costa Oliveira" },
  { id: "s8", client: "Apt. Nascimento", type: "Standard Clean", day: "Quarta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Carla Rodrigues" },
  { id: "s9", client: "Studio Alves", type: "Airbnb", day: "Quarta", duration: "4h", estimatedCost: "R$ 180,00", assignedTo: "Elaine Martins" },
  { id: "s10", client: "Casa Vila Nova", type: "Deep Clean", day: "Quinta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Elaine Martins" },
  { id: "s11", client: "Apt. Centro", type: "Standard Clean", day: "Quinta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Fabiana Souza" },
  { id: "s12", client: "Cobertura Jardins", type: "Laundry", day: "Sexta", duration: "2h", estimatedCost: "R$ 70,00", assignedTo: "Fabiana Souza" },
  { id: "s13", client: "Apt. Praia", type: "Standard Clean", day: "Sexta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Gabriel Lima" },
  { id: "s14", client: "Casa Morro", type: "Deep Clean", day: "Sexta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Helena Nascimento" },
  { id: "s15", client: "Residência Santos", type: "Standard Clean", day: "Sábado", duration: "3h", estimatedCost: "R$ 157,50", assignedTo: "Bruno Costa Oliveira" },
  { id: "s16", client: "Apt. Copacabana", type: "Airbnb", day: "Sábado", duration: "4h", estimatedCost: "R$ 270,00", assignedTo: "Elaine Martins" },
  { id: "s17", client: "Casa Ipanema", type: "Standard Clean", day: "Sábado", duration: "3h", estimatedCost: "R$ 157,50", assignedTo: "Lucas Mendes" },
  { id: "s18", client: "Studio Barra", type: "Airbnb", day: "Domingo", duration: "4h", estimatedCost: "R$ 270,00", assignedTo: "Gabriel Lima" },
  // Fill remaining to reach ~47
  { id: "s19", client: "Apt. Leblon", type: "Standard Clean", day: "Segunda", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Carla Rodrigues" },
  { id: "s20", client: "Casa Botafogo", type: "Deep Clean", day: "Terça", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Elaine Martins" },
  { id: "s21", client: "Residência Tijuca", type: "Standard Clean", day: "Quarta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Juliana Alves Ribeiro" },
  { id: "s22", client: "Cobertura Barra", type: "Laundry", day: "Quinta", duration: "2h", estimatedCost: "R$ 70,00", assignedTo: "Ana Paula Silva" },
  { id: "s23", client: "Apt. Flamengo", type: "Standard Clean", day: "Sexta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Ana Paula Silva" },
  { id: "s24", client: "Casa Gávea", type: "Deep Clean", day: "Segunda", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Elaine Martins" },
  { id: "s25", client: "Studio Lapa", type: "Standard Clean", day: "Terça", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Fabiana Souza" },
  { id: "s26", client: "Apt. Santa Teresa", type: "Airbnb", day: "Quarta", duration: "4h", estimatedCost: "R$ 180,00", assignedTo: "Ana Paula Silva" },
  { id: "s27", client: "Residência Grajaú", type: "Standard Clean", day: "Quinta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Juliana Alves Ribeiro" },
  { id: "s28", client: "Casa Méier", type: "Deep Clean", day: "Sexta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Bruno Costa Oliveira" },
  { id: "s29", client: "Apt. Maracanã", type: "Standard Clean", day: "Segunda", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Carla Rodrigues" },
  { id: "s30", client: "Cobertura Urca", type: "Pós-obra", day: "Terça", duration: "6h", estimatedCost: "R$ 330,00", assignedTo: "Ana Paula Silva" },
  { id: "s31", client: "Studio Vila Isabel", type: "Standard Clean", day: "Quarta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Bruno Costa Oliveira" },
  { id: "s32", client: "Apt. Andaraí", type: "Standard Clean", day: "Quinta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Carla Rodrigues" },
  { id: "s33", client: "Casa Penha", type: "Deep Clean", day: "Sexta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Elaine Martins" },
  { id: "s34", client: "Apt. Benfica", type: "Standard Clean", day: "Segunda", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Fabiana Souza" },
  { id: "s35", client: "Residência Ramos", type: "Laundry", day: "Terça", duration: "2h", estimatedCost: "R$ 70,00", assignedTo: "Gabriel Lima" },
  { id: "s36", client: "Casa Cascadura", type: "Standard Clean", day: "Quarta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Helena Nascimento" },
  { id: "s37", client: "Apt. Realengo", type: "Deep Clean", day: "Quinta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Juliana Alves Ribeiro" },
  { id: "s38", client: "Studio Bangu", type: "Standard Clean", day: "Sexta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Lucas Mendes" },
  { id: "s39", client: "Cobertura Recreio", type: "Airbnb", day: "Segunda", duration: "4h", estimatedCost: "R$ 180,00", assignedTo: "Ana Paula Silva" },
  { id: "s40", client: "Apt. Taquara", type: "Standard Clean", day: "Terça", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Bruno Costa Oliveira" },
  { id: "s41", client: "Casa Campo Grande", type: "Deep Clean", day: "Quarta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Carla Rodrigues" },
  { id: "s42", client: "Residência Irajá", type: "Standard Clean", day: "Quinta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Elaine Martins" },
  { id: "s43", client: "Apt. Madureira", type: "Standard Clean", day: "Sexta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Fabiana Souza" },
  { id: "s44", client: "Casa Oswaldo Cruz", type: "Pós-obra", day: "Segunda", duration: "6h", estimatedCost: "R$ 330,00", assignedTo: "Gabriel Lima" },
  { id: "s45", client: "Studio Piedade", type: "Standard Clean", day: "Terça", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Helena Nascimento" },
  { id: "s46", client: "Apt. Quintino", type: "Standard Clean", day: "Quarta", duration: "3h", estimatedCost: "R$ 105,00", assignedTo: "Juliana Alves Ribeiro" },
  { id: "s47", client: "Cobertura Abolição", type: "Deep Clean", day: "Quinta", duration: "5h", estimatedCost: "R$ 225,00", assignedTo: "Lucas Mendes" },
];

export const allServicos = [...servicosSemAtribuicao, ...servicosAtribuidos];

export const clientes: Cliente[] = [
  { id: "c1", name: "Apartamento Santos", address: "Rua das Flores, 123 - Centro", serviceType: "Standard Clean", frequency: "Semanal", phone: "(21) 99123-4567" },
  { id: "c2", name: "Residência Moreira", address: "Av. Brasil, 456 - Zona Sul", serviceType: "Deep Clean", frequency: "Quinzenal", phone: "(21) 99234-5678" },
  { id: "c3", name: "Casa de Campo", address: "Estrada do Sol, 789 - Zona Oeste", serviceType: "Airbnb", frequency: "Sob demanda", phone: "(21) 99345-6789" },
  { id: "c4", name: "Cobertura Oliveira", address: "Rua do Ouvidor, 101 - Centro", serviceType: "Standard Clean", frequency: "Semanal", phone: "(21) 99456-7890" },
  { id: "c5", name: "Apt. Marques", address: "Rua Marquês de Abrantes, 55 - Flamengo", serviceType: "Deep Clean", frequency: "Semanal", phone: "(21) 99567-8901" },
  { id: "c6", name: "Casa Ferreira", address: "Rua São Clemente, 200 - Botafogo", serviceType: "Standard Clean", frequency: "Quinzenal", phone: "(21) 99678-9012" },
  { id: "c7", name: "Residência Lima", address: "Rua Voluntários da Pátria, 88 - Humaitá", serviceType: "Pós-obra", frequency: "Avulso", phone: "(21) 99789-0123" },
  { id: "c8", name: "Apt. Nascimento", address: "Rua Senador Vergueiro, 33 - Flamengo", serviceType: "Standard Clean", frequency: "Semanal", phone: "(21) 99890-1234" },
  { id: "c9", name: "Studio Alves", address: "Rua Dias Ferreira, 44 - Leblon", serviceType: "Airbnb", frequency: "Sob demanda", phone: "(21) 99901-2345" },
  { id: "c10", name: "Casa Vila Nova", address: "Rua Alice, 77 - Laranjeiras", serviceType: "Deep Clean", frequency: "Mensal", phone: "(21) 99012-3456" },
];

export const unidades: Unidade[] = [
  { id: "u1", name: "Centro", address: "Rua da Assembleia, 100 - Centro, RJ", collaboratorCount: 5, sectors: ["Limpeza", "Supervisão"], manager: "Carla Rodrigues" },
  { id: "u2", name: "Zona Sul", address: "Rua Barata Ribeiro, 200 - Copacabana, RJ", collaboratorCount: 3, sectors: ["Limpeza", "Lavanderia"], manager: "Ana Paula Silva" },
  { id: "u3", name: "Zona Norte", address: "Av. Dom Hélder Câmara, 300 - Cachambi, RJ", collaboratorCount: 2, sectors: ["Limpeza"], manager: "Juliana Alves Ribeiro" },
  { id: "u4", name: "Zona Oeste", address: "Av. das Américas, 400 - Barra da Tijuca, RJ", collaboratorCount: 2, sectors: ["Limpeza", "Pós-obra"], manager: "Gabriel Lima" },
];

export const reportData: ReportRow[] = [
  { id: "1", name: "Ana Paula Silva", initials: "AP", color: avatarColors[0], standard: 12, deep: 5, posObra: 6, laundry: 0, airbnb: 4, weekend: 0, adicFds: 0, subtotal: "R$ 378,00" },
  { id: "2", name: "Bruno Costa Oliveira", initials: "BC", color: avatarColors[1], standard: 9, deep: 6, posObra: 0, laundry: 0, airbnb: 0, weekend: 5, adicFds: 17.50, subtotal: "R$ 297,50" },
  { id: "3", name: "Carla Rodrigues", initials: "CR", color: avatarColors[2], standard: 9, deep: 5, posObra: 0, laundry: 0, airbnb: 0, weekend: 0, adicFds: 0, subtotal: "R$ 196,00" },
  { id: "5", name: "Elaine Martins", initials: "EM", color: avatarColors[4], standard: 6.5, deep: 4, posObra: 0, laundry: 0, airbnb: 8, weekend: 4, adicFds: 42.00, subtotal: "R$ 301,00" },
  { id: "6", name: "Fabiana Souza", initials: "FS", color: avatarColors[5], standard: 8, deep: 0, posObra: 0, laundry: 2, airbnb: 0, weekend: 0, adicFds: 0, subtotal: "R$ 140,00" },
  { id: "7", name: "Gabriel Lima", initials: "GL", color: avatarColors[6], standard: 3, deep: 0, posObra: 6, laundry: 0, airbnb: 4, weekend: 0, adicFds: 60.00, subtotal: "R$ 242,00" },
  { id: "8", name: "Helena Nascimento", initials: "HN", color: avatarColors[7], standard: 5, deep: 0, posObra: 0, laundry: 0, airbnb: 0, weekend: 0, adicFds: 0, subtotal: "R$ 70,00" },
  { id: "10", name: "Juliana Alves Ribeiro", initials: "JA", color: avatarColors[9], standard: 6, deep: 5, posObra: 0, laundry: 0, airbnb: 0, weekend: 0, adicFds: 0, subtotal: "R$ 154,00" },
  { id: "11", name: "Lucas Mendes", initials: "LM", color: avatarColors[10], standard: 3, deep: 5, posObra: 0, laundry: 0, airbnb: 0, weekend: 4, adicFds: 0, subtotal: "R$ 157,50" },
  { id: "12", name: "Mariana Campos", initials: "MC", color: avatarColors[11], standard: 4, deep: 0, posObra: 0, laundry: 0, airbnb: 0, weekend: 0, adicFds: 0, subtotal: "R$ 56,00" },
];

export const dashboardSummary = {
  horasRegistradas: "144,5h",
  custoEstimado: "R$ 2.068,50",
  servicosSemAtribuicao: 3,
  pendencias: 5,
};

export const reportSummary = {
  horasTotais: "144,5h",
  custoTotal: "R$ 2.068,50",
  adicFds: "R$ 119,50",
};

export const dashboardSummaryV2 = {
  custoDaSemana: "R$ 2.068,50",
  custoVariacao: "+R$ 180",
  horasRegistradas: "144h",
  servicosDescobertos: 3,
  pendencias: 5,
};

// Rotas ativas — mock com horários relativos ao "agora"
function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}
function hoursFromNow(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

export const rotasAtivas: RotaAtiva[] = [
  {
    id: "r1",
    diarista: { nome: "Ana Paula Silva", iniciais: "AP", corAvatar: "#1B6545" },
    local: "Apto Fernandes",
    tipoServico: "Limpeza completa",
    inicioISO: hoursAgo(2),
    terminoPrevisoISO: hoursFromNow(1.5),
    status: "em-servico",
  },
  {
    id: "r2",
    diarista: { nome: "Bruno Costa Oliveira", iniciais: "BC", corAvatar: "#4DAE89" },
    local: "Casa Vila Nova",
    tipoServico: "Deep clean",
    inicioISO: hoursAgo(3.5),
    terminoPrevisoISO: hoursAgo(0.5),
    status: "atrasada",
  },
  {
    id: "r3",
    diarista: { nome: "Elaine Martins", iniciais: "EM", corAvatar: "#BA7517" },
    local: "Cobertura Jardins",
    tipoServico: "Pós-obra",
    inicioISO: hoursAgo(0.5),
    terminoPrevisoISO: hoursFromNow(3),
    status: "iniciando",
  },
  {
    id: "r4",
    diarista: { nome: "Gabriel Lima", iniciais: "GL", corAvatar: "#0F3D28" },
    local: "Studio Alves",
    tipoServico: "Airbnb checkout",
    inicioISO: hoursAgo(1),
    terminoPrevisoISO: hoursFromNow(0.5),
    status: "quase-no-fim",
  },
];

export const servicosHoje: ServicoHoje[] = [
  { id: "sh1", cliente: "Apto Fernandes", diarista: "Ana Paula Silva", horarioInicio: "08:00", horarioFim: "11:30", status: "em-servico", tipoServico: "standard" },
  { id: "sh2", cliente: "Casa Vila Nova", diarista: "Bruno Costa Oliveira", horarioInicio: "07:00", horarioFim: "11:00", status: "em-servico", tipoServico: "deep-clean" },
  { id: "sh3", cliente: "Cobertura Jardins", diarista: "Elaine Martins", horarioInicio: "10:00", horarioFim: "14:00", status: "a-caminho", tipoServico: "standard" },
  { id: "sh4", cliente: "Studio Alves", diarista: "Gabriel Lima", horarioInicio: "09:30", horarioFim: "12:00", status: "em-servico", tipoServico: "airbnb" },
  { id: "sh5", cliente: "Apt. Marques", diarista: "—", horarioInicio: "13:00", horarioFim: "16:00", status: "descoberto", tipoServico: "" },
];

export const custoPorDiarista = [
  { nome: "Ana Paula Silva", iniciais: "AP", cor: "#1B6545", custo: 378, horasExtras: 0 },
  { nome: "Bruno Costa Oliveira", iniciais: "BC", cor: "#4DAE89", custo: 297.5, horasExtras: 17.5 },
  { nome: "Elaine Martins", iniciais: "EM", cor: "#1B6545", custo: 301, horasExtras: 42 },
  { nome: "Gabriel Lima", iniciais: "GL", cor: "#1B6545", custo: 242, horasExtras: 60 },
  { nome: "Carla Rodrigues", iniciais: "CR", cor: "#4DAE89", custo: 196, horasExtras: 0 },
  { nome: "Juliana Alves Ribeiro", iniciais: "JA", cor: "#4DAE89", custo: 154, horasExtras: 0 },
  { nome: "Fabiana Souza", iniciais: "FS", cor: "#1B6545", custo: 140, horasExtras: 0 },
  { nome: "Lucas Mendes", iniciais: "LM", cor: "#4DAE89", custo: 157.5, horasExtras: 0 },
  { nome: "Helena Nascimento", iniciais: "HN", cor: "#1B6545", custo: 70, horasExtras: 0 },
].sort((a, b) => b.custo - a.custo);

export const servicosSemana = [
  { dia: "Seg", total: 8, hoje: false },
  { dia: "Ter", total: 7, hoje: false },
  { dia: "Qua", total: 9, hoje: true },
  { dia: "Qui", total: 6, hoje: false },
  { dia: "Sex", total: 8, hoje: false },
  { dia: "S\u00e1b", total: 4, hoje: false },
  { dia: "Dom", total: 2, hoje: false },
];

export const diaristaStatus = [
  { nome: "Ana Paula Silva", iniciais: "AP", cor: "#1B6545", tarefa: "Limpeza completa \u2014 Apto Fernandes", status: "ocupada" as const },
  { nome: "Bruno Costa Oliveira", iniciais: "BC", cor: "#4DAE89", tarefa: "Deep clean \u2014 Casa Vila Nova", status: "ocupada" as const },
  { nome: "Elaine Martins", iniciais: "EM", cor: "#BA7517", tarefa: "A caminho \u2014 Cobertura Jardins", status: "a-caminho" as const },
  { nome: "Gabriel Lima", iniciais: "GL", cor: "#0F3D28", tarefa: "Airbnb checkout \u2014 Studio Alves", status: "ocupada" as const },
  { nome: "Carla Rodrigues", iniciais: "CR", cor: "#4DAE89", tarefa: "Dispon\u00edvel para atribui\u00e7\u00e3o", status: "livre" as const },
  { nome: "Fabiana Souza", iniciais: "FS", cor: "#1B6545", tarefa: "Atestado m\u00e9dico", status: "ausente" as const },
];
