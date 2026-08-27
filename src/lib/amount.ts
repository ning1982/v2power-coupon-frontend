// Amount source: URL param ?amt=<number> (injected by QR generator, see docs/api).
// Returns null if missing/invalid; caller falls back to "Claim your charging voucher".
export function parseAmount(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export function formatAmount(n: number): string {
  const hasPence = n % 1 !== 0;
  return "\u00A3" + (hasPence ? n.toFixed(2) : n.toString());
}
