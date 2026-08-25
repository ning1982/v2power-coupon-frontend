// 后台管理 API 层。当前为 mock（后端未实现），契约已对齐 docs/api/v2power-coupon-ADMIN-backend.md。
// 生产接入时：把各 fetch* 函数内的 mock 返回替换为真实 fetch("/coupon_api/admin/...")。

export type Batch = {
  batch_id: string;
  batch_name: string;
  created_at: string;
  voucher_count: number;
  redeemed_count: number;
  amount: number | null;
};

export type VoucherStatus = "pending" | "redeemed";
export type VoucherRow = {
  token: string;
  amount: number | null;
  status: VoucherStatus;
  redeemed_email: string | null;
  redeemed_at: string | null;
};

export type BatchesResult = { total: number; items: Batch[] };
export type BatchDetail = {
  batch_id: string;
  batch_name: string;
  created_at: string;
  amount: number | null;
  total: number;
  redeemed: number;
  pending: number;
  filtered_total: number;
  vouchers: VoucherRow[];
};

// ---------- 鉴权（mock，前端守卫） ----------
const TOKEN_KEY = "v2p_admin_token";
const MOCK_TOKEN = "mock-admin-token";

export function isAuthed(): boolean {
  return localStorage.getItem(TOKEN_KEY) === MOCK_TOKEN;
}
export function login(password: string): boolean {
  // 生产：POST /coupon_api/admin/login。此处 mock，密码 demo
  if (password === "demo") {
    localStorage.setItem(TOKEN_KEY, MOCK_TOKEN);
    return true;
  }
  return false;
}
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------- mock 数据 ----------
const BATCHES: Batch[] = [
  { batch_id: "a6b47e1f860e488480618696bc84687c", batch_name: "202608-BP夏季促销", created_at: "2026-08-25T14:32:00Z", voucher_count: 500, redeemed_count: 214, amount: 10 },
  { batch_id: "c9d28f3a9b1e4c5d8f2a7e6b5c4d3e2f", batch_name: "202608-格林威治酒店", created_at: "2026-08-24T09:15:00Z", voucher_count: 400, redeemed_count: 268, amount: 5.5 },
  { batch_id: "f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5", batch_name: "202608-试运行", created_at: "2026-08-20T16:48:00Z", voucher_count: 340, redeemed_count: 0, amount: null },
];

function maskForMock(tok: string): string {
  return tok.slice(0, 1).toLowerCase() + "***" + tok.slice(-1).toLowerCase() + "@v2power.io";
}

function genVouchers(batch: Batch): VoucherRow[] {
  const rows: VoucherRow[] = [];
  const redeemedN = batch.redeemed_count;
  for (let i = 0; i < batch.voucher_count; i++) {
    const redeemed = i < redeemedN;
    const tok = `V2P-${batch.batch_id.slice(0, 4).toUpperCase()}${String(1000 + i)}`;
    rows.push({
      token: tok,
      amount: batch.amount,
      status: redeemed ? "redeemed" : "pending",
      redeemed_email: redeemed ? maskForMock(tok) : null,
      redeemed_at: redeemed ? `2026-08-${String((i % 28) + 1).padStart(2, "0")}T1${i % 10}:0${i % 6}:00Z` : null,
    });
  }
  return rows;
}

const voucherCache = new Map<string, VoucherRow[]>();
function getVouchers(batch: Batch): VoucherRow[] {
  let v = voucherCache.get(batch.batch_id);
  if (!v) {
    v = genVouchers(batch);
    voucherCache.set(batch.batch_id, v);
  }
  return v;
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ---------- API ----------
export async function fetchBatches(page = 1, size = 20): Promise<BatchesResult> {
  await delay();
  const start = (page - 1) * size;
  return { total: BATCHES.length, items: BATCHES.slice(start, start + size) };
}

export async function fetchBatchDetail(
  batchId: string,
  opts: { page?: number; size?: number; status?: "all" | "redeemed" | "pending"; q?: string } = {},
): Promise<BatchDetail> {
  await delay();
  const batch = BATCHES.find((b) => b.batch_id === batchId);
  if (!batch) throw new Error("batch not found");
  let vouchers = getVouchers(batch);
  if (opts.status && opts.status !== "all") vouchers = vouchers.filter((v) => v.status === opts.status);
  if (opts.q) {
    const q = opts.q.toUpperCase();
    vouchers = vouchers.filter((v) => v.token.toUpperCase().includes(q));
  }
  const size = opts.size ?? 100;
  const page = opts.page ?? 1;
  const start = (page - 1) * size;
  return {
    batch_id: batch.batch_id,
    batch_name: batch.batch_name,
    created_at: batch.created_at,
    amount: batch.amount,
    total: batch.voucher_count,
    redeemed: batch.redeemed_count,
    pending: batch.voucher_count - batch.redeemed_count,
    filtered_total: vouchers.length,
    vouchers: vouchers.slice(start, start + size),
  };
}

export function fmtAmount(n: number | null): string {
  if (n === null) return "\u2014";
  return "\u00A3" + (n % 1 !== 0 ? n.toFixed(2) : n.toString());
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
