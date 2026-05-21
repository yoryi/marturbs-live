"use client";

import { motion } from "framer-motion";
import { Clock, Loader2, X } from "lucide-react";
import type { Model } from "@/data/mock";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";

interface CallWaitingScreenProps {
  model: Model;
  position?: number;
  onCancel: () => void;
}

export function CallWaitingScreen({
  model,
  position = 1,
  onCancel,
}: CallWaitingScreenProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6 text-center">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${model.cover})` }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md"
      >
        <div className="w-20 h-20 mx-auto rounded-full border-2 border-neon-pink/50 flex items-center justify-center mb-6">
          <Loader2 className="w-10 h-10 text-neon-pink animate-spin" />
        </div>

        <h1 className="text-2xl font-bold text-soft-white mb-2">
          {t("call.waitingQueue", { name: model.name })}
        </h1>
        <p className="text-soft-white/60 text-sm mb-6">{t("call.waitingQueueHint")}</p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-soft-white/80 mb-8">
          <Clock className="w-4 h-4 text-neon-pink" />
          {position > 1
            ? t("call.queuePosition", { n: position })
            : t("call.queueNext")}
        </div>

        <Button variant="secondary" onClick={onCancel} className="gap-2">
          <X className="w-4 h-4" />
          {t("call.cancelRequest")}
        </Button>
      </motion.div>
    </div>
  );
}
