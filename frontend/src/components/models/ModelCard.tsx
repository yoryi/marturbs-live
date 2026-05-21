"use client";

import { Star } from "lucide-react";
import type { Model } from "@/data/mock";
import { formatPricePerMinute } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n/context";
import { StartCallButton } from "@/components/models/StartCallButton";

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  const { t, locale } = useI18n();

  return (
    <article className="group">
      <div className="flex gap-4 p-3 rounded-2xl bg-bg-card border border-white/10 hover:border-neon-pink/40 hover:shadow-[0_0_24px_#ff2d8e30] transition-all duration-300">
        <div className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-bg-main">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={model.avatar}
            alt={model.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {model.isOnline && (
            <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-[10px] font-bold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {t("models.onlineBadge")}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-bold text-soft-white text-lg truncate">
            {model.name}
          </h3>
          <p className="text-neon-pink font-semibold text-sm mt-0.5">
            {formatPricePerMinute(model.pricePerMinute, locale)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-sm font-medium text-gold">{model.rating}</span>
            <span className="text-xs text-soft-white/50">
              ({model.reviewCount})
            </span>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <StartCallButton model={model} />
        </div>
      </div>
    </article>
  );
}
