# ZaminFlow Design System Token Specification

**Document ID:** `DOC-DSGN-003`  
**Squad Lead:** Website Design Specialist  
**Status:** Approved Standard  
**Date:** 2026-11-08  

---

## 1. Unified Color Tokens (Light & Dark Themes)

### Primary Brand Palette (Coolors Harmonized)
- `--coolors-50: #d8f3dc` (Lightest tint, soft hover fill)
- `--coolors-100: #b7e4c7` (Subtle borders, container outlines)
- `--coolors-200: #95d5b2` (Input focus rings, dividers)
- `--coolors-300: #74c69d` (Accent highlights, active tabs)
- `--coolors-400: #52b788` (Vibrant emerald, primary accents, sparklines)
- `--coolors-500: #40916c` (Medium forest green, icons, hover badges)
- `--coolors-600: #2d6a4f` (Deep emerald, secondary text, muted dark elements)
- `--coolors-700: #1b4332` (Dark pine, primary button background, high-emphasis text)
- `--coolors-800: #081c15` (Deepest forest black, main headings, primary text)

### Text Contrast Tokens (WCAG 2.2 AA Certified)
- `--brand-green-text: #087a3c` (Contrast 5.25:1 on white/mint surfaces)
- `--text-light: #081c15` (Contrast 17.2:1 on white)
- `--text-muted-light: #2d6a4f` (Contrast 5.4:1 on white)
- `--text-dark: #E8F1F2` (Contrast 14.8:1 on `#0A1926`)
- `--text-muted-dark: #94A3B8` (Contrast 6.2:1 on `#0A1926`)

---

## 2. Typography Scale

- **Primary Sans:** Inter (Clean, legible across small mobile screens)
- **Monospace (Data & Finance):** JetBrains Mono (Tabular numerals, prices, volumes, timestamps)
  - Scale:
    - Display / H1: `clamp(2.25rem, 5vw, 4.5rem)` (36px–72px), font-weight: 800/900
    - Section H2: `clamp(1.875rem, 3.5vw, 2.625rem)` (30px–42px), font-weight: 800
    - Card H3: `1.25rem` (20px), font-weight: 700
    - Body: `1rem` (16px), font-weight: 400/500
    - Small / Caption: `0.75rem` (12px), font-weight: 600
    - Stat Numbers: `clamp(2.25rem, 4vw, 3.25rem)` (36px–52px), font-weight: 700 mono

---

## 3. Shape & Surface Elevation

- **Pill Shape:** `rounded-full` (Nav bar, primary buttons, status chips, search bars)
- **Glass Card:** `rounded-[28px]` or `rounded-[32px]`, `backdrop-blur-xl`, border 1px solid
- **Tap Targets:** Minimum `44px` height/width across all interactive touch surfaces
- **Focus Rings:** `focus:outline-none focus:ring-2 focus:ring-[#52b788] focus:ring-offset-2`
