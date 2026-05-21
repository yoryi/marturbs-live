"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  DEFAULT_PAYOUT,
  loadPayoutSettings,
  sanitizePayout,
  savePayoutSettings,
  type BankName,
  type CryptoNetwork,
  type PayoutMethod,
  type PayoutSettings,
} from "@/lib/payout-settings";
import { cn } from "@/lib/utils";

const BANK_OPTIONS: BankName[] = [
  "nequi",
  "bancolombia",
  "davivienda",
  "bogota",
  "bbva",
  "occidente",
  "popular",
  "other",
];

const CRYPTO_NETWORKS: CryptoNetwork[] = ["trc20", "erc20", "bep20"];

export function PayoutSettingsForm() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState<PayoutSettings>(DEFAULT_PAYOUT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.id) setForm(loadPayoutSettings(user.id));
  }, [user?.id]);

  const update = <K extends keyof PayoutSettings>(key: K, value: PayoutSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const setMethod = (method: PayoutMethod) => {
    setForm((prev) => sanitizePayout({ ...prev, method }));
    setSaved(false);
  };

  const bankLabels: Record<BankName, string> = {
    nequi: t("modelPanel.bankNequi"),
    bancolombia: t("modelPanel.bankBancolombia"),
    davivienda: t("modelPanel.bankDavivienda"),
    bogota: t("modelPanel.bankBogota"),
    bbva: t("modelPanel.bankBbva"),
    occidente: t("modelPanel.bankOccidente"),
    popular: t("modelPanel.bankPopular"),
    other: t("modelPanel.bankOther"),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    savePayoutSettings(user.id, sanitizePayout(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-white/5">
      <h3 className="font-semibold text-lg mb-1">{t("modelPanel.payoutTitle")}</h3>
      <p className="text-sm text-soft-white/50 mb-6">{t("modelPanel.payoutSubtitle")}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-soft-white/70 mb-2">
          {t("modelPanel.payoutMethod")}
        </label>
        <select
          value={form.method}
          onChange={(e) => setMethod(e.target.value as PayoutMethod)}
          className="w-full px-4 py-3 rounded-xl glass text-soft-white border border-white/5 focus:border-neon-pink/50 focus:outline-none focus:ring-2 focus:ring-neon-pink/20"
        >
          <option value="bank" className="bg-bg-card">
            {t("modelPanel.methodBank")}
          </option>
          <option value="crypto" className="bg-bg-card">
            {t("modelPanel.methodCrypto")}
          </option>
        </select>
      </div>

      <div className="space-y-4 mb-6">
        <Input
          label={t("modelPanel.holderName")}
          value={form.holderName}
          onChange={(e) => update("holderName", e.target.value)}
          placeholder={t("modelPanel.holderNamePlaceholder")}
          required
        />
        <Input
          label={t("modelPanel.documentId")}
          value={form.documentId}
          onChange={(e) => update("documentId", e.target.value)}
          placeholder="CC / CE / NIT"
          required
        />
        <Input
          label={t("modelPanel.payoutEmail")}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="email@ejemplo.com"
        />
      </div>

      {form.method === "crypto" ? (
        <div className="space-y-4 p-4 rounded-xl bg-bg-main/50 border border-neon-purple/20 mb-6">
          <p className="text-sm font-semibold text-neon-purple">
            {t("modelPanel.cryptoSection")} (USDT)
          </p>
          <div>
            <label className="block text-sm font-medium text-soft-white/70 mb-2">
              {t("modelPanel.cryptoNetwork")}
            </label>
            <select
              value={form.cryptoNetwork}
              onChange={(e) => update("cryptoNetwork", e.target.value as CryptoNetwork)}
              className="w-full px-4 py-3 rounded-xl glass text-soft-white border border-white/5 focus:border-neon-pink/50 outline-none"
            >
              {CRYPTO_NETWORKS.map((n) => (
                <option key={n} value={n} className="bg-bg-card">
                  {n === "trc20"
                    ? t("modelPanel.networkTrc20")
                    : n === "erc20"
                      ? t("modelPanel.networkErc20")
                      : t("modelPanel.networkBep20")}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t("modelPanel.walletAddress")}
            value={form.walletAddress}
            onChange={(e) => update("walletAddress", e.target.value)}
            placeholder={t("modelPanel.walletPlaceholder")}
            required
          />
        </div>
      ) : (
        <div className="space-y-4 p-4 rounded-xl bg-bg-main/50 border border-neon-pink/20 mb-6">
          <p className="text-sm font-semibold text-neon-pink">
            {t("modelPanel.bankSection")}
          </p>
          <div>
            <label className="block text-sm font-medium text-soft-white/70 mb-2">
              {t("modelPanel.bankName")}
            </label>
            <select
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value as BankName)}
              className="w-full px-4 py-3 rounded-xl glass text-soft-white border border-white/5 focus:border-neon-pink/50 outline-none"
            >
              {BANK_OPTIONS.map((b) => (
                <option key={b} value={b} className="bg-bg-card">
                  {bankLabels[b]}
                </option>
              ))}
            </select>
          </div>
          {form.bankName === "other" && (
            <Input
              label={t("modelPanel.bankNameOther")}
              value={form.bankNameOther}
              onChange={(e) => update("bankNameOther", e.target.value)}
              placeholder={t("modelPanel.bankNameOtherPlaceholder")}
              required
            />
          )}
          <div>
            <label className="block text-sm font-medium text-soft-white/70 mb-2">
              {t("modelPanel.accountType")}
            </label>
            <div className="flex gap-3">
              {(
                [
                  { id: "savings" as const, label: t("modelPanel.accountSavings") },
                  { id: "checking" as const, label: t("modelPanel.accountChecking") },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update("accountType", id)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors",
                    form.accountType === id
                      ? "border-neon-pink/50 bg-neon-pink/10 text-neon-pink"
                      : "border-white/10 text-soft-white/50",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label={t("modelPanel.accountNumber")}
            value={form.accountNumber}
            onChange={(e) => update("accountNumber", e.target.value)}
            placeholder={
              form.bankName === "nequi"
                ? "300 123 4567"
                : t("modelPanel.accountNumberPlaceholder")
            }
            required
          />
        </div>
      )}

      <Button type="submit" className="w-full gap-2">
        {saved ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            {t("modelPanel.payoutSaved")}
          </>
        ) : (
          t("modelPanel.savePayout")
        )}
      </Button>
    </form>
  );
}
