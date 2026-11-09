"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "zaminflow_theme";

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "light",
  isDark: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

function applyHtmlTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark") {
      setThemeModeState("dark");
      applyHtmlTheme("dark");
    } else {
      setThemeModeState("light");
      applyHtmlTheme("light");
    }

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === THEME_STORAGE_KEY &&
        (event.newValue === "light" || event.newValue === "dark")
      ) {
        setThemeModeState(event.newValue);
        applyHtmlTheme(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    applyHtmlTheme(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      applyHtmlTheme(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark: themeMode === "dark",
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export interface ThemeToggleButtonProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggleButton({
  className = "",
  size = "md",
}: ThemeToggleButtonProps) {
  const { isDark, toggleTheme } = useTheme();
  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold transition-all duration-200 border cursor-pointer select-none shrink-0 ${
        isDark
          ? "bg-[#212d40]/60 border-[#273246] text-[#22d36b] hover:bg-[#2c374b]/60 shadow-xs"
          : "bg-white/90 border-[#b7e4c7] text-[#081c15] hover:bg-[#d8f3dc] hover:border-[#52b788] shadow-xs"
      } ${className}`}
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}
