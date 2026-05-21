"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Users, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getDashboardPath } from "@/lib/routes";
import { useI18n } from "@/lib/i18n/context";
import type { UserRole } from "@/data/mock";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useI18n();
  const [role, setRole] = useState<"client" | "model">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await register({ email, password, name, role });
    setLoading(false);
    if (ok) router.push(getDashboardPath(role as UserRole));
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)]">
            {t("auth.join")} <span className="text-neon-pink">MARTURBS</span>
          </h1>
          <p className="text-soft-white/50 mt-2">{t("auth.createAccount")}</p>
        </div>

        <div className="flex gap-4 mb-6">
          {(["client", "model"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border transition-all",
                role === r
                  ? "border-neon-pink bg-neon-pink/10 text-neon-pink glow-pink"
                  : "border-white/10 glass text-soft-white/50",
              )}
            >
              {r === "client" ? (
                <Users className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {r === "client" ? t("auth.client") : t("auth.model")}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 gradient-border space-y-5"
        >
          <Input
            label={t("auth.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
          <Input
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="text-xs text-soft-white/40">
            {t("auth.ageConfirm")}
          </p>
          <Button type="submit" className="w-full" disabled={loading}>
            <UserPlus className="w-4 h-4" />
            {loading ? t("auth.creating") : t("auth.create")}
          </Button>
          <p className="text-center text-sm text-soft-white/50">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="text-neon-pink hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
