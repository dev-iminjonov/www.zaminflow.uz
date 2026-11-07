"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" className="dark">
      <head>
        <title>ZaminFlow v2.0 — B2B Dairy Supply Chain & FinTech Escrow</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className="min-h-screen antialiased">
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
