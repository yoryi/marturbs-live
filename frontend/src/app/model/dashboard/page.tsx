"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Video,
  DollarSign,
  User,
  Settings,
  Power,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EarningsChart } from "@/components/model/EarningsChart";
import { IncomingCallRequests } from "@/components/model/IncomingCallRequests";
import { cn, formatCredits } from "@/lib/utils";
import { formatPricePerMinute } from "@/lib/pricing";

const mockSessions = [
  {
    id: "1",
    client: "Alex P.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    duration: "12:34",
    earned: 148,
  },
  {
    id: "2",
    client: "Marco R.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    duration: "08:12",
    earned: 98,
  },
];

export default function ModelDashboardPage() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [activeNav, setActiveNav] = useState("summary");
  const [isOnline, setIsOnline] = useState(true);
  const [pricePerMinute, setPricePerMinute] = useState(12);

  const nav = useMemo(
    () => [
      { id: "summary", label: t("modelPanel.navSummary"), icon: LayoutDashboard },
      { id: "sessions", label: t("modelPanel.navSessions"), icon: Video },
      { id: "earnings", label: t("modelPanel.navEarnings"), icon: DollarSign },
      { id: "profile", label: t("modelPanel.navProfile"), icon: User },
      { id: "settings", label: t("modelPanel.navSettings"), icon: Settings },
    ],
    [t],
  );

  const stats = useMemo(
    () => [
      { label: t("modelPanel.earningsToday"), value: "$124.000", sub: t("modelPanel.statSubCop") },
      { label: t("modelPanel.sessionsToday"), value: "7", sub: t("modelPanel.statSubCalls") },
      { label: t("modelPanel.timeOnline"), value: "4h 12m", sub: t("modelPanel.statSubToday") },
    ],
    [t],
  );

  if (!user || user.role !== "model") {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-soft-white/50 mb-4">{t("modelPanel.clientsOnly")}</p>
        <Link href="/login">
          <Button>{t("auth.signIn")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-bg-card/50 p-6">
        <div className="flex items-center gap-3 mb-8">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover ring-2 ring-neon-pink/50"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-neon-pink/20" />
          )}
          <div>
            <p className="font-bold text-soft-white">{user.name}</p>
            <p
              className={cn(
                "text-xs font-medium",
                isOnline ? "text-emerald-400" : "text-soft-white/40",
              )}
            >
              {isOnline ? t("modelPanel.statusOnline") : t("modelPanel.statusOffline")}
            </p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                activeNav === id
                  ? "bg-neon-pink/15 text-neon-pink"
                  : "text-soft-white/50 hover:text-soft-white hover:bg-white/5",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-6 lg:p-10 overflow-auto">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)] mb-8 lg:hidden">
          {t("modelPanel.mobileTitle")}
        </h1>

        {/* Nav móvil */}
        <div className="flex lg:hidden gap-2 overflow-x-auto mb-6 pb-2">
          {nav.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                activeNav === id
                  ? "bg-neon-pink/20 text-neon-pink"
                  : "bg-white/5 text-soft-white/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {activeNav === "sessions" && (
          <div className="space-y-8 max-w-3xl">
            <div className="glass rounded-2xl p-6 border border-white/5">
              <p className="text-sm text-soft-white/50 mb-4">{t("modelPanel.status")}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {isOnline ? t("modelPanel.visible") : t("modelPanel.notVisible")}
                </span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={cn(
                    "relative w-14 h-8 rounded-full transition-colors",
                    isOnline ? "bg-emerald-500" : "bg-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all",
                      isOnline ? "left-7" : "left-1",
                    )}
                  />
                </button>
              </div>
            </div>
            <IncomingCallRequests isOnline={isOnline} />
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="font-semibold mb-4">{t("modelPanel.recentSessions")}</h3>
              <ul className="space-y-3">
                {mockSessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-bg-main/50"
                  >
                    <img src={s.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{s.client}</p>
                      <p className="text-xs text-soft-white/40">{s.duration}</p>
                    </div>
                    <span className="text-gold font-bold">+{formatCredits(s.earned)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeNav === "summary" && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="glass rounded-2xl p-6 border border-white/5">
                <p className="text-sm text-soft-white/50 mb-4">{t("modelPanel.status")}</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {isOnline ? t("modelPanel.visible") : t("modelPanel.notVisible")}
                  </span>
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={cn(
                      "relative w-14 h-8 rounded-full transition-colors",
                      isOnline ? "bg-emerald-500" : "bg-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all",
                        isOnline ? "left-7" : "left-1",
                      )}
                    />
                  </button>
                </div>
                <p className="text-xs text-soft-white/40 mt-3 flex items-center gap-1">
                  <Power className="w-3 h-3" />
                  {t("modelPanel.activate")}
                </p>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/5">
                <Input
                  label={t("modelPanel.priceLabel")}
                  type="number"
                  value={pricePerMinute}
                  onChange={(e) => setPricePerMinute(Number(e.target.value))}
                  min={5}
                  max={50}
                />
                <p className="text-sm text-neon-pink mt-2">
                  {formatPricePerMinute(pricePerMinute, locale)}
                </p>
                <Button className="w-full mt-4" size="sm">
                  {t("modelPanel.savePrice")}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-sm text-soft-white/50">{s.label}</p>
                  <p className="text-3xl font-bold text-soft-white mt-2">{s.value}</p>
                  <p className="text-xs text-soft-white/40">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <EarningsChart />
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="font-semibold mb-6">{t("modelPanel.recentSessions")}</h3>
                <ul className="space-y-4">
                  {mockSessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-bg-main/50"
                    >
                      <img src={s.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-soft-white">{s.client}</p>
                        <p className="text-xs text-soft-white/40">{s.duration}</p>
                      </div>
                      <span className="text-gold font-bold">+{formatCredits(s.earned)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {activeNav === "earnings" && (
          <div className="max-w-2xl">
            <EarningsChart />
          </div>
        )}

        {(activeNav === "profile" || activeNav === "settings") && (
          <div className="glass rounded-2xl p-8 border border-white/5 text-center text-soft-white/50">
            {t("modelPanel.comingSoon")}
          </div>
        )}
      </div>
    </div>
  );
}
