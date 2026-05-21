"use client";

import { Shield, BadgeCheck, Headphones, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function TrustBar() {
  const { t } = useI18n();

  const items = [
    { icon: Shield, label: t("trust.secure") },
    { icon: BadgeCheck, label: t("trust.verified") },
    { icon: Headphones, label: t("trust.support") },
    { icon: Lock, label: t("trust.privacy") },
  ];

  return (
    <section className="relative z-10 border-y border-white/5 bg-bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3 text-soft-white/60"
            >
              <div className="p-2 rounded-lg bg-neon-pink/10">
                <Icon className="w-5 h-5 text-neon-pink" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
