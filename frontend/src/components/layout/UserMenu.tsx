"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { cn, formatCredits } from "@/lib/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const profileHref =
    user.role === "model"
      ? "/model/dashboard"
      : user.role === "admin"
        ? "/admin"
        : "/profile";

  const profileLabel =
    user.role === "model"
      ? t("userMenu.panel")
      : user.role === "admin"
        ? t("userMenu.admin")
        : t("userMenu.profile");

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-9 h-9 rounded-full object-cover ring-2 ring-neon-pink/40"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-soft-white leading-tight max-w-[120px] truncate">
            {user.name}
          </p>
          {user.role === "client" && (
            <p className="text-xs text-gold font-semibold">
              {formatCredits(user.credits)} cr.
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-soft-white/50 transition-transform hidden sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 py-2 rounded-xl glass border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50"
        >
          <div className="px-4 py-2 border-b border-white/5 sm:hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-soft-white/50 truncate">{user.email}</p>
          </div>

          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-soft-white/80 hover:text-soft-white hover:bg-white/5 transition-colors"
          >
            {user.role === "admin" ? (
              <LayoutDashboard className="w-4 h-4 text-neon-purple" />
            ) : (
              <User className="w-4 h-4 text-neon-pink" />
            )}
            {profileLabel}
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("userMenu.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
