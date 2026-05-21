const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface PayoutConfig {
  platformFeePercent: number;
  processingDaysMin: number;
  processingDaysMax: number;
}

export interface WithdrawalPreview extends PayoutConfig {
  availableBalance: number;
  grossAmount: number;
  platformFeeAmount: number;
  netAmount: number;
  currency: string;
}

export interface WithdrawalResult extends WithdrawalPreview {
  withdrawalId: string;
  status: string;
  message: string;
}

const DEMO_PREVIEW: WithdrawalPreview = {
  platformFeePercent: 15,
  processingDaysMin: 2,
  processingDaysMax: 3,
  availableBalance: 892_000,
  grossAmount: 892_000,
  platformFeeAmount: 133_800,
  netAmount: 758_200,
  currency: "COP",
};

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("marturbs_token")
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPayoutConfig(): Promise<PayoutConfig> {
  try {
    const res = await fetch(`${API_URL}/payout/config`);
    if (res.ok) return res.json();
  } catch {
    /* offline */
  }
  return {
    platformFeePercent: DEMO_PREVIEW.platformFeePercent,
    processingDaysMin: DEMO_PREVIEW.processingDaysMin,
    processingDaysMax: DEMO_PREVIEW.processingDaysMax,
  };
}

export function calculateWithdrawalPreview(
  availableBalance: number,
  amount: number,
  config: PayoutConfig,
): WithdrawalPreview {
  const grossAmount = Math.min(Math.max(0, Math.floor(amount)), availableBalance);
  const platformFeeAmount = Math.round(
    (grossAmount * config.platformFeePercent) / 100,
  );
  return {
    ...config,
    availableBalance,
    grossAmount,
    platformFeeAmount,
    netAmount: grossAmount - platformFeeAmount,
    currency: "COP",
  };
}

export async function fetchWithdrawalPreview(
  amount?: number,
): Promise<WithdrawalPreview> {
  const query =
    amount !== undefined && amount > 0 ? `?amount=${amount}` : "";
  try {
    const res = await fetch(
      `${API_URL}/models/me/withdrawal-preview${query}`,
      { headers: authHeaders() },
    );
    if (res.ok) return res.json();
  } catch {
    /* offline */
  }
  const config = await fetchPayoutConfig();
  const availableBalance = DEMO_PREVIEW.availableBalance;
  const grossAmount =
    amount !== undefined && amount > 0 ? amount : availableBalance;
  return calculateWithdrawalPreview(availableBalance, grossAmount, config);
}

export async function requestWithdrawal(
  amount: number,
): Promise<WithdrawalResult | null> {
  try {
    const res = await fetch(`${API_URL}/models/me/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ amount }),
    });
    if (res.ok) return res.json();
  } catch {
    /* offline */
  }
  const preview = await fetchWithdrawalPreview(amount);
  return {
    ...preview,
    withdrawalId: `demo-${Date.now()}`,
    status: "pending",
    message: "",
  };
}
