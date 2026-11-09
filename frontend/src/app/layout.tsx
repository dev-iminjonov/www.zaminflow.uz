"use client";

import React from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import OfflinePwaIndicator from "@/components/pwa/OfflinePwaIndicator";
import { inter, jetbrainsMono } from "./fonts";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="light" suppressHydrationWarning>
      <head>
        <title>ZaminFlow</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00ffc8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = window.localStorage.getItem('zaminflow_theme');
                  var root = document.documentElement;
                  if (saved === 'dark') {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.style.colorScheme = 'light';
                  }

                  var savedLang = window.localStorage.getItem('zaminflow_locale');
                  if (savedLang === 'ru' || savedLang === 'en' || savedLang === 'uz') {
                    root.lang = savedLang;
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <OfflinePwaIndicator />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
