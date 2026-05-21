"use client";

import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const locales: Locale[] = ["es", "en"];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="flex items-center shrink-0"
      role="group"
      aria-label={t("common.language")}
    >
      {locales.map((code, index) => (
        <span key={code} className="flex items-center">
          {index > 0 && (
            <span className="mx-1.5 text-soft-white/15 select-none">/</span>
          )}
          <button
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider transition-colors duration-200",
              locale === code
                ? "text-soft-white"
                : "text-soft-white/30 hover:text-soft-white/55",
            )}
            aria-pressed={locale === code}
            aria-label={code === "es" ? t("common.spanish") : t("common.english")}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
