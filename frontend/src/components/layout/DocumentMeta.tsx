"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

export function DocumentMeta() {
  const { locale, t } = useI18n();

  useEffect(() => {
    document.title = t("meta.title");
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.description"));
  }, [locale, t]);

  return null;
}
