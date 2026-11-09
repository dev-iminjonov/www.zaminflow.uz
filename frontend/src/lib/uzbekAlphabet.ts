/**
 * New Uzbek Latin Alphabet Utility (Yangi Özbek Lotin Alifbosi)
 * Based on the Law approved by the President of the Republic of Uzbekistan:
 * - Oʻ / oʻ  →  Ö / ö
 * - Gʻ / gʻ  →  Ğ / ğ
 * - Sh / sh  →  Ş / ş
 * - Ch / ch  →  Ç / ç
 * 
 * Preserves the glottal stop / modifier apostrophe (tuturuq belgisi) in words like ma'lumot, e'lon, ta'sir.
 */

const O_VARIANTS = /[oO][ʻ'‘ʼ’`´]/g;
const G_VARIANTS = /[gG][ʻ'‘ʼ’`´]/g;

export function toNewUzbekAlphabet(input: string): string {
  if (!input || typeof input !== "string") return input;

  return input
    // Oʻ / oʻ → Ö / ö
    .replace(/O[ʻ'‘ʼ’`´]/g, "Ö")
    .replace(/o[ʻ'‘ʼ’`´]/g, "ö")
    // Gʻ / gʻ → Ğ / ğ
    .replace(/G[ʻ'‘ʼ’`´]/g, "Ğ")
    .replace(/g[ʻ'‘ʼ’`´]/g, "ğ")
    // Sh / sh → Ş / ş
    .replace(/SH/g, "Ş")
    .replace(/Sh/g, "Ş")
    .replace(/sh/g, "ş")
    // Ch / ch → Ç / ç
    .replace(/CH/g, "Ç")
    .replace(/Ch/g, "Ç")
    .replace(/ch/g, "ç");
}

/**
 * Recursively converts all string values in an object or array to the new Uzbek alphabet.
 */
export function deepTransformUzbek<T>(data: T): T {
  if (typeof data === "string") {
    return toNewUzbekAlphabet(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => deepTransformUzbek(item)) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const result: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      result[key] = deepTransformUzbek((data as Record<string, any>)[key]);
    }
    return result as unknown as T;
  }
  return data;
}

/**
 * Shorthand helper for inline template strings
 */
export const uz = toNewUzbekAlphabet;
