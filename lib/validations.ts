import { z } from "zod";

// ─── Cleaners ─────────────────────────────────────────────────────────────────

export const cleanerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable().or(z.literal("")),
  hourlyRate: z.number().min(0).optional().default(15.0),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]).optional().default("ACTIVE"),
  avatarColor: z.string().max(7).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional().nullable().or(z.literal("")),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const jobSchema = z.object({
  scheduleId: z.string().min(1),
  cleanerId: z.string().optional().nullable(),
  clientId: z.string().min(1),
  date: z.string().or(z.date()),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.enum(["SCHEDULED", "COMPLETED", "ABSENT", "CANCELLED", "UNCOVERED"]).optional(),
  notes: z.string().optional().nullable(),
});

// ─── Template Slots ───────────────────────────────────────────────────────────

export const templateSlotSchema = z.object({
  templateId: z.string().min(1),
  cleanerId: z.string().min(1),
  clientId: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// ─── Absences ─────────────────────────────────────────────────────────────────

export const absenceSchema = z.object({
  cleanerId: z.string().min(1),
  date: z.string().or(z.date()),
  reason: z.string().optional().nullable(),
});

// ─── Legacy aliases (kept for old API routes until Phase 2 rewrites them) ─────

export const colaboradorSchema = cleanerSchema;
export const unidadeSchema = z.object({ name: z.string().min(1) });
export const clienteSchema = clientSchema;
