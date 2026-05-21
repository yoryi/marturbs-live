"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { CreditPackages } from "@/components/credits/CreditPackages";
import { ClientOnlyGuard } from "@/components/auth/ClientOnlyGuard";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { MOCK_TRANSACTIONS } from "@/data/mock";
import { formatCredits } from "@/lib/utils";

export default function CreditsPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <ClientOnlyGuard>
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold font-[family-name:var(--font-syne)]">
          {t("credits.title")}{" "}
          <span className="text-gold">{t("credits.titleHighlight")}</span>
        </h1>
        <p className="text-soft-white/50 mt-2 max-w-xl mx-auto">
          {t("credits.subtitle")}
        </p>
        {user && (
          <div className="inline-flex items-center gap-3 mt-6 px-6 py-3 rounded-2xl glass border border-gold/30 glow-gold">
            <Coins className="w-6 h-6 text-gold" />
            <span className="text-lg">
              {t("credits.balance")}{" "}
              <strong className="text-gold text-2xl">
                {formatCredits(user.credits)}
              </strong>{" "}
              {t("credits.creditsLabel")}
            </span>
          </div>
        )}
      </motion.div>

      <CreditPackages />

      <section className="mt-16">
        <h2 className="text-xl font-bold mb-6">{t("credits.history")}</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-soft-white/50">
                <th className="text-left p-4">{t("credits.date")}</th>
                <th className="text-left p-4">{t("credits.type")}</th>
                <th className="text-right p-4">{t("credits.creditsLabel")}</th>
                <th className="text-right p-4">{t("credits.status")}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-4">{tx.date}</td>
                  <td className="p-4 capitalize">
                    {t(`tx.${tx.type}` as "tx.purchase" | "tx.call")}
                  </td>
                  <td
                    className={`p-4 text-right font-medium ${(tx.credits ?? 0) > 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {(tx.credits ?? 0) > 0 ? "+" : ""}
                    {tx.credits}
                  </td>
                  <td className="p-4 text-right text-emerald-400">
                    {t("tx.completed")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </ClientOnlyGuard>
  );
}
