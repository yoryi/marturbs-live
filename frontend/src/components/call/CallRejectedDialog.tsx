"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

interface CallRejectedDialogProps {
  open: boolean;
  modelName: string;
  reason?: string | null;
  onClose: () => void;
}

export function CallRejectedDialog({
  open,
  modelName,
  reason,
  onClose,
}: CallRejectedDialogProps) {
  const { t } = useI18n();

  const isBusy = reason === "busy";
  const description = isBusy
    ? t("call.rejectedBusy", { name: modelName })
    : t("call.rejectedByModel", { name: modelName });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            role="alertdialog"
            aria-labelledby="call-rejected-title"
            aria-describedby="call-rejected-desc"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-bg-card p-6 shadow-[0_0_40px_#ef444440]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <PhoneOff className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2
                  id="call-rejected-title"
                  className="text-lg font-bold text-soft-white"
                >
                  {t("call.rejectedTitle")}
                </h2>
                <p
                  id="call-rejected-desc"
                  className="text-sm text-soft-white/60 mt-2"
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/" onClick={onClose}>
                <Button className="w-full">{t("call.backToHome")}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
