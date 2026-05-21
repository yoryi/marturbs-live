"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { MOCK_TRANSACTIONS } from "@/data/mock";
import { formatCredits } from "@/lib/utils";
import { Coins, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-soft-white/50 mb-4">{t("profile.loginRequired")}</p>
        <Link href="/login">
          <Button>{t("nav.login")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="glass rounded-2xl p-8 gradient-border text-center mb-8">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-24 h-24 rounded-full mx-auto ring-4 ring-neon-pink/50 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
        )}
        <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
        <p className="text-soft-white/50">{user.email}</p>
        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-neon-purple/20 text-neon-purple capitalize">
          {t(`roles.${user.role}` as "roles.client" | "roles.model" | "roles.admin")}
        </span>
        {user.role === "client" && (
          <div className="mt-6 flex items-center justify-center gap-2 text-gold">
            <Coins className="w-5 h-5" />
            <span className="text-2xl font-bold">
              {formatCredits(user.credits)} {t("credits.creditsLabel")}
            </span>
          </div>
        )}
      </div>

      <Button
        variant="danger"
        className="w-full mb-8"
        onClick={() => {
          logout();
          router.push("/login");
        }}
      >
        <LogOut className="w-4 h-4" />
        {t("profile.logout")}
      </Button>

      <h2 className="font-bold mb-4">{t("profile.recentActivity")}</h2>
      <ul className="space-y-2">
        {MOCK_TRANSACTIONS.slice(0, 3).map((tx) => (
          <li
            key={tx.id}
            className="flex justify-between p-4 rounded-xl glass text-sm"
          >
            <span className="capitalize">
              {t(`tx.${tx.type}` as "tx.purchase" | "tx.call")}
            </span>
            <span className="text-soft-white/50">{tx.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
