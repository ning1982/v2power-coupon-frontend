import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchBatchDetail, fmtAmount, fmtDate, type BatchDetail } from "../../api/admin";
import StatusChip from "../../components/admin/StatusChip";
import Pagination from "../../components/admin/Pagination";
import StatCard from "../../components/admin/StatCard";

const PAGE_SIZE = 20;

export default function BatchDetailView() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const status = (sp.get("status") as "all" | "redeemed" | "pending") || "all";
  const q = sp.get("q") || "";
  const page = Number(sp.get("page") || "1");

  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let on = true;
    setLoading(true);
    fetchBatchDetail(id, { page, size: PAGE_SIZE, status, q })
      .then((d) => { if (on) { setDetail(d); setLoading(false); } })
      .catch(() => { if (on) { setDetail(null); setLoading(false); } });
    return () => { on = false; };
  }, [id, page, status, q]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== "page") next.delete("page");
    setSp(next);
  };

  if (!detail) {
    return <div className="p-6 text-on-surface-variant">{loading ? "Loading…" : "Batch not found"}</div>;
  }

  const filters: Array<{ key: string; label: string }> = [
    { key: "all", label: "All" },
    { key: "redeemed", label: "Redeemed" },
    { key: "pending", label: "Pending" },
  ];

  return (
    <div className="p-6 max-w-[1120px]">
      <div className="flex items-center gap-3">
        <button onClick={() => nav("/admin")} className="text-sm text-primary font-medium">← Back</button>
        <h1 className="text-xl font-semibold text-on-surface">{detail.batch_name}</h1>
        <span className="font-mono text-xs text-on-surface-variant">{detail.batch_id.slice(0, 10)}…</span>
        <span className="flex-1" />
        <button onClick={() => nav(`/admin/print/${id}`)} className="h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-medium">Print cards</button>
        <button className="h-10 px-5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium">Download QR ZIP</button>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <StatCard label="Vouchers" value={detail.total.toLocaleString()} />
        <StatCard label="Redeemed" value={detail.redeemed.toLocaleString()} />
        <StatCard label="Pending" value={detail.pending.toLocaleString()} />
        <StatCard label="Amount" value={fmtAmount(detail.amount)} />
      </div>

      <div className="bg-surface-lowest rounded-[16px] shadow-m3-1 mt-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant flex items-center gap-3">
          <h2 className="text-sm font-semibold text-on-surface">Vouchers</h2>
          <span className="flex-1" />
          <input
            value={q}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search token…"
            aria-label="Search token"
            className="h-9 px-3 rounded-full border border-outline bg-transparent text-sm outline-none focus:border-primary w-56"
          />
        </div>
        <div className="px-5 py-2 flex gap-2 border-b border-outline-variant">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setParam("status", f.key)}
              className={`h-8 px-4 rounded-full text-sm font-medium ${status === f.key ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:bg-surface-high"}`}
            >{f.label}</button>
          ))}
        </div>
        <table className="w-full" aria-label="Voucher list">
          <thead>
            <tr>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Token</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Amount</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Status</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Redeemed to</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Redeemed at</th>
              <th scope="col" className="text-right px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">QR</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">Loading…</td></tr>
            ) : detail.vouchers.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">No vouchers match.</td></tr>
            ) : detail.vouchers.map((v) => (
              <tr key={v.token} className="hover:bg-surface-low">
                <td className="px-5 py-3 font-mono text-xs">{v.token}</td>
                <td className="px-5 py-3 font-medium tabular-nums">{fmtAmount(v.amount)}</td>
                <td className="px-5 py-3"><StatusChip status={v.status} /></td>
                <td className="px-5 py-3 text-on-surface-variant">{v.redeemed_email ?? "—"}</td>
                <td className="px-5 py-3 text-on-surface-variant">{v.redeemed_at ? fmtDate(v.redeemed_at) : "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button className="text-sm text-primary font-medium" aria-label={`Download QR for ${v.token}`}>PNG</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} size={PAGE_SIZE} total={detail.filtered_total} onPage={(p) => setParam("page", String(p))} />
      </div>
    </div>
  );
}
