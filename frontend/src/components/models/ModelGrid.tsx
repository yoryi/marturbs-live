"use client";

import type { Model } from "@/data/mock";
import { useI18n } from "@/lib/i18n/context";
import { ModelCard } from "./ModelCard";

interface ModelGridProps {
  models: Model[];
  title?: string;
  showOnlineOnly?: boolean;
}

export function ModelGrid({
  models,
  title,
  showOnlineOnly = true,
}: ModelGridProps) {
  const { t } = useI18n();
  const displayTitle = title ?? t("models.online");

  const filtered = showOnlineOnly
    ? models.filter((m) => m.isOnline)
    : models;

  return (
    <section className="relative z-10 py-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-syne)] text-soft-white">
            {displayTitle}
          </h2>
          <div className="hidden md:flex items-center gap-2 text-sm text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {models.filter((m) => m.isOnline).length} {t("models.onlineCount")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </section>
  );
}
