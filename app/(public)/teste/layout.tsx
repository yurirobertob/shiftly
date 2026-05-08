import { DM_Serif_Display, DM_Sans } from "next/font/google";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export default function TesteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      {children}
    </div>
  );
}
