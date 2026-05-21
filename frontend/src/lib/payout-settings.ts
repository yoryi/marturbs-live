export type PayoutMethod = "crypto" | "bank";

export type CryptoNetwork = "trc20" | "erc20" | "bep20";

export type BankName =
  | "nequi"
  | "bancolombia"
  | "davivienda"
  | "bogota"
  | "bbva"
  | "occidente"
  | "popular"
  | "other";

export interface PayoutSettings {
  method: PayoutMethod;
  holderName: string;
  documentId: string;
  email: string;
  cryptoNetwork: CryptoNetwork;
  walletAddress: string;
  bankName: BankName;
  bankNameOther: string;
  accountType: "savings" | "checking";
  accountNumber: string;
}

export const DEFAULT_PAYOUT: PayoutSettings = {
  method: "bank",
  holderName: "",
  documentId: "",
  email: "",
  cryptoNetwork: "trc20",
  walletAddress: "",
  bankName: "nequi",
  bankNameOther: "",
  accountType: "savings",
  accountNumber: "",
};

const STORAGE_PREFIX = "marturbs_payout_";

/** Solo persiste el método activo; limpia datos del otro método */
export function sanitizePayout(settings: PayoutSettings): PayoutSettings {
  const shared = {
    method: settings.method,
    holderName: settings.holderName,
    documentId: settings.documentId,
    email: settings.email,
  };

  if (settings.method === "crypto") {
    return {
      ...DEFAULT_PAYOUT,
      ...shared,
      cryptoNetwork: settings.cryptoNetwork,
      walletAddress: settings.walletAddress,
    };
  }

  return {
    ...DEFAULT_PAYOUT,
    ...shared,
    bankName: settings.bankName,
    bankNameOther: settings.bankNameOther,
    accountType: settings.accountType,
    accountNumber: settings.accountNumber,
  };
}

export function loadPayoutSettings(userId: string): PayoutSettings {
  if (typeof window === "undefined") return DEFAULT_PAYOUT;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return DEFAULT_PAYOUT;
    return sanitizePayout({ ...DEFAULT_PAYOUT, ...JSON.parse(raw) });
  } catch {
    return DEFAULT_PAYOUT;
  }
}

export function savePayoutSettings(userId: string, settings: PayoutSettings) {
  const sanitized = sanitizePayout(settings);
  localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(sanitized));
}

export function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}
