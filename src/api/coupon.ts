import { maskEmail } from "../lib/errorMap";

export type RedeemPayload = {
  email: string;
  confirmed_email: string;
  token: string;
  captcha_token?: string;
};
export type RedeemResponse = {
  code: number;
  msg?: string;
  data?: { email_sent: boolean; email: string; message: string };
};
const REDEEM_TIMEOUT_MS = 30000;

export async function redeem(payload: RedeemPayload): Promise<RedeemResponse> {
  const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_MOCK === "1";
  if (mockEnabled) {
    const norm = payload.token.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (norm === "V2PTEST1234" || norm.startsWith("V2PTEST")) {
      await new Promise((r) => setTimeout(r, 600));
      // mock also returns masked email, consistent with production (API v8: data.email is masked)
      return { code: 0, data: { email_sent: true, email: maskEmail(payload.email), message: "mock success" } };
    }
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDEEM_TIMEOUT_MS);
  try {
    const res = await fetch("/coupon_api/coupon/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await res.text();
    try {
      return JSON.parse(text) as RedeemResponse;
    } catch {
      return { code: res.ok ? 0 : 500, msg: text.slice(0, 500) || `HTTP ${res.status}` };
    }
  } finally {
    clearTimeout(timeout);
  }
}

// token contract: keep hyphen (print format V2P-XXXXXXXX), backend matches exactly.
// Note: do not strip hyphen, consistent with backend contract.
export function normalizeToken(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 64);
}
