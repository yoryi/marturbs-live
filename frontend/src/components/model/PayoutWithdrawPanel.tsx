"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import {
  calculateWithdrawalPreview,
  fetchWithdrawalPreview,
  requestWithdrawal,
  type WithdrawalPreview,
} from "@/lib/api/payout";
import {
  DEFAULT_PAYOUT,
  formatCop,
  loadPayoutSettings,
  sanitizePayout,
  savePayoutSettings,
  type BankName,
  type CryptoNetwork,
  type PayoutMethod,
  type PayoutSettings,
} from "@/lib/payout-settings";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MIN_WITHDRAW = 10_000;
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

const labelClass =
  "block text-xs font-medium text-soft-white/60 mb-1.5 leading-none";
const controlClass =
  "w-full h-10 px-3 rounded-lg text-sm glass text-soft-white placeholder:text-soft-white/30 border border-white/5 focus:border-neon-pink/50 focus:outline-none focus:ring-2 focus:ring-neon-pink/20 transition-colors";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0 flex flex-col", className)}>
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  );
}

function parseAmountInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function PayoutWithdrawPanel() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [form, setForm] = useState<PayoutSettings>(DEFAULT_PAYOUT);
  const [payoutSaved, setPayoutSaved] = useState(false);
  const [base, setBase] = useState<WithdrawalPreview | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchWithdrawalPreview();
    setBase(data);
    if (user?.id) setForm(loadPayoutSettings(user.id));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof PayoutSettings>(
    key: K,
    value: PayoutSettings[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setPayoutSaved(false);
  };

  const setMethod = (method: PayoutMethod) => {
    setForm((prev) => sanitizePayout({ ...prev, method }));
    setPayoutSaved(false);
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

  const amount = parseAmountInput(amountInput);

  const preview = useMemo(() => {
    if (!base) return null;
    if (amount <= 0) {
      return { ...base, grossAmount: 0, platformFeeAmount: 0, netAmount: 0 };
    }
    return calculateWithdrawalPreview(base.availableBalance, amount, base);
  }, [base, amount]);

  const amountError = useMemo(() => {
    if (!amountInput.trim()) return null;
    if (amount <= 0) return t("modelPanel.withdrawAmountInvalid");
    if (amount < MIN_WITHDRAW)
      return t("modelPanel.withdrawAmountMin", { min: formatCop(MIN_WITHDRAW) });
    if (base && amount > base.availableBalance)
      return t("modelPanel.withdrawAmountExceeded");
    return null;
  }, [amountInput, amount, base, t]);

  const hasPayoutAccount =
    !!form.holderName?.trim() &&
    (form.method === "bank"
      ? !!form.accountNumber?.trim()
      : !!form.walletAddress?.trim());

  const canWithdraw =
    !!preview &&
    amount >= MIN_WITHDRAW &&
    amount <= (base?.availableBalance ?? 0) &&
    !amountError &&
    hasPayoutAccount;

  const savePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    savePayoutSettings(user.id, sanitizePayout(form));
    setPayoutSaved(true);
    setTimeout(() => setPayoutSaved(false), 2500);
  };

  const handleWithdraw = async () => {
    if (!preview || !canWithdraw) return;
    setSubmitting(true);
    setWithdrawError(null);
    setWithdrawSuccess(null);
    const result = await requestWithdrawal(amount);
    setSubmitting(false);
    if (!result) {
      setWithdrawError(t("modelPanel.withdrawError"));
      return;
    }
    const days =
      preview.processingDaysMin === preview.processingDaysMax
        ? String(preview.processingDaysMin)
        : `${preview.processingDaysMin}–${preview.processingDaysMax}`;
    setWithdrawSuccess(
      t("modelPanel.withdrawSuccess", {
        net: formatCop(result.netAmount),
        days,
      }),
    );
    setAmountInput("");
    await load();
  };

  if (loading || !base || !preview) {
    return (
      <div className="glass rounded-2xl p-5 border border-white/5 animate-pulse h-40" />
    );
  }

  const daysLabel =
    preview.processingDaysMin === preview.processingDaysMax
      ? String(preview.processingDaysMin)
      : `${preview.processingDaysMin}–${preview.processingDaysMax}`;

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/5">
        <h3 className="font-semibold text-soft-white">
          {t("modelPanel.payoutWithdrawTitle")}
        </h3>
        <div className="text-right">
          <p className="text-[11px] text-soft-white/40 uppercase tracking-wide">
            {t("modelPanel.withdrawAvailable")}
          </p>
          <p className="text-lg font-bold text-gold tabular-nums">
            {formatCop(base.availableBalance)}
          </p>
        </div>
      </div>

      <form onSubmit={savePayout} className="px-5 py-4 space-y-3 border-b border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <Field label={t("modelPanel.payoutMethod")} className="md:col-span-3">
            <select
              value={form.method}
              onChange={(e) => setMethod(e.target.value as PayoutMethod)}
              className={controlClass}
            >
              <option value="bank" className="bg-bg-card">
                {t("modelPanel.methodBank")}
              </option>
              <option value="crypto" className="bg-bg-card">
                {t("modelPanel.methodCrypto")}
              </option>
            </select>
          </Field>
          <Field label={t("modelPanel.holderName")} className="md:col-span-5">
            <input
              value={form.holderName}
              onChange={(e) => update("holderName", e.target.value)}
              placeholder={t("modelPanel.holderNamePlaceholder")}
              required
              className={controlClass}
            />
          </Field>
          <Field label={t("modelPanel.documentId")} className="md:col-span-4">
            <input
              value={form.documentId}
              onChange={(e) => update("documentId", e.target.value)}
              placeholder="CC / CE"
              required
              className={controlClass}
            />
          </Field>
        </div>

        {form.method === "crypto" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <Field label={t("modelPanel.cryptoNetwork")} className="md:col-span-4">
              <select
                value={form.cryptoNetwork}
                onChange={(e) =>
                  update("cryptoNetwork", e.target.value as CryptoNetwork)
                }
                className={controlClass}
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
            </Field>
            <Field label={t("modelPanel.walletAddress")} className="md:col-span-8">
              <input
                value={form.walletAddress}
                onChange={(e) => update("walletAddress", e.target.value)}
                placeholder={t("modelPanel.walletPlaceholder")}
                required
                className={controlClass}
              />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <Field label={t("modelPanel.bankName")} className="md:col-span-4">
              <select
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value as BankName)}
                className={controlClass}
              >
                {BANK_OPTIONS.map((b) => (
                  <option key={b} value={b} className="bg-bg-card">
                    {bankLabels[b]}
                  </option>
                ))}
              </select>
            </Field>
            {form.bankName === "other" ? (
              <Field
                label={t("modelPanel.bankNameOther")}
                className="md:col-span-4"
              >
                <input
                  value={form.bankNameOther}
                  onChange={(e) => update("bankNameOther", e.target.value)}
                  placeholder={t("modelPanel.bankNameOtherPlaceholder")}
                  required
                  className={controlClass}
                />
              </Field>
            ) : (
              <Field label={t("modelPanel.accountType")} className="md:col-span-4">
                <div className="flex h-10 gap-2">
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
                        "flex-1 h-full rounded-lg text-xs font-medium border transition-colors",
                        form.accountType === id
                          ? "border-neon-pink/40 bg-neon-pink/10 text-neon-pink"
                          : "border-white/10 text-soft-white/45 hover:border-white/20",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            <Field label={t("modelPanel.accountNumber")} className="md:col-span-4">
              <input
                value={form.accountNumber}
                onChange={(e) => update("accountNumber", e.target.value)}
                placeholder={
                  form.bankName === "nequi" ? "300 123 4567" : "Nº cuenta"
                }
                required
                className={controlClass}
              />
            </Field>
          </div>
        )}

        <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
          {payoutSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {t("modelPanel.payoutSaved")}
            </>
          ) : (
            t("modelPanel.savePayout")
          )}
        </Button>
      </form>

      <div className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <Field
            label={t("modelPanel.withdrawAmountLabel")}
            className="md:col-span-9"
          >
            <input
              id="withdraw-amount"
              type="text"
              inputMode="numeric"
              placeholder={t("modelPanel.withdrawAmountPlaceholder")}
              value={amountInput}
              onChange={(e) => {
                setWithdrawSuccess(null);
                setWithdrawError(null);
                setAmountInput(e.target.value);
              }}
              className={cn(controlClass, amountError && "border-red-500/50")}
            />
            {amountError && (
              <p className="text-xs text-red-400 mt-1">{amountError}</p>
            )}
          </Field>
          <button
            type="button"
            className="md:col-span-3 h-10 text-xs text-neon-pink hover:underline text-left md:text-right self-end"
            onClick={() => {
              setWithdrawSuccess(null);
              setAmountInput(String(base.availableBalance));
            }}
          >
            {t("modelPanel.withdrawAll")}
          </button>
        </div>

        {amount > 0 && !amountError && (
          <p className="text-xs text-soft-white/55">
            {t("modelPanel.withdrawSummary", {
              net: formatCop(preview.netAmount),
              percent: String(preview.platformFeePercent),
              days: daysLabel,
            })}
          </p>
        )}

        {!hasPayoutAccount && (
          <p className="text-xs text-amber-400/90">{t("modelPanel.withdrawNeedPayout")}</p>
        )}
        {withdrawError && (
          <p className="text-xs text-red-400">{withdrawError}</p>
        )}
        {withdrawSuccess && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {withdrawSuccess}
          </p>
        )}

        <Button
          className="w-full"
          size="sm"
          disabled={
            submitting || !canWithdraw || base.availableBalance <= 0 || !!withdrawSuccess
          }
          onClick={handleWithdraw}
        >
          {submitting
            ? t("modelPanel.withdrawProcessing")
            : t("modelPanel.withdrawCta")}
        </Button>
      </div>
    </div>
  );
}
