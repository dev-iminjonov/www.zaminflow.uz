import { Inter, JetBrains_Mono } from "next/font/google";

export const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});
