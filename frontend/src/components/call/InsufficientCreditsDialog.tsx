"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";
import { formatCredits } from "@/lib/utils";

interface InsufficientCreditsDialogProps {
  open: boolean;
  onClose: () => void;
  credits?: number;
  modelName?: string;
}

export function InsufficientCreditsDialog({
  open,
  onClose,
  credits = 0,
  modelName,
}: InsufficientCreditsDialogProps) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label={t("common.close")}
            onClick={onClose}
          />
          <motion.div
            role="alertdialog"
            aria-labelledby="no-credits-title"
            aria-describedby="no-credits-desc"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-md rounded-2xl border border-neon-pink/30 bg-bg-card p-6 shadow-[0_0_40px_#ff2d8e40]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-soft-white/40 hover:text-soft-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neon-pink/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-neon-pink" />
              </div>
              <div>
                <h2
                  id="no-credits-title"
                  className="text-lg font-bold text-soft-white pr-8"
                >
                  {t("call.noCreditsTitle")}
                </h2>
                <p id="no-credits-desc" className="text-sm text-soft-white/60 mt-2">
                  {modelName
                    ? t("call.insufficientCreditsFor", { name: modelName })
                    : t("call.insufficientCredits")}
                </p>
                <p className="text-xs text-gold mt-3 font-medium">
                  {t("call.yourBalance", { n: formatCredits(credits) })}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link href="/credits" className="flex-1" onClick={onClose}>
                <Button className="w-full">{t("call.rechargeToCall")}</Button>
              </Link>
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                {t("common.close")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
