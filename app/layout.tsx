import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shiftsly — Stop managing your cleaners on WhatsApp",
  description: "Schedule the week in minutes, know exactly what you'll pay each cleaner, and never be caught off guard when someone calls in sick.",
  openGraph: {
    title: "Shiftsly — The scheduling tool for cleaning managers",
    description: "Built for cleaning managers in London. Bilingual PT/EN. Schedule, pay, and manage your cleaning team in one place.",
    url: "https://apporganizacao.vercel.app",
    siteName: "Shiftsly",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shiftsly — Stop managing your cleaners on WhatsApp",
    description: "Schedule, pay, and manage your cleaning team in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
