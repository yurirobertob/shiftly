# Shiftsly

**Schedule management for cleaning businesses — built for the UK market.**

Shiftsly helps cleaning business managers stop running their operations on WhatsApp and start using a tool built for them. Weekly scheduling, cleaner management, client tracking, and payment control — all in one place.

🔗 **Live:** [shiftsly.com](https://shiftsly.com)

---

## The Problem

Cleaning business managers in the UK — typically running teams of 5 to 30 cleaners — manage their entire operation through WhatsApp group chats. Schedules are sent as photos of handwritten notes. Payments are tracked on paper. Clients get forgotten.

I saw this firsthand while living in London. Shiftsly is the tool I wish existed.

---

## Features

- **Weekly Schedule** — drag-and-drop weekly view with per-cleaner assignment, mobile carousel for on-the-go managers
- **Cleaner Management** — profiles, availability, contact info, performance tracking
- **Client Management** — client database with service history and linked jobs
- **Payment Tracking** — log and export cleaner payments per schedule
- **Subscription Billing** — Stripe-powered plans with usage limits enforced at the API level
- **Auth** — Google OAuth + magic link (passwordless) via Resend
- **Usability Testing Panel** — built-in 6-step NPS form at `/teste` for user research, with admin response viewer at `/admin/respostas`
- **Growth Agent** — Telegram bot that sends daily insights from Stripe and DB metrics (2x/day cron)
- **Design System** — component library with Storybook, built on Material Design 3 principles

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma |
| Auth | NextAuth v5 — Google OAuth + magic link |
| Payments | Stripe (checkout, portal, webhooks) |
| Email | Resend |
| Animation | Framer Motion + Three.js / React Three Fiber |
| State | TanStack Query |
| Components | Storybook |

---

## Pricing

| Plan | Price | Cleaners |
|---|---|---|
| Basic | Free | Up to 5 |
| Pro | £39 / month | Up to 15 |
| Plus | £59 / month | Up to 30 |

---

## Running Locally

```bash
# 1. Clone
git clone https://github.com/yurirobertob/shiftsly
cd shiftsly

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in: DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET,
#          RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# 4. Generate Prisma client
npx prisma generate

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  (auth)/          # Authenticated routes (dashboard, schedule, clients, billing)
  (public)/        # Public routes (landing, usability test)
  api/             # API routes (schedule, cleaners, clients, payments, Stripe)
components/
  landing/         # Landing page sections
  dashboard/       # KPI cards, schedule table, charts
  ui/              # Base UI components (shadcn/ui)
design-system/     # Design tokens and Storybook stories
```

---

## About

Built by [Yuri Roberto](https://yuriroberto.com) — product designer turned developer.  
Identified the market gap firsthand while living in London (2022–2023).

[![LinkedIn](https://img.shields.io/badge/LinkedIn-yuriroberto-blue)](https://linkedin.com/in/yuriroberto)
