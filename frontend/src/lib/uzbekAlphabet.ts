/**
 * New Uzbek Latin Alphabet Utility (Yangi Özbek Lotin Alifbosi)
 * Conforming to the reformed Uzbek Latin alphabet standards:
 * - Oʻ / oʻ  →  Ö / ö
 * - Gʻ / gʻ  →  Ğ / ğ
 * - Sh / sh  →  Ş / ş
 * - Ch / ch  →  Ç / ç
 * 
 * Preserves the glottal stop / modifier apostrophe (tuturuq belgisi) in words like maʼlumot, eʼlon, taʼsir.
 * Preserves URLs, emails, phone numbers, and code paths.
 */

export function toNewUzbekAlphabet(input: string): string {
  if (!input || typeof input !== "string") return input;

  // Do not transform pure URLs, emails, phone numbers, IDs, or file paths
  if (
    input.startsWith("http://") ||
    input.startsWith("https://") ||
    input.startsWith("mailto:") ||
    input.startsWith("tel:") ||
    input.startsWith("/") ||
    input.startsWith("#") ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
  ) {
    return input;
  }

  // Preserve URLs and emails embedded in text
  const placeholders: string[] = [];
  let protectedText = input
    .replace(/https?:\/\/[^\s]+/g, (match) => {
      placeholders.push(match);
      return `___URL_PH_${placeholders.length - 1}___`;
    })
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
      placeholders.push(match);
      return `___EMAIL_PH_${placeholders.length - 1}___`;
    });

  let transformed = protectedText
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

  // Restore placeholders
  placeholders.forEach((val, idx) => {
    transformed = transformed
      .replace(`___URL_PH_${idx}___`, val)
      .replace(`___EMAIL_PH_${idx}___`, val);
  });

  return transformed;
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
