"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
      <motion.div
        initial={false}
        className="w-full max-w-md glass rounded-2xl p-8 gradient-border"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-soft-white/50 hover:text-neon-pink mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("auth.backLogin")}
        </Link>

        {sent ? (
          <div className="text-center">
            <Mail className="w-12 h-12 text-neon-pink mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("auth.recoverSent")}</h2>
            <p className="text-soft-white/50 text-sm">
              {t("auth.recoverSentDetail", { email })}
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)] mb-2">
              {t("auth.recoverTitle")}
            </h1>
            <p className="text-soft-white/50 text-sm mb-6">
              {t("auth.recoverSubtitle")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <Input
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                {t("auth.sendLink")}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
