// src/components/ThemeToggle.tsx
"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false);

  // On mount, read preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fundflow_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = stored ? stored === "dark" : prefersDark;
      setDark(isDark);
      updateHtmlClass(isDark);
    }
  }, []);

  const updateHtmlClass = (isDark: boolean) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("fundflow_theme", isDark ? "dark" : "light");
  };

  const toggle = () => {
    const newMode = !dark;
    setDark(newMode);
    updateHtmlClass(newMode);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center p-2 rounded-full text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
