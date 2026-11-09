import { Locale } from "@/messages/translations";

/**
 * Maps application locale to BCP 47 language tag
 */
export function getBcp47Locale(locale: Locale): string {
  switch (locale) {
    case "ru":
      return "ru-RU";
    case "en":
      return "en-US";
    case "uz":
    default:
      return "uz-UZ";
  }
}

/**
 * Formats a monetary number into localized currency string
 * e.g., 48,500,000 UZS -> 48 500 000 UZS (RU/UZ) or 48,500,000 UZS (EN)
 */
export function formatCurrency(amount: number, locale: Locale = "uz", currencySuffix = "UZS"): string {
  const bcp = getBcp47Locale(locale);
  const formatted = new Intl.NumberFormat(bcp, {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formatted} ${currencySuffix}`;
}

/**
 * Formats a liquid volume in liters with localized unit label
 * e.g., 5000 -> "5 000 L" (EN) / "5 000 л" (RU) / "5 000 Litr" (UZ)
 */
export function formatVolume(liters: number, locale: Locale = "uz", short = true): string {
  const bcp = getBcp47Locale(locale);
  const formatted = new Intl.NumberFormat(bcp, {
    maximumFractionDigits: 1,
  }).format(liters);

  let unit = "L";
  if (locale === "ru") {
    unit = short ? "л" : "литров";
  } else if (locale === "uz") {
    unit = short ? "L" : "Litr";
  }

  return `${formatted} ${unit}`;
}

/**
 * Russian 3-form pluralization helper
 * 1 день, 2 дня, 5 дней
 */
export function getRussianPlural(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count) % 100;
  const rem = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (rem > 1 && rem < 5) return few;
  if (rem === 1) return one;
  return many;
}

/**
 * Localized date formatter
 */
export function formatDate(date: string | Date, locale: Locale = "uz"): string {
  const bcp = getBcp47Locale(locale);
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(bcp, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
