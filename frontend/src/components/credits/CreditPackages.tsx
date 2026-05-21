"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { CREDIT_PACKAGES } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { cn, formatCredits } from "@/lib/utils";

export function CreditPackages() {
  const { user, updateCredits } = useAuth();
  const { t } = useI18n();

  const handlePurchase = (credits: number) => {
    if (user) {
      updateCredits(user.credits + credits);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {CREDIT_PACKAGES.map((pkg, i) => (
        <motion.div
          key={pkg.id}
          initial={false}
          className={cn(
            "relative rounded-2xl p-6 glass transition-all duration-300 hover:-translate-y-2",
            pkg.popular && "gradient-border glow-pink ring-1 ring-neon-pink/30",
          )}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple text-xs font-bold">
                <Sparkles className="w-3 h-3" />
                {t("credits.popular")}
              </span>
            </div>
          )}

          <p className="text-3xl font-bold text-gold font-[family-name:var(--font-syne)]">
            {formatCredits(pkg.credits)}
          </p>
          <p className="text-sm text-soft-white/50 mb-4">
            {t("credits.creditsLabel")}
          </p>

          <p className="text-2xl font-bold text-soft-white mb-6">${pkg.price}</p>

          <ul className="space-y-2 mb-6 text-sm text-soft-white/60">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {t("credits.immediate")}
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {t("credits.noExpiry")}
            </li>
          </ul>

          <Button
            variant={pkg.popular ? "primary" : "secondary"}
            className="w-full"
            onClick={() => handlePurchase(pkg.credits)}
          >
            {t("credits.buy")}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
