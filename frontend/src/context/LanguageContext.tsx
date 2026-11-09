"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Locale, translations, Translations } from "@/messages/translations";
import { authTranslations } from "@/messages/auth";
import { dashboardTranslations } from "@/messages/dashboard";
import { deepTransformUzbek } from "@/lib/uzbekAlphabet";

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: Translations;
  authT: (typeof authTranslations)["uz"];
  dashT: (typeof dashboardTranslations)["uz"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "zaminflow_locale";
const COOKIE_NAME = "NEXT_LOCALE";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "uz";

  try {
    // 1. Local storage check
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === "uz" || saved === "ru" || saved === "en")) {
      return saved;
    }

    // 2. Cookie check
    const match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
    if (match && (match[2] === "uz" || match[2] === "ru" || match[2] === "en")) {
      return match[2] as Locale;
    }

    // 3. Browser language
    const navLang = navigator.language?.toLowerCase() || "";
    if (navLang.startsWith("ru")) return "ru";
    if (navLang.startsWith("en")) return "en";
    if (navLang.startsWith("uz")) return "uz";
  } catch (e) {
    // Fallback to default
  }

  // 4. Default to Uzbek Latin (DOC-LOC-001)
  return "uz";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("uz");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);
    setIsInitialized(true);
    document.documentElement.lang = initial;
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (newLocale !== "uz" && newLocale !== "ru" && newLocale !== "en") return;
    setLocaleState(newLocale);

    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    } catch (e) {
      console.warn("Failed to persist locale:", e);
    }
  };

  const t = useMemo(() => {
    const raw = translations[locale] || translations.uz;
    return locale === "uz" ? deepTransformUzbek(raw) : raw;
  }, [locale]);

  const authT = useMemo(() => {
    const raw = authTranslations[locale] || authTranslations.uz;
    return locale === "uz" ? deepTransformUzbek(raw) : raw;
  }, [locale]);

  const dashT = useMemo(() => {
    const raw = dashboardTranslations[locale] || dashboardTranslations.uz;
    return locale === "uz" ? deepTransformUzbek(raw) : raw;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, authT, dashT }}>
      {children}
    </LanguageContext.Provider>
  );
}

const fallbackUzTranslations = deepTransformUzbek(translations.uz);
const fallbackUzAuth = deepTransformUzbek(authTranslations.uz);
const fallbackUzDash = deepTransformUzbek(dashboardTranslations.uz);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Resilient fallback if component rendered outside Provider during SSR or testing
    return {
      locale: "uz" as Locale,
      setLocale: () => {},
      t: fallbackUzTranslations,
      authT: fallbackUzAuth,
      dashT: fallbackUzDash,
    };
  }
  return context;
}
