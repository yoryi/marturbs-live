"use client";

import { useState } from "react";
import { Calendar, User } from "lucide-react";
import {
  EARNINGS_BY_CLIENT,
  EARNINGS_TOTALS,
  type EarningsPeriod,
} from "@/data/model-earnings";
import { useI18n } from "@/lib/i18n/context";
import { formatCop } from "@/lib/payout-settings";
import { cn } from "@/lib/utils";

const PERIODS: EarningsPeriod[] = ["today", "yesterday", "week", "month"];

export function EarningsByClient() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<EarningsPeriod>("today");

  const periodLabels: Record<EarningsPeriod, string> = {
    today: t("modelPanel.periodToday"),
    yesterday: t("modelPanel.periodYesterday"),
    week: t("modelPanel.periodWeek"),
    month: t("modelPanel.periodMonth"),
  };

  const clients = EARNINGS_BY_CLIENT[period];
  const total = EARNINGS_TOTALS[period];

  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-pink" />
            {t("modelPanel.earningsByClient")}
          </h3>
          <p className="text-sm text-soft-white/50 mt-1">
            {t("modelPanel.earningsByClientHint")}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-soft-white/40">{periodLabels[period]}</p>
          <p className="text-2xl font-bold text-gold">{formatCop(total)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              period === p
                ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/40"
                : "bg-white/5 text-soft-white/50 hover:text-soft-white border border-transparent",
            )}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-bg-main/50">
        <div>
          <p className="text-xs text-soft-white/40">{t("modelPanel.totalCollected")}</p>
          <p className="font-bold text-gold">{formatCop(total)}</p>
        </div>
        <div>
          <p className="text-xs text-soft-white/40">{t("modelPanel.clientsCount")}</p>
          <p className="font-bold text-soft-white">{clients.length}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-soft-white/40">{t("modelPanel.sessionsLabel")}</p>
          <p className="font-bold text-soft-white">{clients.length}</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <p className="text-center text-soft-white/40 py-8">{t("modelPanel.noEarningsPeriod")}</p>
      ) : (
        <ul className="space-y-3">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-bg-main/60 border border-white/5 hover:border-neon-pink/20 transition-colors"
            >
              <img
                src={c.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-soft-white flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-soft-white/40" />
                  {c.client}
                </p>
                <p className="text-xs text-soft-white/40 mt-0.5">
                  {c.duration} · {c.time}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-soft-white/40">{t("modelPanel.collected")}</p>
                <p className="font-bold text-gold text-lg">+{formatCop(c.earned)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
