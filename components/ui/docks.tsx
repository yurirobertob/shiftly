"use client";
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeDockProps {
  theme?: string;
  onThemeChange?: (theme: string) => void;
}

export const ThemeDock = ({ theme = "light", onThemeChange }: ThemeDockProps) => {
  return (
    <div className="inline-flex rounded-lg overflow-hidden relative bg-white/20 dark:bg-black/40 backdrop-blur-md shadow-lg shadow-black/20 border border-gray-300 dark:border-black/60 transition-colors duration-500">
      <button
        onClick={() => onThemeChange?.("light")}
        className={`px-3 py-1.5 rounded-l-lg flex items-center gap-1.5 text-sm bg-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300 focus:outline-none border-r border-gray-300 dark:border-black/60 group ${theme === "light" ? "bg-black/10 dark:bg-white/10 font-medium" : "text-muted-foreground"}`}
        aria-label="Light Mode"
      >
        <Sun className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span className="select-none">Claro</span>
      </button>
      <button
        onClick={() => onThemeChange?.("dark")}
        className={`px-3 py-1.5 flex items-center gap-1.5 text-sm bg-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300 focus:outline-none border-r border-gray-300 dark:border-black/60 group ${theme === "dark" ? "bg-black/10 dark:bg-white/10 font-medium" : "text-muted-foreground"}`}
        aria-label="Dark Mode"
      >
        <Moon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span className="select-none">Escuro</span>
      </button>
      <button
        onClick={() => onThemeChange?.("auto")}
        className={`px-3 py-1.5 rounded-r-lg flex items-center gap-1.5 text-sm bg-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300 focus:outline-none group ${theme === "auto" ? "bg-black/10 dark:bg-white/10 font-medium" : "text-muted-foreground"}`}
        aria-label="Auto Mode"
      >
        <Monitor className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span className="select-none">Auto</span>
      </button>
    </div>
  );
};
