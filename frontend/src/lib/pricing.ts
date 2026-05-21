import type { Locale } from "@/lib/i18n/translations";

/** Convierte créditos/min a precio COP mostrado (mock: 50 COP por crédito) */
export function creditsToCop(creditsPerMinute: number): number {
  return creditsPerMinute * 50;
}

export function formatPricePerMinute(
  creditsPerMinute: number,
  locale: Locale = "es",
): string {
  if (locale === "en") {
    return `${creditsPerMinute} credits/min · $${(creditsPerMinute * 0.5).toFixed(2)}`;
  }
  const cop = creditsToCop(creditsPerMinute);
  return `$${cop.toLocaleString("es-CO")} COP/min`;
}

/** @deprecated Use formatPricePerMinute */
export function formatCopPerMinute(creditsPerMinute: number): string {
  return formatPricePerMinute(creditsPerMinute, "es");
}
