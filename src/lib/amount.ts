// 面额来源：URL 参数 ?amt=<数字>（二维码生成端注入，见 docs/api 面额需求）。
// 解析失败或缺失返回 null，由调用方走降级文案（"Claim your charging voucher"）。
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
