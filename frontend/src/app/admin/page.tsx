"use client";

import { motion } from "framer-motion";
import {
  Users,
  Sparkles,
  Video,
  DollarSign,
  Activity,
} from "lucide-react";
import { ADMIN_STATS } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-20">
        <p className="text-soft-white/50 mb-4">{t("admin.restricted")}</p>
        <Link href="/login">
          <Button>{t("admin.loginBtn")}</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: t("admin.totalUsers"),
      value: ADMIN_STATS.totalUsers.toLocaleString(),
      color: "text-neon-pink",
    },
    {
      icon: Sparkles,
      label: t("admin.totalModels"),
      value: ADMIN_STATS.totalModels.toString(),
      color: "text-neon-purple",
    },
    {
      icon: Video,
      label: t("admin.activeSessionsCount"),
      value: ADMIN_STATS.activeSessions.toString(),
      color: "text-emerald-400",
    },
    {
      icon: Activity,
      label: t("admin.onlineModels"),
      value: ADMIN_STATS.onlineModels.toString(),
      color: "text-gold",
    },
    {
      icon: DollarSign,
      label: t("admin.revenueToday"),
      value: `$${ADMIN_STATS.revenueToday.toLocaleString()}`,
      color: "text-gold",
    },
    {
      icon: DollarSign,
      label: t("admin.revenueMonth"),
      value: `$${ADMIN_STATS.revenueMonth.toLocaleString()}`,
      color: "text-neon-pink",
    },
  ];

  const mockUsers = [
    { id: "1", email: "demo@marturbs.live", role: "client" as const, status: "active" },
    { id: "2", email: "model@marturbs.live", role: "model" as const, status: "active" },
    { id: "3", email: "user3@test.com", role: "client" as const, status: "active" },
  ];

  const activeSessions = [
    t("admin.session1"),
    t("admin.session2"),
    t("admin.session3"),
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] mb-2">
        {t("admin.title")}{" "}
        <span className="text-neon-purple">{t("admin.titleHighlight")}</span>
      </h1>
      <p className="text-soft-white/50 mb-10">{t("admin.subtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={false}
            className="glass rounded-2xl p-6"
          >
            <s.icon className={cn("w-6 h-6 mb-3", s.color)} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-soft-white/50">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4">{t("admin.recentUsers")}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-soft-white/50 border-b border-white/5">
                <th className="text-left py-2">{t("admin.email")}</th>
                <th className="text-left py-2">{t("admin.role")}</th>
                <th className="text-right py-2">{t("admin.state")}</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{t(`roles.${u.role}`)}</td>
                  <td className="py-3 text-right text-emerald-400">
                    {t("tx.completed")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4">{t("admin.activeSessions")}</h2>
          <ul className="space-y-3 text-sm">
            {activeSessions.map((s) => (
              <li
                key={s}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
