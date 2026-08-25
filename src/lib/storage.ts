const KEY = "voucher_draft";
export function saveDraft(data: Record<string, unknown>) {
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}
export function loadDraft<T>(): T | null {
  try { const v = sessionStorage.getItem(KEY); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
export function clearDraft() {
  try { sessionStorage.removeItem(KEY); } catch {}
}
// beforeunload handler removed per review #3: draft must survive refresh, cleared only on success
