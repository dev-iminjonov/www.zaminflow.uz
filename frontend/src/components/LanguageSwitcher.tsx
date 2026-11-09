"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Locale } from "@/messages/translations";

interface LanguageSwitcherProps {
  className?: string;
  isDark?: boolean;
}

const LANGUAGES: { code: Locale; label: string; full: string }[] = [
  { code: "uz", label: "UZ", full: "Özbekça" },
  { code: "ru", label: "RU", full: "Русский" },
  { code: "en", label: "EN", full: "English" },
];

export default function LanguageSwitcher({ className = "", isDark }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Select language"
      className={`inline-flex items-center rounded-full p-1 border transition-all duration-200 ${
        isDark
          ? "bg-[#0A1926]/90 border-[#247BA0]/40 shadow-xs"
          : "bg-white/90 border-[#ade8f4] shadow-xs"
      } ${className}`}
    >
      {LANGUAGES.map((lang) => {
        const isActive = locale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLocale(lang.code)}
            aria-pressed={isActive}
            title={lang.full}
            className={`min-h-[32px] sm:min-h-[36px] min-w-[36px] sm:min-w-[40px] px-2.5 sm:px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              isActive
                ? isDark
                  ? "bg-[#1B98E0] text-[#13293D] shadow-sm scale-100"
                  : "bg-[#023e8a] text-white shadow-sm scale-100"
                : isDark
                ? "text-[#E8F1F2]/75 hover:text-white hover:bg-white/10"
                : "text-[#0077b6] hover:text-[#03045e] hover:bg-[#caf0f8]/60"
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
