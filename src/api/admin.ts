// Minimal Admin API - only existing v8 endpoints, no extensions
// Available: POST /coupon_api/admin/import , GET /admin/qr?token= , GET /admin/batch/{id}/qrs
// Missing: auth / batch list / detail filter / amount - not in this build
const API_BASE = (import.meta.env.VITE_API_TARGET as string) || "";
export type ImportResult = {
  batch_id: string;
  imported: number;
  skipped: number;
  tokens: string[];
};
export async function importVouchers(file: File): Promise<ImportResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/coupon_api/admin/import`, { method: "POST", body: fd });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.code !== 0 || !json.data) {
    throw new Error((json && json.msg) || `Import failed (HTTP ${res.status}）`);
  }
  return { batch_id: json.data.batch_id, imported: json.data.imported, skipped: json.data.skipped, tokens: json.data.tokens ?? [] };
}
export function getQrUrl(token: string): string {
  return `${API_BASE}/coupon_api/admin/qr?token=${encodeURIComponent(token)}`;
}
export function getBatchZipUrl(batchId: string): string {
  return `${API_BASE}/coupon_api/admin/batch/${batchId}/qrs`;
}
export async function downloadBatchZip(batchId: string) {
  const res = await fetch(getBatchZipUrl(batchId));
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `batch-${batchId}-qrs.zip`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
// Simple local auth guard (backend v8 has no auth, password is demo)
const TOKEN_KEY = "v2p_admin_token";
const MOCK_TOKEN = "mock-admin-token";
export function isAuthed(): boolean { return localStorage.getItem(TOKEN_KEY) === MOCK_TOKEN; }
export function login(password: string): boolean { if (password === "demo") { localStorage.setItem(TOKEN_KEY, MOCK_TOKEN); return true; } return false; }
export function logout(): void { localStorage.removeItem(TOKEN_KEY); }
// Full version pending backend - not called in minimal build
export type Batch = { batch_id: string; batch_name: string; created_at: string; voucher_count: number; redeemed_count: number; amount: number | null };
export type VoucherRow = { token: string; amount: number | null; status: "pending"|"redeemed"; redeemed_email: string|null; redeemed_at: string|null };
export type BatchesResult = { total: number; items: Batch[] };
export type BatchDetail = { batch_id: string; batch_name: string; created_at: string; amount: number|null; total: number; redeemed: number; pending: number; filtered_total: number; vouchers: VoucherRow[] };
export async function fetchBatches(..._args: any[]): Promise<BatchesResult> { throw new Error("Not implemented: GET /admin/batches - backend pending"); }
export async function fetchBatchDetail(..._args: any[]): Promise<BatchDetail> { throw new Error("Not implemented: GET /admin/batch/{id} - backend pending"); }
export function fmtAmount(n: number | null): string { if (n===null) return "—"; return "£"+(n%1!==0?n.toFixed(2):String(n)); }
export function fmtDate(iso: string): string { const d=new Date(iso); const p=(x:number)=>String(x).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
