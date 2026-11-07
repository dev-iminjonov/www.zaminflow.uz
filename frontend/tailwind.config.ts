import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070B14",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        slate: {
          500: "#64748B",
          400: "#94A3B8",
          300: "#B8C6D9",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        emerald: {
          700: "#047857",
          600: "#059669",
          500: "#10B981",
          50: "#ECFDF5",
        },
        teal: {
          700: "#0D7377",
          200: "#A7D9C8",
          50: "#EAF6F5",
        },
        brandGreen: {
          DEFAULT: "#087a3c",
          text: "#087a3c",
          glow: "#00C853",
        },
        navActive: "#20382F",
        amber: {
          600: "#D97706",
          50: "#FFFBEB",
        },
        red: {
          500: "#EF4444",
          50: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(15,23,42,0.06)",
        sm: "0 2px 4px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        float: "0 24px 48px -12px rgba(15,23,42,0.22)",
        glowEmerald: "0 0 0 1px rgba(16,185,129,0.35), 0 0 32px rgba(16,185,129,0.25)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        pill: "999px",
      },
      transitionTimingFunction: {
        "ease-out-custom": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-out-custom": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
