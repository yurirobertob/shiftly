import { z } from "zod";

export const colaboradorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  valorHora: z.number().min(0).optional(),
  empresaId: z.string().min(1),
  unidadeId: z.string().optional(),
  setorId: z.string().optional(),
  cargoId: z.string().optional(),
});

export const unidadeSchema = z.object({
  name: z.string().min(1),
  empresaId: z.string().min(1),
  gestorId: z.string().optional(),
});

export const clienteSchema = z.object({
  name: z.string().min(1),
  empresaId: z.string().min(1),
  address: z.string().optional().or(z.literal("")),
  serviceType: z.string().optional().or(z.literal("")),
});
