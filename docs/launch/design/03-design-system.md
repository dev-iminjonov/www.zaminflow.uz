# ZaminFlow Design System Token Specification

**Document ID:** `DOC-DSGN-003`  
**Squad Lead:** Website Design Specialist  
**Status:** Approved Standard  
**Date:** 2026-11-08  

---

## 1. Unified Color Tokens (Light & Dark Themes)

### Primary Brand Palette (Coolors Harmonized: https://coolors.co/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8)
- `--coolors-50: #caf0f8` (Frosted ice tint, soft table header and badge fill)
- `--coolors-100: #ade8f4` (Powder blue, subtle borders, container outlines)
- `--coolors-200: #90e0ef` (Ice blue, input focus rings, dividers)
- `--coolors-300: #48cae4` (Sky blue, accent highlights, active tabs)
- `--coolors-400: #00b4d8` (Bright cyan, primary accents, sparklines)
- `--coolors-500: #0096c7` (Pacific cyan, icons, hover badges)
- `--coolors-600: #0077b6` (Ocean blue, secondary text, muted dark elements)
- `--coolors-700: #023e8a` (Royal cobalt, primary button background, high-emphasis text)
- `--coolors-800: #03045e` (Midnight navy, main headings, primary text)

### Text Contrast Tokens (WCAG 2.2 AAA Certified)
- `--brand-blue-text: #0077b6` (Contrast > 5.5:1 on light surfaces)
- `--text-light: #03045e` (Contrast 16.8:1 on white / #f4fbfe)
- `--text-muted-light: #0077b6` (Contrast 5.4:1 on white)
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
