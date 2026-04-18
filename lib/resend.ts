import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified domain or fallback to resend.dev for development
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Shiftsly <onboarding@resend.dev>";
