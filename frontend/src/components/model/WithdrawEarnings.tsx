"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Banknote,
  CheckCircle2,
  Clock,
  Percent,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import {
  calculateWithdrawalPreview,
  fetchWithdrawalPreview,
  requestWithdrawal,
  type WithdrawalPreview,
} from "@/lib/api/payout";
import {
  loadPayoutSettings,
  formatCop,
  type BankName,
  type PayoutSettings,
} from "@/lib/payout-settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const MIN_WITHDRAW = 10_000;

const BANK_LABELS: Record<BankName, string> = {
  nequi: "Nequi",
  bancolombia: "Bancolombia",
  davivienda: "Davivienda",
  bogota: "Banco de Bogotá",
  bbva: "BBVA Colombia",
  occidente: "Banco de Occidente",
  popular: "Banco Popular",
  other: "Otra entidad",
};

function payoutDestinationLabel(settings: PayoutSettings | null): string | null {
  if (!settings?.holderName?.trim()) return null;
  if (settings.method === "crypto") {
    const net = settings.cryptoNetwork.toUpperCase();
    const addr = settings.walletAddress;
    const short =
      addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
    return `USDT ${net} · ${short}`;
  }
  const bank =
    settings.bankName === "other"
      ? settings.bankNameOther || BANK_LABELS.other
      : BANK_LABELS[settings.bankName];
  const acct = settings.accountNumber;
  const masked = acct.length > 4 ? `****${acct.slice(-4)}` : acct;
  return `${bank} · ${masked}`;
}

function parseAmountInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function WithdrawEarnings() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [base, setBase] = useState<WithdrawalPreview | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchWithdrawalPreview();
    setBase(data);
    if (user) setPayoutSettings(loadPayoutSettings(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const amount = parseAmountInput(amountInput);

  const preview = useMemo(() => {
    if (!base) return null;
    if (amount <= 0) {
      return {
        ...base,
        grossAmount: 0,
        platformFeeAmount: 0,
        netAmount: 0,
      };
    }
    return calculateWithdrawalPreview(
      base.availableBalance,
      amount,
      base,
    );
  }, [base, amount]);

  const amountError = useMemo(() => {
    if (!amountInput.trim()) return null;
    if (amount <= 0) return t("modelPanel.withdrawAmountInvalid");
    if (amount < MIN_WITHDRAW)
      return t("modelPanel.withdrawAmountMin", {
        min: formatCop(MIN_WITHDRAW),
      });
    if (base && amount > base.availableBalance)
      return t("modelPanel.withdrawAmountExceeded");
    return null;
  }, [amountInput, amount, base, t]);

  const destination = payoutDestinationLabel(payoutSettings);
  const hasPayoutAccount =
    !!payoutSettings?.holderName?.trim() &&
    (payoutSettings.method === "bank"
      ? !!payoutSettings.accountNumber?.trim()
      : !!payoutSettings.walletAddress?.trim());

  const canWithdraw =
    !!preview &&
    amount >= MIN_WITHDRAW &&
    amount <= (base?.availableBalance ?? 0) &&
    !amountError &&
    hasPayoutAccount;

  const handleWithdraw = async () => {
    if (!preview || !canWithdraw) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const result = await requestWithdrawal(amount);
    setSubmitting(false);
    if (!result) {
      setError(t("modelPanel.withdrawError"));
      return;
    }
    const days =
      preview.processingDaysMin === preview.processingDaysMax
        ? String(preview.processingDaysMin)
        : `${preview.processingDaysMin}–${preview.processingDaysMax}`;
    setSuccess(
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
      <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse h-48" />
    );
  }

  const rows = [
    {
      label: t("modelPanel.withdrawGross"),
      value: amount > 0 ? formatCop(preview.grossAmount) : "—",
      icon: Banknote,
      muted: false,
    },
    {
      label: t("modelPanel.withdrawFee", {
        percent: String(preview.platformFeePercent),
      }),
      value: amount > 0 ? `−${formatCop(preview.platformFeeAmount)}` : "—",
      icon: Percent,
      muted: true,
    },
    {
      label: t("modelPanel.withdrawNet"),
      value: amount > 0 ? formatCop(preview.netAmount) : "—",
      icon: Wallet,
      muted: false,
      highlight: true,
    },
  ];

  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-neon-pink" />
            {t("modelPanel.withdrawTitle")}
          </h3>
          <p className="text-sm text-soft-white/50 mt-1">
            {t("modelPanel.withdrawSubtitle")}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-soft-white/40">
            {t("modelPanel.withdrawAvailable")}
          </p>
          <p className="text-2xl font-bold text-gold">
            {formatCop(base.availableBalance)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Input
          id="withdraw-amount"
          type="text"
          inputMode="numeric"
          label={t("modelPanel.withdrawAmountLabel")}
          placeholder={t("modelPanel.withdrawAmountPlaceholder")}
          value={amountInput}
          onChange={(e) => {
            setSuccess(null);
            setError(null);
            setAmountInput(e.target.value);
          }}
          error={amountError ?? undefined}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-soft-white/40">
            {t("modelPanel.withdrawMax", {
              max: formatCop(base.availableBalance),
            })}
          </p>
          <button
            type="button"
            className="text-xs text-neon-pink hover:underline"
            onClick={() => {
              setSuccess(null);
              setAmountInput(String(base.availableBalance));
            }}
          >
            {t("modelPanel.withdrawAll")}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-6">
        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-200">
            {t("modelPanel.withdrawWaitTitle")}
          </p>
          <p className="text-sm text-soft-white/60 mt-1">
            {t("modelPanel.withdrawWaitDesc", {
              min: String(preview.processingDaysMin),
              max: String(preview.processingDaysMax),
            })}
          </p>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {rows.map(({ label, value, icon: Icon, muted, highlight }) => (
          <li
            key={label}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl",
              highlight
                ? "bg-emerald-500/10 border border-emerald-500/30"
                : "bg-bg-main/50 border border-white/5",
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4",
                  highlight ? "text-emerald-400" : "text-soft-white/40",
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  highlight
                    ? "font-semibold text-emerald-100"
                    : "text-soft-white/70",
                )}
              >
                {label}
              </span>
            </div>
            <span
              className={cn(
                "font-bold",
                muted && amount > 0 && "text-red-400/90",
                highlight && amount > 0 && "text-emerald-400 text-lg",
                !muted && !highlight && "text-soft-white",
              )}
            >
              {value}
            </span>
          </li>
        ))}
      </ul>

      {destination && (
        <p className="text-xs text-soft-white/50 mb-4">
          {t("modelPanel.withdrawDestination")}:{" "}
          <span className="text-soft-white/80">{destination}</span>
        </p>
      )}

      {!hasPayoutAccount && (
        <p className="text-sm text-amber-400/90 mb-4">
          {t("modelPanel.withdrawNeedPayout")}
        </p>
      )}

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {success && (
        <div className="flex items-start gap-2 text-sm text-emerald-400 mb-4">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <Button
        className="w-full"
        disabled={
          submitting ||
          !canWithdraw ||
          base.availableBalance <= 0 ||
          !!success
        }
        onClick={handleWithdraw}
      >
        <ArrowDownToLine className="w-4 h-4" />
        {submitting
          ? t("modelPanel.withdrawProcessing")
          : t("modelPanel.withdrawCta")}
      </Button>

      <p className="text-xs text-soft-white/40 text-center mt-3">
        {t("modelPanel.withdrawFeeNote", {
          percent: String(preview.platformFeePercent),
        })}
      </p>
    </div>
  );
}
