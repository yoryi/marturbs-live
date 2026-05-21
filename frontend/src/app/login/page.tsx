"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDashboardPath } from "@/lib/routes";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("demo@marturbs.live");
  const [password, setPassword] = useState("demo1234");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const loggedUser = await login(email, password);
    setLoading(false);
    if (loggedUser) {
      router.push(getDashboardPath(loggedUser.role));
    } else {
      setError(t("auth.invalidCredentials"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-glow-pink">
            {t("auth.welcome")}
          </h1>
          <p className="text-soft-white/50 mt-2">
            {t("auth.loginSubtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 gradient-border space-y-5"
        >
          <Input
            id="email"
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
          <div className="relative">
            <Input
              id="password"
              label={t("auth.password")}
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-[38px] text-soft-white/40"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-neon-pink hover:underline"
            >
              {t("auth.forgot")}
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Lock className="w-4 h-4" />
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </Button>

          <p className="text-center text-sm text-soft-white/50">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-neon-pink hover:underline">
              {t("auth.register")}
            </Link>
          </p>

          <div className="pt-4 border-t border-white/5 text-xs text-soft-white/30 space-y-1">
            <p className="flex items-center gap-2">
              <Mail className="w-3 h-3" /> demo@marturbs.live / demo1234
            </p>
            <p>model@marturbs.live · admin@marturbs.live</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
