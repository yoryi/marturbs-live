"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/layout/UserMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();
  const showClientNav = user?.role === "client";

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/models", label: t("nav.models") },
    { href: "/credits", label: t("nav.credits") },
  ];

  return (
    <motion.header
      initial={false}
      className="sticky top-0 z-50 bg-bg-main/90 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "items-center h-16 lg:h-[72px] gap-4",
            showClientNav
              ? "grid grid-cols-[1fr_auto_1fr]"
              : "flex justify-between",
          )}
        >
          <Link href="/" className={showClientNav ? "justify-self-start" : undefined}>
            <span className="text-xl lg:text-2xl font-bold font-[family-name:var(--font-syne)]">
              <span className="text-neon-pink">MARTURBS</span>
              <span className="text-neon-purple"> LIVE</span>
            </span>
          </Link>

          {showClientNav && (
            <nav className="hidden md:flex items-center gap-1 justify-self-center">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === href
                      ? "text-neon-pink bg-neon-pink/10"
                      : "text-soft-white/60 hover:text-soft-white",
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <div
            className={cn(
              "flex items-center gap-3 sm:gap-4",
              showClientNav && "justify-self-end",
            )}
          >
            {user ? (
              <>
                {user.role === "client" && (
                  <Link href="/credits">
                    <Button size="sm" className="shadow-[0_0_20px_#ff2d8e50]">
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("nav.recharge")}</span>
                    </Button>
                  </Link>
                )}
                <UserMenu />
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">{t("nav.login")}</Button>
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
